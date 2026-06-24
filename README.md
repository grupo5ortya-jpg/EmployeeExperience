# Employee Experience

## Email (alertas por SMTP)
Ver [docs/email-delivery.md](docs/email-delivery.md) para habilitar/deshabilitar/probar el envío real de emails.

## Ejecución:
- En .../EmployeeExperience/server/backend/ crear 2 copias de ".env.example" llamados ".env.dev" y ".env.prod". Completar las constantes del entorno.
- Desde la carpeta del proyecto ".../EmployeeExperience".
- $ npm i
- $ npm run init
- $ npm run dev

- Líder: evaluaciones pendientes de completar, alertas de equipo, tareas del equipo para aprobar, + lista de evaluaciones pendientes con links directos al formulario.

- Colaborador: tareas pendientes, evaluaciones pendientes, encuestas de pulso, alertas + listas detalladas de sus tareas y evaluaciones con links directos.

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



