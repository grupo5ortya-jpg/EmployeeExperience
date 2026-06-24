# Envío de emails (Alertas → SMTP)

Esta guía es para habilitar/deshabilitar/probar el envío real de emails sin necesidad de leer el código fuente. Implementación real en `server/backend/utils/mailer.js` + `server/backend/utils/alertMailer.js`, disparada desde los hooks `afterCreate`/`afterBulkCreate` de `server/backend/models/Alert.js`.

## Cómo funciona (resumen)

- Cada vez que se crea una `Alert` en el sistema (tareas vencidas, encuestas pendientes, OKRs en riesgo, etc.), un hook intenta mandar un email — **además** de la alerta in-app, no en su lugar.
- Si el email falla o está deshabilitado, la `Alert` se crea igual. El email es un efecto secundario "fire-and-forget": nunca bloquea ni rompe el endpoint/cron que generó la alerta.
- Hay dos tipos de destinatario según el tipo de alerta:
  - **Alertas de empleado** (`TASK_OVERDUE`, `OKR_ASSIGNED`, `CONTINUOUS_FEEDBACK_RECEIVED`, etc.) → se le manda al email institucional del empleado puntual afectado.
  - **Alertas de HR** (`EXIT_INTERVIEW_COMPLETED`, `OKR_STAGNANT`, `JOB_OPENING_APPLICATION`, etc.) → se les manda a **todos** los usuarios con rol Talento.
- El contenido es básico a propósito: asunto genérico + el mismo texto de la alerta + un link a `FRONTEND_URL`. No hay plantillas HTML elaboradas.

## Variables de entorno

Viven en `server/backend/.env.dev` (local) o como variables de entorno del contenedor `backend` en `docker-compose.yml` (root del repo, vía un archivo `.env` en la raíz — ver `.env.docker.example`).

| Variable | Default | Descripción |
|---|---|---|
| `EMAIL_ENABLED` | `false` | Interruptor general. En `false`, **ningún** código intenta conectarse a un servidor SMTP — el sistema sigue funcionando 100% in-app. |
| `SMTP_HOST` | (vacío) | Host del servidor SMTP. |
| `SMTP_PORT` | `587` | Puerto SMTP. `587` = STARTTLS, `465` = SSL implícito. |
| `SMTP_SECURE` | `false` | `true` solo si `SMTP_PORT=465`. Para `587` debe ser `false`. |
| `SMTP_USER` | (vacío) | Usuario de autenticación SMTP. |
| `SMTP_PASSWORD` | (vacío) | Contraseña/App Password de autenticación SMTP. |
| `SMTP_FROM` | (vacío, cae a `SMTP_USER`) | Remitente del email. Con Gmail, **debe** coincidir con `SMTP_USER` (Gmail lo fuerza). |

**Importante (Docker):** estas variables del backend se leen en runtime al arrancar el contenedor — alcanza con `docker compose up -d` (recrea el contenedor) después de editar el `.env` de la raíz, sin necesidad de rebuild. Esto es distinto de `VITE_API_URL` (frontend), que sí se "bakea" en build time.

## Cómo habilitar emails — ejemplo con Gmail (cuenta de prueba/temporal)

1. La cuenta de Gmail necesita **2-Step Verification activada** (sin esto, Google no expone App Passwords y el login SMTP normal es rechazado).
2. Generar una App Password: `myaccount.google.com/apppasswords` → app "Mail" → copiar el código de 16 caracteres y **sacarle los espacios**.
3. Completar:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu.cuenta@gmail.com
SMTP_PASSWORD=elapppasswordsinespacios
SMTP_FROM=tu.cuenta@gmail.com
```

4. Reiniciar/recrear el backend (`docker compose up -d backend` o reiniciar el proceso local).

### Errores comunes que impiden el envío

- Usar la contraseña normal de Gmail en vez de la App Password → `535-5.7.8 Username and Password not accepted`.
- Dejar espacios en la App Password.
- `SMTP_FROM` distinto de `SMTP_USER` → Gmail lo rechaza/reescribe.
- `SMTP_PORT`/`SMTP_SECURE` desalineados (465 sin `secure:true`, o 587 con `secure:true`) → falla el handshake TLS.
- Primer envío desde una IP nueva (ej. un host/Docker en la nube) → Gmail puede bloquear el login hasta que se confirme manualmente "Sí, fui yo" desde esa cuenta.
- Límite de Gmail (~500 emails/día en cuenta normal) — no apto para volumen de producción real, solo para validación puntual.

## Cómo deshabilitar emails

Poner `EMAIL_ENABLED=false` (o dejar la variable sin definir) y reiniciar/recrear el backend. No hace falta tocar el resto de las variables `SMTP_*` — quedan ignoradas por completo. Las alertas in-app siguen funcionando exactamente igual.

## Cómo probar el sistema sin una cuenta de email real

Para validar el flujo completo (contenido del mail, destinatarios, hooks) sin mandar nada a una bandeja real, usar una cuenta de prueba [Ethereal](https://ethereal.email/):

```js
// node -e "..."
const nodemailer = require('nodemailer');
nodemailer.createTestAccount().then(console.log);
```

Esto genera `user`/`pass` + `smtp.host`/`smtp.port` de un servidor SMTP real (no entrega a ninguna bandeja real). Completar las variables igual que con Gmail, pero con estos datos. Cada email enviado deja un link de "Preview" en los logs del backend (`[mailer] Preview: https://ethereal.email/message/...`) donde se ve el contenido exacto tal como se habría mandado.

Para disparar un email de prueba sin pasar por la UI completa, alcanza con crear una `Alert` cualquiera desde un script (`node -e "..."` cargando `connection/sequelize.js` + `connection/relations.js`) o ejercitar un endpoint real que ya cree alertas (ej. `POST /continuous-feedback`).

## Resiliencia ante fallas de SMTP (ya validado, ver auditoría EXP-DEV-35 / EXP-AUDIT)

- Un SMTP inalcanzable, mal configurado, o un módulo de mailing roto **nunca** hace fallar la creación de la `Alert` ni el endpoint que la disparó — todo el camino de envío está envuelto en `try/catch` en capas (`models/Alert.js` hooks → `alertMailer.js` → `mailer.js`).
- Los errores de envío se loguean (`[mailer] Error enviando email: ...`) de forma asíncrona, sin bloquear ni crashear el proceso.
- Validado en vivo (sesión 2026-06-23/24): boot de Docker Compose sin ninguna variable `SMTP_*` configurada (arranca limpio), y con `SMTP_HOST` inválido a propósito (`POST /continuous-feedback` sigue devolviendo 201, la `Alert` se persiste igual, el error queda logueado).

## Limitaciones conocidas

- No hay reintentos automáticos ni circuit breaker — un error de SMTP (real o de configuración) se loguea, pero no se reintenta.
- El contenido del email es texto plano básico, sin plantillas HTML.
- La lista de destinatarios HR (`HR_ALERT_TYPES`) es "todos los usuarios con rol Talento" — no es configurable por variable de entorno todavía.
- La validación end-to-end con una cuenta Gmail real (entrega efectiva a una bandeja de verdad) es opcional y quedó pendiente a pedido del equipo — no bloquea la entrega del módulo. Se puede hacer puntualmente más adelante siguiendo la sección "Gmail" de esta guía.
