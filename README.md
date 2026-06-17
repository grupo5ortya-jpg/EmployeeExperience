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

TODO: mails✖️

* último módulo offboarding:✅
* iniciar proceso en offboardingHome rh agregar cambiar estado a recontratable o no✅
- Si cambia rol que cambie la vista. ✅
- Talentos recibe alerta con boton para direccionar y setear datos del perfil✅

* Blindar templates offboarding y onboarding, opcional poder hacerlo con otros.✅
* Tiene 30 dias para completar cuestionario ✅
* existe "mi perfil" y lider/colaborador puede cambiar sus campos personales.✅
* Mejoria de mentoria por ia, toma scores de feedback 360.✅

* enfocar vacantes en puestos SAP
* Simulador de carrera usa vacantes disponibles pero se basa tambien en los cursos? intentar dirigir si hay uno existente.
*
