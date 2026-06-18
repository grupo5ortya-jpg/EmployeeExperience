# Employee Experience

## Ejecución:
- En .../EmployeeExperience/server/backend/ crear 2 copias de ".env.example" llamados ".env.dev" y ".env.prod". Completar las constantes del entorno.
- Desde la carpeta del proyecto ".../EmployeeExperience".
- $ npm i
- $ npm run init
- $ npm run dev
- colaborador5@example.com	pass5

- Talento: empleados activos, alertas sin leer, ciclos 360° activos, tareas de onboarding pendientes.

- Líder: evaluaciones pendientes de completar, alertas de equipo, tareas del equipo para aprobar, + lista de evaluaciones pendientes con links directos al formulario.

- Colaborador: tareas pendientes, evaluaciones pendientes, encuestas de pulso, alertas + listas detalladas de sus tareas y evaluaciones con links directos.

- Placeholders Objetivos y LMS con card "Próximamente" para cuando se construyan esas features.

- ┌───────────────────────────┬──────────┬───────────────────────────┐
│           Email           │ Password │            Rol            │
├───────────────────────────┼──────────┼───────────────────────────┤
│ talento1@example.com      │ pass1    │ Talento (HR)              │
├───────────────────────────┼──────────┼───────────────────────────┤
│ talento2@example.com      │ pass2    │ Talento (HR)              │
├───────────────────────────┼──────────┼───────────────────────────┤
│ alumni3@example.com       │ pass3    │ Alumni                    │
├───────────────────────────┼──────────┼───────────────────────────┤
│ alumni4@example.com       │ pass4    │ Alumni                    │
├───────────────────────────┼──────────┼───────────────────────────┤
│ colaborador5@example.com  │ pass5    │ Colaborador               │
├───────────────────────────┼──────────┼───────────────────────────┤
│ colaborador6@example.com  │ pass6    │ Colaborador               │
├───────────────────────────┼──────────┼───────────────────────────┤
│ ...                       │ ...      │ Colaborador (hasta el 14) │
├───────────────────────────┼──────────┼───────────────────────────┤
│ lider15@example.com       │ pass15   │ Líder                     │
├───────────────────────────┼──────────┼───────────────────────────┤
│ lider16@example.com       │ pass16   │ Líder                     │
├───────────────────────────┼──────────┼───────────────────────────┤
│ lider17@example.com       │ pass17   │ Líder
├───────────────────────────┼──────────┼───────────────────────────┤
│ lider18@example.com       │ pass18   │ Líder                     │
├───────────────────────────┼──────────┼──────────────────────────
│ colaborador19@example.com │ pass19   │ Colaborador               │
├───────────────────────────┼──────────┼──────────────────────────
│ talento20@example.com     │ pass20   │ Talento (HR)              │
└───────────────────────────┴──────────┴───────────────────────────┘

* Estados OKR

COMPLETED
- currentValue >= targetValue

STAGNANT
- Sin actualizaciones de progreso durante 30 días
- Genera alerta automática

AT_RISK
- El progreso actual está por debajo del esperado según el tiempo transcurrido
- Fórmula:
  expectedProgress = (daysElapsed / totalDays) * 100

- Regla:
  actualProgress < expectedProgress - 15%

- Genera alerta automática

ON_TRACK
- No cumple ninguna condición anterior

-----------------------------------

Ejemplo

Objetivo:
100%

Tiempo total:
100 días

Días transcurridos:
50

expectedProgress = 50%

actualProgress = 25%

→ Estado: AT_RISK

-----------------------------------

Visibilidad

RRHH/Talentos:
- Ve todos los OKR
- Ve alertas
- Ve estados

Responsable:
- Ve únicamente sus OKR
- Actualiza progreso

-----------------------------------

Alertas

STAGNANT:
- Sin avances durante 30 días

AT_RISK:
- Progreso significativamente por debajo del esperado

No generar alertas duplicadas para el mismo objetivo.


