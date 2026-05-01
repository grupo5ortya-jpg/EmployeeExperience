# Especificación Funcional

## Plataforma integral de Employee Experience con IA

**Proyecto Final – Analista de Sistemas – Universidad ORT**

---

## 1. Objetivo

Construir una aplicación web que integre las seis áreas del ciclo de vida del colaborador (onboarding, desempeño, talento, objetivos, aprendizaje, offboarding) en un único producto, con al menos tres usos no triviales de IA.  

La consultora aporta la visión funcional; el equipo toma todas las decisiones técnicas y de diseño salvo las restricciones fijadas en la sección 3.

---

## 2. Roles

- **Colaborador**: usa la plataforma sobre sí mismo (onboarding, feedback, objetivos, carrera, aprendizaje).
- **Líder**: todo lo del Colaborador, más visión consolidada de las personas que le reportan.
- **RRHH**: configura procesos, administra usuarios y organigrama, accede a tableros globales, gestiona offboarding y alumni.

El equipo puede proponer sub-roles si lo justifica. La matriz detallada de permisos es un entregable del equipo.

---

## 3. Restricciones técnicas

- Frontend, backend y base de datos como componentes separados y dockerizados.  
- Todo el sistema se levanta con un único `docker compose up`.  
- Frontend en un framework moderno (React, Vue, Angular, Svelte o equivalente).  
- Backend en un lenguaje de industria (Node, Python, Java, .NET, Go).  
- Base relacional o documental a elección.  
- Datos de ejemplo precargados (20-30 empleados ficticios coherentes) que permitan demostrar todos los flujos sin carga manual.  

Todo lo demás (modelo de datos, librerías, patrones, estructura, estilos) es decisión del equipo y se documenta como tal.

---

## 4. Módulos funcionales

Para cada módulo se listan las funcionalidades obligatorias. Las decisiones de implementación (modelado, UX, reglas finas, umbrales, cálculos) quedan a criterio del equipo salvo indicación explícita.

---

### 4.1 Onboarding

- Plantillas configurables por RRHH (tareas con responsable, vencimiento, tipo) que se instancian al alta de cada ingreso.
- Checklist personal para el colaborador y vista consolidada para líder y RRHH con alertas de tareas vencidas.

**IA – Matching de mentor**  
Sugiere 2-3 candidatos a compañero guía con justificación en lenguaje natural. La decisión final es humana.

**Pulso 30-60-90**  
Micro-encuestas automáticas con preguntas cerradas y al menos una abierta.

**IA – Análisis de texto libre**  
Clasifica sentimiento y extrae temas de las respuestas abiertas; dispara alertas al líder si detecta señales negativas.

---

### 4.2 Desempeño y feedback 360°

- Feedback continuo: cualquier colaborador puede dejar Reconocimientos (visibles) o Sugerencias (privadas) a otro en cualquier momento.
- Ciclos de evaluación 360 configurables por RRHH con:
  - Autoevaluación
  - Líder
  - Pares (2-4, validados por el líder)
  - Reportes directos si aplica

- Informe de cierre con promedios por competencia y comentarios agrupados.  
- Anonimato garantizado: el grupo de pares solo se reporta si hay al menos 3 respuestas.

**IA – Gap analysis**  
Compara los resultados contra el perfil ideal del puesto y genera una narrativa con fortalezas, brechas y acciones sugeridas.

---

### 4.3 Mapeo de talento y carrera

- Catálogo de puestos con competencias, skills y nivel esperado, mantenido por RRHH.
- Matriz 9-Box automática: ubicación en Desempeño vs Potencial a partir de evaluaciones, objetivos y pulso.  
  - La fórmula de cada eje la define el equipo y se documenta.

**IA – Simulador de carrera**  
El colaborador elige un puesto objetivo; el sistema calcula brechas y genera un plan de desarrollo con cursos, experiencias y tips de soft skills.

- Sección **Próximos pasos** en la home del colaborador con 2-3 acciones recomendadas.

---

### 4.4 Objetivos (OKR / KPI)

- Definición de objetivos por período (trimestral/anual) con:
  - Métrica
  - Valor objetivo
  - Responsable
- Soporte de jerarquía (objetivo-padre).
- Actualización de progreso con histórico y dashboards por colaborador, equipo y empresa.

- Alertas automáticas cuando un objetivo está estancado o por debajo del avance esperado.  
  - El criterio exacto lo define el equipo.

---

### 4.5 Aprendizaje (LXP)

- Catálogo de cursos con:
  - Skill asociada
  - Duración
  - Modalidad
  - Link

- Registro de inscripción, progreso y carga de certificado.

**IA – Recomendaciones personalizadas**  
3-5 cursos sugeridos en la home del colaborador según sus brechas y plan de desarrollo activo, con explicación del motivo.

- CV interno: agregación automática de certificaciones y cursos completados al perfil, visible para el colaborador y RRHH.

---

### 4.6 Offboarding y alumni

- Proceso de salida con checklist inverso al onboarding:
  - Devolución de activos
  - Revocación de accesos
  - Traspaso

- Entrevista de salida digital con preguntas cerradas y abiertas, completable antes o hasta 30 días después del último día.

**IA – Análisis de salidas**  
Tablero agregado con temas recurrentes y detección temprana cuando un área concentra salidas por la misma causa.  
Anonimato en vistas agregadas.

- Red de alumni:
  - Flag de re-contratable
  - Etiquetas
  - Búsqueda por skills/área para *boomerang employees*

---

## 5. Entregables y criterios de aceptación

- Repositorio Git con código, `docker-compose.yml` y README que explique:
  - Cómo levantar el proyecto
  - Cómo logearse con cada rol

- Documento de arquitectura:
  - Componentes
  - Modelo de datos
  - Despliegue

- Documento de decisiones técnicas:
  - Stack elegido
  - Manejo de errores
  - Costos de IA

- Manual de usuario por rol
- Plan de pruebas:
  - Casos manuales
  - Tests automáticos sobre auth, permisos y un módulo a elección

- Presentación final con demo en vivo

---

**EF – Plataforma Employee Experience**