- Martin preguntas:


- martin agregar:
* diplomas anteriores del empleado.✅
---

_TODO_ mails✖️

* último módulo offboarding:✅
* iniciar proceso en offboardingHome rh agregar cambiar estado a recontratable o no✅
- Si cambia rol que cambie la vista. ✅
- Talentos recibe alerta con boton para direccionar y setear datos del perfil✅

* Blindar templates offboarding y onboarding, opcional poder hacerlo con otros.✅
* Tiene 30 dias para completar cuestionario ✅
* existe "mi perfil" y lider/colaborador puede cambiar sus campos personales.✅
* Mejoria de mentoria por ia, toma scores de feedback 360.✅

* Simulador de carrera usa vacantes disponibles pero se basa tambien en los cursos? intentar dirigir si hay uno existente.
* en talentos @job-openings borrar skills
------------------------------------------------------------------------

*  Auditoría: revisé todo el backend y todo el frontend (rutas, controllers, modelos, componentes, hooks, services) y entregué dos reportes con hallazgos clasificados CRITICAL/MEDIUM/LOW antes de tocar nada.

Bugs corregidos (7): import roto en Team.js, cron de OKR nunca arrancado, bypass de RoleRoute por rutas duplicadas en router.js (4 páginas), authorize() faltante en 7 archivos de rutas, GET /employees sin filtrar por Líder, AllAssignmentsPage mostrando toda la empresa, y una constante (COURSE_ENROLLMENT) que un commit de un compañero había borrado por error y tiraba el backend entero.

Typo 'SUBMITED': corregido en 4 archivos (incluida la fuente real: un <select> en TemplateDetailPage.jsx), verificado que la BD no tenía datos contaminados.

Limpieza: 13 archivos huérfanos borrados (3 backend + 10 frontend), verificando cero referencias antes de cada borrado. Asset.js/EmployeeAsset.js quedaron sin tocar a propósito.

Refactors: deduplicación en geminiService.js, código muerto removido de server.js, lógica de IA extraída de feedbackAssignment.controllers.js a un service nuevo, y los 3 archivos más grandes del frontend partidos en componentes (OnboardingHome, CreateEmployeeModal, Home.jsx) — todo verificado con build antes de reportar, sin cambiar comportamiento ni estilos.

----------------------------------------

* ¿Qué hacer con Asset / EmployeeAsset? (feature incompleta — terminarla, dejarla o borrarla)
  ¿Qué hacer con EmployeeHistory? (datos acumulándose sin consumidor — exponer endpoint o eliminar los hooks)
  ediseñar el patrón de router.js para que no necesite lista manual

Asset / EmployeeAsset
El backend tiene modelos completos, seeders con 135+ líneas de datos y mensajes de error dedicados — alguien invirtió tiempo real en esto. Las opciones son:

Terminarla: controllers + rutas + UI. Es trabajo nuevo, no refactor.
Dejarla: sin costo inmediato, pero sigue acumulando confusión para quien lea el código después.
Borrarla: modelos, seeders, asociaciones en relations.js y mensajes en constants. Limpio, pero irreversible.
Necesitás saber si esa feature estaba en el roadmap o fue descartada.

EmployeeHistory
Los hooks de Employee escriben en esta tabla en cada cambio de departamento/posición, pero ningún endpoint la expone. Las opciones son:

Exponer un endpoint: útil si querés un historial de movimientos del empleado (feature real).
Eliminar los hooks: si nunca va a usarse, dejar de acumular datos silenciosamente.
Depende de si el historial de carrera es algo que el producto necesita.

router.js
El patrón actual (lista de exclusión manual) ya demostró que falla — el bug de ContinuousFeedback fue exactamente eso. Rediseñarlo requiere una decisión de arquitectura: ¿las rutas protegidas se definen en un solo lugar o en dos? No es urgente ahora que la lista está completa y verificada, pero si el proyecto sigue creciendo va a volver a fallar.

------------------------------------------------
