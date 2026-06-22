# EmployeeExperience — Documentación Jira

**Proyecto:** EmployeeExperience HR Platform  
**Branch activo:** `fullstack-changes`  
**Última actualización:** 2026-06-21  
**Stack:** React 19 + Vite + Tailwind v4 / Express 5 + Sequelize 6 + PostgreSQL + Gemini AI

---

## ÉPICA 1 — Feedback 360°

### EXP-101 · Ciclos de Feedback 360° (HR)
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**  
HR puede crear ciclos de evaluación por departamento y competencias. Cada ciclo auto-genera asignaciones (1 SELF + 2 PEER aleatorios) para cada empleado activo del departamento.

**Acceptance Criteria:**
- [ ] HR puede crear un ciclo con nombre, departamento, período y competencias seleccionadas
- [ ] Al crear con departamento, se auto-generan `FeedbackAssignment` (SELF + 2 PEER)
- [ ] HR puede re-generar asignaciones manualmente (`POST /feedback-assignment/generate`)
- [ ] HR puede asignar evaluadores adicionales desde el detalle del ciclo
- [ ] La lista de ciclos muestra filtros por búsqueda y departamento

**Rutas:** `/feedbackhome`, `/createfeedback`, `/feedback/:id`  
**Endpoints:** `GET /survey`, `POST /survey`, `GET /feedback-assignment?cycleId=`, `POST /feedback-assignment/generate`, `PATCH /feedback-assignment/:id`

---

### EXP-102 · Formulario de respuesta 360°
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**  
El empleado completa el formulario de evaluación con preguntas cerradas (escala 1-5) y abiertas (comentario) por competencia. Las respuestas se guardan en `SurveyResponse` y `FeedbackAssignment.scores/comments`.

**Rutas:** `/responseform360?surveyId=&employeeId=&assignmentId=`  
**Endpoints:** `GET /question/feedback360?competencies=a,b`, `PATCH /feedback-assignment/:id`

---

### EXP-103 · Reporte HR por empleado + AI Gap Analysis
**Tipo:** Story | **Rol:** Talento (HR), Líder

**Descripción:**  
HR visualiza los resultados de un empleado en un ciclo: gráfico de barras por competencia, desglose por evaluador, comentarios. La IA (Gemini) genera un análisis de brechas con Fortalezas, Áreas de mejora y Acciones sugeridas.

**Flujo de aprobación (privacidad):**
1. HR genera el análisis IA
2. HR selecciona qué secciones compartir (Fortalezas / Brechas / Sugerencias)
3. HR hace click en "Enviar al empleado"
4. El empleado recibe una alerta y puede ver solo las secciones aprobadas

**Acceptance Criteria:**
- [ ] El botón "Ver resultados" está deshabilitado si hay evaluaciones pendientes para ese empleado
- [ ] Con todas evaluaciones completas, "Ver resultados" auto-genera el análisis (`?autoGenerate=1`)
- [ ] HR puede seleccionar/deseleccionar secciones del análisis con toggle visual
- [ ] Al enviar, el empleado recibe alerta `FEEDBACK_GAP_ANALYSIS_SENT`
- [ ] El empleado solo ve las secciones que HR aprobó
- [ ] Badge "Enviado el [fecha]" aparece en la vista HR cuando ya fue enviado

**Rutas:** `/hrfeedbackreport?cycleId=&evaluatedId=`, `/employeefeedbackreport?cycleId=&evaluatedId=`  
**Endpoints:** `GET /feedback-assignment/results`, `POST /feedback-assignment/gap-analysis`, `PATCH /feedback-assignment/gap-analysis/send`  
**Modelos involucrados:** `FeedbackGapAnalysis` (campos: `analysis` JSONB, `sent_sections` JSONB, `sent_at` DATE)

---

### EXP-104 · Widget de rendimiento en Home (Colaborador / Líder)
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**  
El home del empleado muestra un widget "Mi rendimiento 360°" con el gráfico de barras por competencia del ciclo más reciente en el que participó. Si no hay datos, muestra un mensaje vacío.

**Acceptance Criteria:**
- [ ] Muestra el nombre del ciclo más reciente
- [ ] Muestra barras por competencia con colores según score (verde ≥4, ámbar ≥3, rojo <3)
- [ ] Muestra promedio general
- [ ] Link "Ver detalle →" navega al reporte completo
- [ ] Si no hay datos: "Aún no hay resultados de Feedback 360°"
- [ ] NO aparece en el home de Talento

**Endpoint:** `GET /feedback-assignment/results?cycleId=&evaluatedId=` (ciclo más reciente)

---

## ÉPICA 2 — Feedback Continuo

### EXP-201 · Enviar y recibir feedback entre empleados
**Tipo:** Story | **Rol:** Colaborador

**Descripción:**  
Los empleados pueden enviarse reconocimientos y sugerencias de forma continua (no vinculado a ciclos 360°). El feedback puede ser anónimo (las sugerencias son siempre anónimas).

**Acceptance Criteria:**
- [ ] Solo visible para Colaborador (Talento y Líder excluidos del sidebar Y de las rutas — actualizado 2026-06-15, era Colaborador+Líder originalmente)
- [ ] Tabs "Recibidos" / "Enviados" en la página principal
- [ ] Tarjetas agrupadas por tipo: Reconocimiento (verde) y Sugerencia (ámbar)
- [ ] Modal de creación con: tipo, destinatario (combobox buscable), título, mensaje, opción anónimo
- [ ] Las sugerencias son siempre anónimas (checkbox oculto, forzado a `true`)
- [ ] El campo destinatario excluye al propio usuario y a empleados con rol Talento
- [ ] Sidebar muestra sub-item "Enviar feedback" que abre el modal directamente (`?new=1`)
- [ ] Al enviar, el receptor recibe alerta `CONTINUOUS_FEEDBACK_RECEIVED` con preview del mensaje

**Rutas:** `/continuous-feedback`, `/continuous-feedback/:id`  
**Endpoints:** `GET /continuous-feedback/received/:employeeId`, `GET /continuous-feedback/sent/:employeeId`, `POST /continuous-feedback`  
**Restricción de ruta:** `RoleRoute allowed={['Colaborador']}` en `App.jsx`

**Nota técnica — bug resuelto:** Sequelize generaba JOINs en orden incorrecto cuando `EMPLOYEE_MINI_INCLUDE` era el mismo objeto compartido entre los includes de `emitter` y `receiver`. Solución: objetos separados para cada include + `subQuery: false` en los `findAll`.

**Bug de seguridad resuelto (EXP-201-BUG-02, 2026-06-18):** `router.js` auto-generaba una ruta paralela sin protección (`/continuousfeedback`, sin guion) además de la ruta oficial `/continuous-feedback` (con `RoleRoute`). Cualquier rol podía acceder por URL directa, bypaseando la restricción a Colaborador. La única defensa real hasta entonces era ocultar el botón "Enviar feedback" en el componente. Fix: `ContinuousFeedback`/`ContinuousFeedbackDetail` agregados a la lista de exclusión del auto-generador + `authorize('Colaborador')` agregado a `POST /continuous-feedback` en el backend.

---

### EXP-202 · Widget de feedbacks recibidos en Home
**Tipo:** Story | **Rol:** Colaborador

**Descripción:**  
El home del empleado muestra un panel "Feedbacks recibidos" con contador y las últimas 6 tarjetas de feedback continuo recibido. Cada tarjeta navega a `/continuous-feedback`.

**Acceptance Criteria:**
- [ ] Muestra contador con total de feedbacks recibidos
- [ ] Tarjetas compactas con tipo, título, mensaje (truncado) y remitente
- [ ] Anónimos muestran "Anónimo" como remitente
- [ ] Link "Ver todos →" a la página completa
- [ ] Estado vacío con mensaje descriptivo
- [ ] Solo se muestra en el dashboard de Colaborador (removido del de Líder el 2026-06-15 — el feedback continuo dejó de ser una dinámica de Líder)

---

## ÉPICA 3 — Pulse 30/60/90

### EXP-301 · Encuestas de Pulso automáticas
**Tipo:** Story | **Rol:** Colaborador

**Descripción:**  
El sistema asigna automáticamente encuestas de satisfacción a los empleados en los días 30, 60 y 90 de su fecha de ingreso (cron job diario 9am). El empleado completa la encuesta y la IA analiza los resultados.

**Flujo:**
1. Cron 9am: detecta empleados en día 30/60/90 → crea `SurveyAssignment` + alerta `PULSE_SURVEY_DUE`
2. Empleado completa encuesta: `PATCH /survey-assignment` con `status: COMPLETED`
3. Fire-and-forget: Gemini analiza scores + comentario → guarda `PulseAnalysis` → crea alerta HR si riesgo MEDIUM/NEGATIVE

**Rutas:** `/pulsesurveys?employeeId=`, `/pulseanalysis`  
**Endpoints:** `GET /pulse-surveys/pending?employeeId=`, `GET /pulse-surveys/analyses`

---

## ÉPICA 4 — Onboarding

### EXP-401 · Templates y tareas de onboarding
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**  
HR crea templates de onboarding (`TaskType`) con tareas asociadas (`Task`). Puede asignar templates a empleados, ver el progreso y aprobar/rechazar tareas completadas.

**Rutas:** `/onboardinghome`, `/createtemplatepage`, `/onboarding-template/:id`, `/all-assignments`

**Bug conocido (EXP-401-BUG):** Al asignar onboarding, en algunos casos solo aparece 1 tarea en `/mytasks` en lugar de todas. Investigar `bulkCreate` en `createEmployee` y deduplicación de Sequelize con composite PK.

**Bug de seguridad resuelto (EXP-401-BUG-02, 2026-06-18):** la vista "Planes del equipo" (`/all-assignments`, Líder) mostraba los planes de **todos** los empleados de la empresa sin filtrar por equipo, y la ruta no tenía `RoleRoute` (accesible por URL para cualquier rol). Fix: nuevo cruce `scopedAssignments` (cruza `GET /employee-task` contra la lista de empleados ya filtrada por rol vía `GET /employee`) + `RoleRoute allowed={['Talento','Líder']}` + exclusión en `router.js`.

**Bug resuelto (EXP-401-BUG-03, 2026-06-18):** el estado `SUBMITED` (typo, sin la segunda T) se podía seleccionar como estado inicial al asignar una tarea manualmente desde `/onboarding-template/:id` (`STATUS_OPTS` lo ofrecía como opción), generando datos inconsistentes con el resto del sistema, que usa `SUBMITTED`. Verificado que no había filas afectadas en la base; corregido en el origen (el `<select>`) y en todos los chequeos defensivos que dependían del typo.

---

### EXP-402 · Vista de tareas del empleado
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**  
El empleado ve sus tareas de onboarding asignadas con estado (pendiente, en progreso, completada, enviada) y puede actualizar el estado.

**Ruta:** `/mytasks`

---

## ÉPICA 5 — Alertas HR

### EXP-501 · Centro de alertas con acordeón
**Tipo:** Story | **Rol:** Todos

**Descripción:**  
Página de alertas con tres secciones en acordeón: "No leídas" (abierta por defecto), "Leídas" y "Todas". El sidebar muestra badge con count de no leídas (polling 30s).

**Tipos de alerta por rol:**

| Tipo | Visible para |
|---|---|
| `NEGATIVE_PULSE_SIGNAL` | Talento |
| `FEEDBACK_CYCLE_COMPLETED` | Talento |
| `ONBOARDING_COMPLETED` | Talento |
| `ONBOARDING_TASK_SUBMITTED` | Talento |
| `ONBOARDING_TEMPLATE_SUBMITTED` | Talento |
| `ONBOARDING_TASK_OVERDUE` | Talento |
| `PULSE_SURVEY_DUE` | Colaborador, Líder |
| `FEEDBACK_EVALUATION_READY` | Colaborador, Líder |
| `ONBOARDING_TASKS_ASSIGNED` | Colaborador, Líder |
| `ONBOARDING_TEMPLATE_APPROVED` | Colaborador, Líder |
| `TEAM_PULSE_ALERT` | Líder |
| `TEAM_TASK_OVERDUE` | Líder |
| `FEEDBACK_GAP_ANALYSIS_SENT` | Colaborador, Líder |
| `CONTINUOUS_FEEDBACK_RECEIVED` | Colaborador, Líder |
| `OKR_BEHIND_SCHEDULE` | Talento, Colaborador, Líder (responsable) |
| `OKR_ASSIGNED` | Colaborador, Líder (responsable) |
| `OKR_COMPLETED` | Talento |
| `COURSE_COMPLETION_REQUESTED` | Talento |
| `COURSE_COMPLETION_APPROVED` | Colaborador, Líder |
| `COURSE_COMPLETION_REJECTED` | Colaborador, Líder |
| `JOB_OPENING_APPLICATION` | Talento |
| `OFFBOARDING_STARTED` | Colaborador, Líder (empleado en proceso de salida) |
| `EXIT_INTERVIEW_COMPLETED` | Talento |

**Nota técnica:** El campo `topics` de Alert puede ser array `[uuid]` u objeto `{}` dependiendo del tipo. Siempre normalizar con `Array.isArray(alert.topics) ? alert.topics : []` antes de llamar `.filter()`.

**Nota técnica — CTAs directos (2026-06-11):** `AlertCard.jsx` (`REPORT_TYPES`) define un link/label de acción directa por tipo de alerta. Agregados en esta fecha: `COURSE_COMPLETION_REQUESTED` → "Revisar finalización" (`/learningdashboard`, solo Talento), `COURSE_COMPLETION_APPROVED`/`COURSE_COMPLETION_REJECTED` → "Ver mi aprendizaje" (`/mylearning`), `JOB_OPENING_APPLICATION` → "Ver vacantes" (`/job-openings`, solo Talento).

**Ruta:** `/alerts`  
**Endpoints:** `GET /alerts`, `GET /alerts/unread-count`, `PATCH /alerts/:id/read`

---

## ÉPICA 6 — Vacantes (Job Openings)

### EXP-601 · Gestión de vacantes con skills
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**  
HR gestiona vacantes abiertas con título, departamento, descripción y skills requeridas. CRUD completo.

**Ruta:** `/job-openings`  
**Endpoints:** `GET /job-openings`, `POST /job-openings`, `PATCH /job-openings/:id`, `DELETE /job-openings/:id`

---

### EXP-602 · Postulación a vacantes (Colaborador / Líder)
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**
Los empleados ven las vacantes en estado `open` y pueden postularse con un click. A diferencia de la vista de Talento (que abre un modal de edición), Colaborador/Líder ven un modal de solo lectura (`JobOpeningApplyModal`) con el detalle de la vacante y las skills requeridas, con un botón "Inscribirme". Al postularse, Talento recibe una alerta.

**Acceptance Criteria:**
- [ ] Click en una vacante abre `JobOpeningApplyModal` (solo lectura) para Colaborador/Líder, en vez del modal de edición de Talento
- [ ] El modal muestra título, descripción, departamento, estado y skills requeridas (con nivel)
- [ ] Botón "Inscribirme" solo visible si la vacante está `open`
- [ ] `POST /job-openings/:id/apply` valida que la vacante esté `open` y crea un `Alert` (`type: 'JOB_OPENING_APPLICATION'`, `employee_id` = postulante) visible para Talento
- [ ] No se permite postularse dos veces a la misma vacante (chequeo de `Alert` existente por `employee_id` + `topics` conteniendo el `jobOpeningId`, devuelve 409)
- [ ] La alerta de Talento muestra CTA "Ver vacantes" → `/job-openings`

**Ruta:** `/job-openings` (`RoleRoute` no aplica — misma ruta que Talento, vista condicionada por rol)
**Endpoint:** `POST /job-openings/:id/apply` `{ employeeId }`
**Nota técnica:** Sin tabla de "postulaciones" — se reutiliza `Alert.topics` (JSONB) como referencia al `jobOpeningId`, siguiendo el patrón de deduplicación de `OKR_BEHIND_SCHEDULE`/`OKR_COMPLETED`.

---

### EXP-603 · Validación y borrado de skills
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
Al crear una vacante, HR debe seleccionar al menos una skill requerida (una vacante sin skills no es válida). Además, HR puede borrar una skill creada por error desde el mismo selector, siempre que no esté en uso.

**Flujo:**
1. `CreateJobOpeningModal.jsx` no permite enviar el formulario si `selectedSkills.length === 0` (botón disabled + mensaje inline)
2. Backend (`core_ctrl_create_job_opening`) valida lo mismo server-side — 400 si `skills` viene vacío, no solo confiar en la UI
3. Cada skill en la lista de "Skills requeridas" tiene un botón de borrar (`IconButton` variant `danger`) → `DELETE /skills/:id`
4. El backend cuenta referencias en `JobOpeningSkill`/`EmployeeSkill`/`Task` antes de borrar — 409 si está en uso, 200 si está libre

**Acceptance Criteria:**
- [ ] No se puede crear una vacante sin al menos una skill (frontend + backend)
- [ ] `DELETE /skills/:id` devuelve 409 con `{error, usage:{jobOpenings, employees, courses}}` si la skill tiene alguna referencia
- [ ] `DELETE /skills/:id` sobre una skill sin uso devuelve 200 y la borra
- [ ] `POST`/`PATCH`/`DELETE /skills` requieren rol Talento (antes cualquier autenticado podía mutar skills)
- [ ] El modal muestra `window.confirm` antes de borrar y el mensaje de error del backend si la operación falla

**Endpoints:** `POST /job-openings` (validación), `DELETE /skills/:id` (guard de uso)
**Nota técnica:** sin `onDelete` definido en `relations.js` para las FKs de `Skill` — antes de este fix, borrar una skill en uso habría tirado un error crudo de violación de FK en vez de un mensaje claro.

---

## ÉPICA 8 — OKR (Objetivos y Resultados Clave)

### EXP-801 · Gestión de OKRs (HR)
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
HR crea objetivos de negocio con una métrica medible (`metricType` + `targetValue`), asigna un empleado responsable y, opcionalmente, un objetivo padre para formar jerarquías (ej: "Mejorar Onboarding" → "Mentor Matching", "Pulse 30-60-90"). El dashboard global muestra totales, vencidos y completados.

**Acceptance Criteria:**
- [ ] HR puede crear, editar y reasignar responsable/padre de un OKR
- [ ] El listado se muestra en árbol (objetivos padre con hijos anidados, colapsable)
- [ ] Filtros por búsqueda, estado y vencidos
- [ ] Dashboard con contadores: totales, vencidos, completados
- [ ] Barra de progreso visual (`currentValue` / `targetValue`)
- [ ] Un objetivo no puede ser su propio padre (validado en backend y frontend)

**Ruta:** `/okrmanagement` (`RoleRoute allowed={['Talento']}`)
**Endpoints:** `GET /okr`, `POST /okr`, `PATCH /okr/:id`, `GET /okr/:id`

---

### EXP-802 · Mis objetivos (responsable)
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**
El empleado responsable visualiza únicamente los OKRs que tiene asignados, con su meta, progreso actual y fecha límite, y puede actualizar el valor actual desde una tarjeta inline.

**Acceptance Criteria:**
- [ ] Solo ve objetivos donde es `responsibleEmployeeId`
- [ ] Puede editar `currentValue` desde la tarjeta (input + botón Guardar)
- [ ] Ve barra de progreso, estado y fecha límite
- [ ] Si el objetivo pertenece a uno padre, se muestra "Parte de: [padre]"

**Ruta:** `/myobjectives` (`RoleRoute allowed={['Colaborador','Líder']}`)
**Endpoints:** `GET /okr/mine?employeeId=`, `PATCH /okr/:id/progress`

---

### EXP-803 · Alerta de objetivo retrasado
**Tipo:** Story | **Rol:** Talento, Colaborador, Líder

**Descripción:**
Al actualizar el progreso de un OKR, si la fecha límite ya pasó y el valor actual no alcanzó la meta, el sistema marca el objetivo como `AT_RISK` y crea una alerta `OKR_BEHIND_SCHEDULE` (deduplicada por OKR) visible tanto para HR (supervisión global) como para el responsable.

**Acceptance Criteria:**
- [ ] Se evalúa `dueDate < hoy && currentValue < targetValue` en cada actualización de progreso
- [ ] El estado pasa a `AT_RISK` automáticamente
- [ ] Se crea una única alerta por OKR (`Alert.findOne` por `topics` antes de crear)
- [ ] La alerta es visible para Talento y para el empleado responsable (`employee_id = responsibleEmployeeId`)
- [ ] Si alcanza la meta (`currentValue >= targetValue`), pasa a `COMPLETED`

**Modelo:** `Okr` — tabla `okrs`. Campos: `title`, `description`, `responsible_employee_id` (FK→Employee), `period` ENUM(QUARTERLY/YEARLY), `metric_type` ENUM(NUMBER/PERCENTAGE/CURRENCY), `target_value`, `current_value`, `due_date`, `parent_id` (self-FK nullable), `status` ENUM(NOT_STARTED/IN_PROGRESS/AT_RISK/COMPLETED)

**Jerarquía:** self-join `Okr.belongsTo(Okr, { as: 'parent' })` / `Okr.hasMany(Okr, { as: 'children' })` — igual patrón que `Employee.mentor`/`mentees`.

**Bug resuelto (EXP-803-BUG-01):** las cards de OKR (`OkrTreeNode.jsx`, `MyOkrCard.jsx`) mostraban "Vencido hace X días" en rojo aunque el objetivo ya estuviera `COMPLETED`, porque el badge se basaba solo en `daysRemaining < 0` (cálculo aritmético `dueDate - hoy`, sin mirar el estado). Fix: condicionar el badge con `node.isOverdue` (el campo que el backend ya calcula excluyendo `status === 'COMPLETED'` en `okr.controllers.js`), ocultando la línea de "vencido" cuando el objetivo se completó después de su fecha límite.

**Bug resuelto (EXP-803-BUG-02, 2026-06-18):** el cron diario que reevalúa OKRs a `STAGNANT`/`AT_RISK` por el solo paso del tiempo (sin que el responsable actualice el progreso) existía en el código (`okrCronJob.js#startOkrCronJob`) pero nunca se ejecutaba — no estaba enchufado en el arranque del servidor (`index.js`). Un OKR abandonado se quedaba en su último estado para siempre, ya que la reevaluación solo ocurría al actualizar `currentValue` manualmente. Corregido.

---

### EXP-804 · Notificación de objetivo asignado
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**
Al crear un OKR (o al reasignar su responsable desde la edición), el sistema crea una alerta `OKR_ASSIGNED` dirigida al empleado designado como responsable, para que sepa que tiene un nuevo objetivo a su cargo.

**Acceptance Criteria:**
- [ ] Se crea una alerta `OKR_ASSIGNED` (fire-and-forget) al crear el OKR, con `employee_id = responsibleEmployeeId`
- [ ] Se crea una alerta equivalente cuando HR reasigna el responsable de un OKR existente (`PATCH /okr/:id`)
- [ ] La alerta es visible solo para el responsable (no para HR) en `/myobjectives`, con link directo al objetivo

---

### EXP-805 · Notificación de objetivo completado
**Tipo:** Story | **Rol:** Talento

**Descripción:**
Cuando el responsable actualiza el progreso de un OKR y el valor actual alcanza o supera la meta (`currentValue >= targetValue`), el objetivo pasa a `COMPLETED` y el sistema crea una alerta `OKR_COMPLETED` para que HR tenga visibilidad del logro.

**Acceptance Criteria:**
- [ ] Al marcar el OKR como `COMPLETED` se crea una alerta `OKR_COMPLETED` (fire-and-forget, deduplicada por OKR igual que `OKR_BEHIND_SCHEDULE`)
- [ ] La alerta es visible solo para Talento, con link directo a `/okrmanagement`

---

## ÉPICA 9 — Aprendizaje (Learning / LXP)

### EXP-901 · Catálogo de cursos e inscripción
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**
El empleado navega un catálogo de cursos (búsqueda por título/skill, filtra por modalidad) y se inscribe con un click. Cada curso muestra título, descripción, duración, modalidad, link externo y la skill asociada (si tiene).

**Acceptance Criteria:**
- [ ] El catálogo muestra todos los cursos activos con buscador
- [ ] Botón "Inscribirme" crea un `CourseEnrollment` (`status: IN_PROGRESS`, `progress: 0`)
- [ ] Si el empleado ya está inscripto, el botón se reemplaza por un badge "Inscripto"
- [ ] No se permite doble inscripción al mismo curso (índice único `employee_id + course_id`, error amigable si ya existe)

**Ruta:** `/coursecatalog` (`RoleRoute allowed={['Colaborador','Líder']}`)
**Endpoints:** `GET /learning-courses`, `GET /course-enrollments?employeeId=`, `POST /course-enrollments`

---

### EXP-902 · Seguimiento de progreso y solicitud de finalización
**Tipo:** Story | **Rol:** Colaborador, Líder

**Descripción:**
El empleado actualiza manualmente su progreso (0/25/50/75/100%) en cada curso en el que está inscripto. Al llegar al 100%, puede solicitar la revisión de finalización; HR recibe una alerta para aprobar o rechazar.

**Flujo:**
1. Empleado actualiza progreso → `PATCH /course-enrollments/:id/progress`
2. Al estar en 100% e `IN_PROGRESS`, aparece el botón "Solicitar finalización" → `PATCH /:id/request-completion` (status → `PENDING_APPROVAL`, alerta HR `COURSE_COMPLETION_REQUESTED`)
3. HR aprueba (`PATCH /:id/review { decision: 'approve', certificateLink }`) → `COMPLETED` + `certificate_link` + alerta empleado `COURSE_COMPLETION_APPROVED`
4. HR rechaza (`decision: 'reject'`) → vuelve a `IN_PROGRESS` + alerta empleado `COURSE_COMPLETION_REJECTED`

**Acceptance Criteria:**
- [ ] El selector de progreso solo permite los pasos `0/25/50/75/100`
- [ ] El botón "Solicitar finalización" solo aparece con `progress === 100 && status === 'IN_PROGRESS'`
- [ ] El backend valida `progress === 100 && status === IN_PROGRESS` antes de pasar a `PENDING_APPROVAL` (`learningService.requestCompletion`)
- [ ] Estado `PENDING_APPROVAL` no permite nuevas solicitudes hasta que HR resuelva

**Ruta:** `/mylearning` (`RoleRoute allowed={['Colaborador','Líder']}`)
**Endpoints:** `PATCH /course-enrollments/:id/progress`, `PATCH /:id/request-completion`
**Servicio:** `connection/learningService.js`

---

### EXP-903 · Panel HR — gestión de cursos y aprobación de finalizaciones
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
HR crea, edita y elimina cursos del catálogo, y revisa en una tabla global todas las inscripciones (empleado, curso, progreso, estado), con acciones para aprobar (adjuntando link de certificado opcional) o rechazar las solicitudes `PENDING_APPROVAL`.

**Acceptance Criteria:**
- [ ] HR puede crear un curso (título, descripción, duración, modalidad, link, skill asociada vía `useSkills`)
- [ ] HR puede editar un curso existente desde el mismo modal (click en la card)
- [ ] HR puede **eliminar** un curso desde un botón dedicado en la card (ícono papelera, con confirmación `window.confirm`); el borrado es soft-delete (`paranoid: true`, `DELETE /learning-courses/:id`)
- [ ] La tabla de inscripciones se ordena con `PENDING_APPROVAL` primero
- [ ] Las acciones aprobar/rechazar solo se muestran en filas `PENDING_APPROVAL`
- [ ] El input de link de certificado es opcional al aprobar

**Ruta:** `/learningdashboard` (`RoleRoute allowed={['Talento']}`)
**Endpoints:** `GET /learning-courses`, `POST /learning-courses`, `PATCH /learning-courses/:id`, `DELETE /learning-courses/:id`, `GET /course-enrollments`, `PATCH /course-enrollments/:id/review`

**Bug resuelto (EXP-903-BUG-01):** Al agregar el endpoint `DELETE /learning-courses/:id`, el frontend devolvía 404 (`"Route ... not found"`). Causa: el proceso del backend corría con `node` plano (sin `nodemon`), por lo que no recargaba las rutas nuevas — fue necesario reiniciar el proceso manualmente. Ver nota técnica en CLAUDE.md.

**Bug resuelto (EXP-903-BUG-02, 2026-06-18):** la constante `COURSE_ENROLLMENT` (usada por `courseEnrollment.controller.js` para mapear `EmployeeTask.status` → `CourseEnrollment.status`) se había eliminado por error en un commit de limpieza de "constantes obsoletas", sin verificar que seguía en uso — esto tiraba el backend completo al arrancar (`TypeError` a nivel de módulo, antes de poder levantar el server). Restaurada, agregando además `STATUS_REJECTED` que faltaba desde la introducción de EXP-905.

---

### EXP-904 · Internal CV — Learning & Certifications
**Tipo:** Story | **Rol:** Colaborador, Líder, Talento (HR)

**Descripción:**
Los cursos completados y sus certificados (cuando HR los adjunta al aprobar) se muestran en una sección "Learning & Certifications" tanto en el perfil propio del empleado (`/mylearning`) como en el detalle de cualquier empleado visto por HR (`/detailemployee/:id`) — funciona como "CV interno".

**Acceptance Criteria:**
- [ ] Componente compartido `LearningCertifications` recibe `employeeId` y consulta `useEnrollments({ employeeId, status: 'COMPLETED' })`
- [ ] Muestra título del curso, fecha de finalización y link al certificado (si existe)
- [ ] Visible en `MyLearning` (vista propia) y en `DetailEmployee` (vista HR)
- [ ] Separa "Cursos internos" de "Certificaciones externas" según `course.isExternal` (ver EXP-905)

**Endpoint:** `GET /course-enrollments?employeeId=&status=COMPLETED`

---

### EXP-905 · Certificaciones externas
**Tipo:** Story | **Rol:** Colaborador, Líder, Talento (HR)

**Descripción:**
El empleado puede registrar cursos/certificaciones realizados fuera de la empresa, subiendo el link del diploma. Se modela como un curso (`Task` con `is_external=true` + `institution`) más una inscripción (`EmployeeTask` creada directamente en `SUBMITTED`, `progress=100`, `certificate_link`=diploma), reutilizando el flujo de aprobación y alertas existente (EXP-902/903).

**Flujo:**
1. Empleado completa el modal "Subir certificación externa" (Título*, Duración, Modalidad, Skill opcional, Institución opcional, Diploma URL*) → `POST /course-enrollments/external`
2. Se crea alerta `COURSE_COMPLETION_REQUESTED` para Talento
3. HR revisa en `/learningdashboard` (tag "Externo · institución"), abre "Ver diploma" y aprueba/rechaza con el mismo `PATCH /:id/review { decision }`
4. Aprobar → `COMPLETED` (+ upsert `EmployeeSkill.skill_evidence_url` si tiene skill asociada) → pasa a "Certificaciones externas" en el CV interno (EXP-904)
5. Rechazar → `REJECTED` (definitivo, se conserva el diploma; sin reintento, a diferencia del rechazo de un curso interno que vuelve a `IN_PROGRESS`)

**Acceptance Criteria:**
- [ ] Botón "Subir certificación externa" en `/mylearning`
- [ ] Campos del modal: Título* (texto), Duración, Modalidad, Skill (opcional, select), Institución (opcional), Diploma URL*
- [ ] La certificación NO aparece en el catálogo `/coursecatalog` (`GET /learning-courses` filtra `is_external=false`)
- [ ] HR ve la solicitud en `/learningdashboard` junto a las solicitudes internas, con tag "Externo · institución"
- [ ] Aprobar → `COMPLETED`; Rechazar → `REJECTED` (estado final, sin reintento)
- [ ] El badge `REJECTED` ("Rechazada") se muestra en `/mylearning` y `/learningdashboard`

**Ruta:** `/mylearning` (`RoleRoute allowed={['Colaborador','Líder']}`)
**Endpoint:** `POST /course-enrollments/external` `{ employeeId, title, duration, modality, skillId, institution, certificateLink }`
**Modelo:** `Task.is_external` (BOOLEAN, default false), `Task.institution` (STRING(150), nullable); nuevo status `REJECTED` agregado a `EmployeeTask.status`/`CourseEnrollment.status`

---

## ÉPICA 7 — Empleados y perfil

### EXP-701 · Lista y detalle de empleados
**Tipo:** Story | **Rol:** Talento (HR), Líder

**Descripción:**  
HR y Líderes visualizan la lista de empleados con filtros. El detalle incluye info personal, departamento, estado de onboarding y asignación de mentor con sugerencia de IA (Gemini).

**Rutas:** `/employeelist`, `/detailemployee/:id`  
**Endpoints:** `GET /employee`, `GET /employee/:id`, `PATCH /employee/:id/mentor`, `POST /ai/mentor-matching`

**Bug de seguridad resuelto (EXP-701-BUG-01, 2026-06-18):** `GET /employee` no filtraba por rol — cualquier usuario autenticado (incluido Colaborador, que ni siquiera tiene este ítem en el sidebar) podía ver el listado completo de empleados navegando a `/employeelist` por URL directa, ya que la página no tenía `RoleRoute` y el filtro de Líder era solo client-side (y no aplicaba a otros roles). Fix: filtro server-side en `employee.controllers.js#getAllEmployees` (Líder → `[propio id, ...reportes directos vía Team]`) + `RoleRoute allowed={['Talento','Líder']}` agregado a `/employeelist` en `App.jsx` + exclusión en `router.js`.

**Bug resuelto (EXP-701-BUG-02, 2026-06-18):** el modelo `Team` (usado al asignar líder directo desde el alta/edición de un empleado) importaba el mensaje de error `TEAM_ERR` del archivo de constantes equivocado. Cualquier validación fallida (líder/colaborador requerido, rol inválido, colaborador duplicado) tiraba un error genérico 500 en vez del mensaje claro esperado por el frontend.

---

## ÉPICA 10 — Offboarding & Alumni

### EXP-1001 · Inicio del proceso de offboarding
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
HR inicia un proceso de offboarding para un empleado activo, indicando último día de trabajo, motivo de salida (renuncia/despido, ver EXP-1006), si es recontratable y tags opcionales. Para una renuncia, el sistema genera automáticamente un checklist de salida y programa la entrevista de salida digital (vencimiento a 30 días). El empleado pasa a rol Alumni **en este mismo request** (no al finalizar — rediseñado 2026-06-19).

**Flujo (renuncia):**
1. HR completa el modal (empleado `ACTIVE`, último día, motivo, recontratable, tags) → `POST /offboarding`
2. Se crea `EmployeeOffboarding` (`status: IN_PROGRESS`, `initiated_by` = HR que lo inicia, `exit_type`, `rehirable`)
3. Se bulk-crean/resetean las `EmployeeTask` del checklist (3-4 tareas según seed), `due_date = lastWorkingDay` — si el empleado ya tenía filas de una ronda anterior (boomerang), se resetean a `ENROLLED` (ver EXP-1002-FIX-01)
4. Se crea `Survey` + `SurveyAssignment` para la entrevista de salida (`due_date = lastWorkingDay + 30d`)
5. Alerta `OFFBOARDING_STARTED` para el empleado
6. Rol → Alumni (dispara `syncEmployeeStatus`: `Employee.status → INACTIVE`, limpia `department_id`/`position`) + `AlumniProfile.findOrCreate` (usa `rehirable`/`tags` del body)
7. Tareas pendientes de **otros** templates (ej. onboarding sin terminar) se marcan vencidas (`due_date` al pasado) — visual únicamente, vía la lógica de `isOverdue` ya existente

**Flujo (despido, `exitType:'TERMINATION'`):** igual pero se saltan los pasos 3-5 — sin checklist, sin entrevista, sin alert al empleado (ver EXP-1006). El `EmployeeOffboarding` se crea directo en `status:'COMPLETED'` (el caso se cierra solo, no requiere "Finalizar proceso").

**Acceptance Criteria:**
- [ ] No se permite iniciar un offboarding si ya existe uno `IN_PROGRESS` para ese empleado (409)
- [ ] El checklist aparece en el Home de Alumni (`OffboardingChecklistCard`) y en `/all-assignments` de HR — ya no en `/mytasks` (sacado del sidebar para Alumni el 2026-06-20)
- [ ] La entrevista de salida queda programada con vencimiento a 30 días
- [ ] El rol del empleado pasa a Alumni inmediatamente al iniciar, no al finalizar

**Ruta:** `/offboardinghome` (`RoleRoute allowed={['Talento']}`)
**Endpoints:** `POST /offboarding {employeeId, lastWorkingDay, exitType, rehirable, tags}`, `GET /offboarding`, `GET /offboarding/:employeeId`
**Modelo:** `EmployeeOffboarding` (tabla `employee_offboardings`) — `employee_id`, `initiated_by`, `last_working_day`, `status` (`IN_PROGRESS`/`COMPLETED`), `exit_type` (`RESIGNATION`/`TERMINATION`), `rehirable`, `started_at`, `completed_at`

---

### EXP-1002 · Seguimiento y finalización del proceso
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
HR visualiza el detalle de un proceso de offboarding (progreso del checklist, estado de la entrevista de salida, badge de "Caso") y puede finalizarlo manualmente en cualquier momento. **Rediseñado 2026-06-19:** la transición a Alumni ya ocurrió al iniciar el proceso (EXP-1001) — "Finalizar proceso" es ahora puramente el cierre administrativo formal del caso, no toca rol ni `AlumniProfile`. Para despidos, el caso ya nace `COMPLETED` (ver EXP-1006) y este botón ni se muestra.

**Flujo:**
1. HR entra a `/offboarding/:employeeId` y revisa progreso checklist + estado entrevista + badge "Caso" (Abierto/Cerrado/"Listo para cerrar" si checklist+entrevista ya están al 100%)
2. Click "Finalizar proceso" (con confirmación, solo visible si `status === 'IN_PROGRESS'`) → `PATCH /offboarding/:employeeId/complete`
3. `EmployeeOffboarding.status → COMPLETED`, `completed_at = now` — **nada más**, sin tocar `User.role_id` ni `AlumniProfile`

**Acceptance Criteria:**
- [ ] Botón "Finalizar proceso" solo visible si `status === IN_PROGRESS`
- [ ] No exige checklist/entrevista completos — HR puede forzar el cierre
- [ ] 404 si no hay un proceso `IN_PROGRESS` para ese empleado (también evita doble-completado)
- [ ] El empleado ya es `INACTIVE`/Alumni desde que se inició el proceso (EXP-1001) — finalizar no cambia su status
- [ ] Para despidos, el caso ya está `COMPLETED` desde `POST /offboarding` — no hay botón "Finalizar proceso" que mostrar

**Ruta:** `/offboarding/:employeeId` (`RoleRoute allowed={['Talento']}`)
**Endpoint:** `PATCH /offboarding/:employeeId/complete`

---

### EXP-1003 · Entrevista de salida digital
**Tipo:** Story | **Rol:** Colaborador, Líder, Alumni

**Descripción:**
El empleado saliente completa una encuesta de salida (4 preguntas cerradas escala 1-5 + 1 pregunta abierta, `QuestionType` seedeado "Offboarding"/"Salida") dentro de los 30 días posteriores a su último día de trabajo. Si el proceso de offboarding se completa antes de que responda, el empleado ya tiene rol Alumni y completa la encuesta desde su propio home (pierde acceso a `/pulsesurveys`).

**Flujo:**
1. `PulseSurveys.jsx` (Colaborador/Líder) o el home de Alumni (`AlumniDashboard`) consultan `GET /exit-interviews/pending?employeeId=`
2. Si hay una pendiente, se muestra una card (`ExitInterviewCard`) con preguntas cerradas + abierta y botón "Completar entrevista"
3. El empleado completa y envía en un solo request → `POST /exit-interviews/:surveyId/submit` (`{employeeId, responses:[...]}`)
4. `SurveyAssignment.status → COMPLETED`, se auto-completa la tarea "Entrevista de salida con RRHH" del checklist de offboarding, y se dispara alerta `EXIT_INTERVIEW_COMPLETED` para HR

**Acceptance Criteria:**
- [ ] No se puede responder si `due_date` ya venció (400)
- [ ] No se puede reenviar una vez `COMPLETED` (400)
- [ ] El rol Alumni puede usar este endpoint sin restricciones (`/exit-interviews/*` no tiene `authorize`)
- [ ] Tras enviar, el checklist de offboarding refleja la tarea "Entrevista de salida con RRHH" como `COMPLETED`
- [ ] En el home de Alumni, la sección "Entrevista de salida" solo se muestra si hay una pendiente

**Rutas:** `/pulsesurveys` (sección "Entrevista de salida"), `/` (Home Alumni, `AlumniDashboard`)
**Endpoints:** `GET /exit-interviews/pending?employeeId=`, `POST /exit-interviews/:surveyId/submit`
**Componentes compartidos:** `ExitInterviewCard`, `ExitInterviewForm` (`pages/pulse/components/`)

---

### EXP-1004 · Gestión de perfiles Alumni
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
HR mantiene un directorio de ex empleados ("Alumni") para posibles re-contrataciones futuras: busca por nombre, filtra por skill o disponibilidad (`rehirable`), consulta las skills del empleado (historial vía `EmployeeSkill`) y gestiona tags libres + flag "recontratable".

**Acceptance Criteria:**
- [ ] `/alumnihome` lista empleados con `User.role.name === 'Alumni'`, con filtros: búsqueda por nombre, skill (`<select>`) y `rehirable` (Sí/No/Todos)
- [ ] `/alumni/:employeeId` muestra header (avatar, nombre, email, fecha de ingreso), toggle "Recontratable"/"No recontratable", tags (chips removibles + input para agregar) y skills (read-only, con nivel)
- [ ] `PATCH /alumni/:employeeId` actualiza `rehirable`/`tags`
- [ ] No se filtra por departamento — `syncEmployeeStatus` limpia `Employee.department_id` al pasar a Alumni, el dato no se persiste en ningún lado (limitación conocida)
- [ ] Botón "Recontratar" en `/alumnihome` (`window.confirm`) → `PATCH /alumni/:employeeId/rehire` — vuelve el rol a Colaborador (dispara `syncEmployeeStatus`, `Employee.status → ACTIVE`), **dropea automáticamente** toda `EmployeeTask` `ENROLLED`/`IN_PROGRESS`/`SUBMITTED` de ese empleado (checklist de offboarding sin terminar + cualquier otro template pendiente — sin esto, el recontratado vería tareas viejas trabadas en "Mis planes"), y crea alertas `EMPLOYEE_REHIRED` (HR) + `REHIRE_WELCOME` (empleado)
- [ ] El empleado deja de listarse en `/alumnihome` inmediatamente tras recontratar (perdió el rol Alumni)

**Rutas:** `/alumnihome`, `/alumni/:employeeId` (`RoleRoute allowed={['Talento']}`)
**Endpoints:** `GET /alumni`, `GET /alumni/:employeeId`, `PATCH /alumni/:employeeId`, `PATCH /alumni/:employeeId/rehire`
**Modelo:** `AlumniProfile` (tabla `alumni_profiles`, 1:1 con `Employee`) — `employee_id` (PK/FK), `rehirable` (default `true`), `tags` (JSONB, default `[]`)

---

### EXP-1005 · Acceso restringido para rol Alumni
**Tipo:** Story | **Rol:** Alumni

**Descripción:**
Un usuario con rol Alumni accede a una versión mínima y de solo lectura de la plataforma: únicamente "Mi perfil" y, si corresponde, su checklist/entrevista de salida pendiente (completable directo desde el Home). No tiene acceso a ningún otro módulo del sidebar. **Actualizado 2026-06-19:** el nivel de acceso ahora depende del motivo de salida (`exitType`) — un Alumni despedido (`TERMINATION`) no tuvo checklist ni entrevista asignados (ver EXP-1006), así que tampoco debe ver esas secciones ni seguir recibiendo alertas nuevas. **Actualizado 2026-06-20:** "Mis planes" se sacó del sidebar para **todo** Alumni (no solo despedido) — quedaba redundante con el checklist ya visible en el Home.

**Acceptance Criteria:**
- [ ] El sidebar de Alumni nunca muestra "Mis planes" (ningún `exitType`) — el checklist se completa desde el Home (`AlumniDashboard`/`OffboardingChecklistCard`), no hay segunda vista
- [ ] El sidebar de Alumni que **renunció** (`exitType: RESIGNATION`) muestra "Mi perfil" y "Alertas"
- [ ] El sidebar de Alumni **despedido** (`exitType: TERMINATION`) solo muestra "Mi perfil" — "Alertas" queda oculto (`Sidebar.jsx`, `HIDDEN_FOR_TERMINATED_ALUMNI`)
- [ ] `DetailEmployee.jsx` no renderiza el botón "Editar" (ni el flujo de edición) para rol Alumni (`canEdit = authUser?.role !== 'Alumni'`)
- [ ] El home de Alumni (`AlumniDashboard`) muestra una card "Ver mi perfil" siempre; el checklist y la entrevista de salida pendiente solo si `exitType !== 'TERMINATION'`
- [ ] Los crons diarios (`onboardingCronJob.js`, `okrCronJob.js`) no generan alertas nuevas para empleados `INACTIVE` (Alumni) — filtrado por `Employee.status==='ACTIVE'` en el include
- [ ] `GET /alumni` (HR-only) devuelve 403 para rol Alumni; `GET /employees/:id` (usado por "Mi perfil") devuelve 200 para Alumni
- [ ] `exitType` viaja en la respuesta de `POST /auth/login` y `GET /auth/me` para usuarios con rol Alumni (`auth.controllers.js#formatUser`), ya que el propio Alumni no puede consultar `GET /offboarding/:employeeId` (Talento-only)
- [ ] La ruta `/mytasks` sigue sin `RoleRoute` (acceso por URL directa posible) pero `MyTasks.jsx` sigue filtrando para Alumni a solo el checklist de offboarding — no expone otros templates aunque se visite a mano

**Ruta:** `/` (Home, branch `role === 'Alumni'`), `/detailemployee/:employeeId` (sin `RoleRoute`, modo solo lectura para Alumni)

---

### EXP-1006 · Filtro renuncia/despido
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
Requerimiento del cliente (acta de reunión 2026-06-18): si el motivo de salida es despido, no se debe enviar ninguna comunicación, cuestionario ni checklist al empleado. HR elige el motivo al iniciar el proceso.

**Flujo:**
1. HR elige "Despido" en el `<select>` "Motivo de salida" de `StartOffboardingModal.jsx` → `POST /offboarding {..., exitType:'TERMINATION'}`
2. El `EmployeeOffboarding` se crea igual (tracking de HR), pero **no** se bulk-crea el checklist, **no** se crea `Survey`/`SurveyAssignment` de entrevista de salida, **no** se dispara el alert `OFFBOARDING_STARTED`
3. La transición a Alumni + `AlumniProfile` + el vencimiento de tareas de otros templates ocurren igual que para una renuncia (es una preocupación de acceso, no de comunicación)

**Acceptance Criteria:**
- [ ] `EmployeeOffboarding.exit_type` (`RESIGNATION`/`TERMINATION`, default `RESIGNATION`)
- [ ] Con `exitType:'TERMINATION'`: `checklist.total === 0`, `exitInterview === null` en la respuesta de `GET /offboarding/:employeeId`
- [ ] `OffboardingHome.jsx` muestra columna "Motivo" (badge) y "N/A" en Checklist/Entrevista para despidos; `OffboardingDetailPage.jsx` muestra "No aplica" en vez de listas vacías
- [ ] Ver EXP-1005 para las restricciones de acceso del Alumni despedido resultante

**Endpoint:** `POST /offboarding {employeeId, lastWorkingDay, rehirable, exitType}`
**Gotcha conocido — resuelto parcialmente el 2026-06-20:** `formatOffboarding`/`formatUser` buscan el checklist/entrevista/exit_type del **empleado**, no del proceso específico. Para renuncias repetidas (boomerang) ya está resuelto — `startOffboarding` resetea a `ENROLLED` cualquier `EmployeeTask` del checklist que ya existiera de una ronda anterior (ver EXP-1002-FIX-01). Para despido después de una renuncia sin limpiar, la data vieja queda en la tabla pero el frontend nunca la muestra (checklist oculto por completo para `TERMINATION`).

---

### EXP-1002-FIX-01 · Checklist no se resetea para empleados boomerang
**Tipo:** Bug | **Rol:** Talento (HR), Alumni

**Descripción:**
Un empleado que renuncia, es recontratado y renuncia de nuevo reutiliza las mismas filas `EmployeeTask` del checklist (PK compuesta `employee_id`+`task_id`, fijas porque los `Task` seedeados son siempre los mismos). `startOffboarding` solo creaba una fila nueva si no existía ninguna para ese `task_id` — si ya existía de la ronda anterior (en cualquier estado), la dejaba intacta, así que el checklist del Home de Alumni aparecía con tareas ya tachadas/vencidas de la ronda vieja en vez de limpio para la ronda nueva.

**Fix:** dentro de `startOffboarding`, después de crear las `EmployeeTask` nuevas, un `EmployeeTask.update({status:'ENROLLED', due_date:lastWorkingDay})` resetea las que ya existían de rondas anteriores. Solo corre para `exitType:'RESIGNATION'` (en despido no hay checklist).

**Verificado end-to-end:** renuncia → completar 1 de 4 tareas (`COMPLETED`) → recontratar (las otras 3 → `DROPPED` automático) → finalizar caso → renunciar de nuevo → las 4 tareas, incluida la que estaba `COMPLETED`, vuelven a `ENROLLED` con la nueva fecha límite.

---

### EXP-1002-FIX-02 · Entrevista de salida se duplicaba para empleados boomerang
**Tipo:** Bug | **Rol:** Talento (HR), Alumni

**Descripción:**
Problema simétrico al de EXP-1002-FIX-01 pero con causa opuesta: como cada `startOffboarding` crea un `Survey`/`SurveyAssignment` **nuevo** para la entrevista de salida (sin PK fija que reusar, a diferencia del checklist), un empleado que renuncia, es recontratado y vuelve a renunciar/lo despiden dentro de la ventana de 30 días sin haber contestado la entrevista de la ronda anterior, terminaba con esa `SurveyAssignment` vieja `PENDING` para siempre — se acumulaba junto a la nueva en `GET /exit-interviews/pending`, mostrando la card de "Entrevista de salida" duplicada en `PulseSurveys`/`AlumniDashboard`.

**Fix:** dentro de `startOffboarding`, antes de crear el `Survey`/`SurveyAssignment` nuevo (corre siempre, incluso si la ronda nueva es despido), se buscan `SurveyAssignment` `PENDING` de entrevistas de salida previas de ese empleado y se cancelan con `.destroy()`. `SurveyAssignment` es `paranoid:true` → soft-delete, desaparece automáticamente de cualquier query (incluida `/exit-interviews/pending`) sin necesitar un status nuevo (`CANCELLED`/`EXPIRED`). El `Survey` huérfano subyacente no se borra (inocuo).

**Verificado end-to-end:** ronda 1 (renuncia, sin contestar la entrevista) → caso cerrado → recontratado → ronda 2 (renuncia boomerang) → `GET /exit-interviews/pending` devuelve 1 sola entrevista (la de la ronda 2), no 2.

---

### EXP-1002-FIX-03 · "Recontratar" no cerraba el EmployeeOffboarding colgado
**Tipo:** Bug | **Rol:** Talento (HR)

**Descripción:**
Tercer bug de la familia boomerang: `PATCH /alumni/:employeeId/rehire` (botón "Recontratar" en `AlumniHome.jsx`) cambia el rol a Colaborador pero nunca tocaba el registro `EmployeeOffboarding`, que quedaba `IN_PROGRESS` para siempre si HR recontrataba sin haber pasado antes por "Finalizar proceso" en `OffboardingDetailPage` (flujo habitual y válido — no tiene sentido forzar ese orden). Efecto: un intento posterior de `POST /offboarding` para ese mismo empleado quedaba bloqueado con 409 ("Ya existe un proceso de offboarding en curso") aunque el empleado ya fuera Colaborador activo de nuevo.

**Fix:** dentro de `rehireAlumni`, después de cambiar el rol, un `EmployeeOffboarding.update({status:'COMPLETED', completed_at:now}, {where:{employee_id, status:'IN_PROGRESS'}})` cierra cualquier caso colgado — recontratar resuelve el offboarding por definición. El botón "Finalizar proceso" sigue existiendo para el cierre administrativo manual cuando HR lo usa antes de recontratar; este fix solo cubre el camino en que no lo usó.

**Verificado end-to-end:** caso `IN_PROGRESS` colgado → `PATCH .../rehire` → caso pasa a `COMPLETED` automáticamente → segundo `POST /offboarding` para el mismo empleado → 201 (antes 409).

---

### EXP-401-FIX-01 · CreateEmployeeModal no asignaba ninguna tarea de onboarding (TODO desde hace mucho, descripción desactualizada)
**Tipo:** Bug | **Rol:** Talento (HR)

**Descripción:**
El TODO original decía "MyTasks muestra solo 1 tarea al asignar onboarding" — verificado el 2026-06-20, la causa real era peor y distinta: `createEmployee` (`employee.controllers.js`) destructuraba `taskType` (un *nombre* de TaskType) de `req.body`, pero `WorkInfoFields.jsx` (selector "Template de plan" del modal de alta) envía `taskTypeId` (un UUID) — claves distintas, nunca se leían entre sí. El fallback hardcodeado `taskType || 'Onboarding'` tampoco coincidía con ningún `TaskType` seedeado real (los nombres reales son "Onboarding estándar", "Onboarding contabilidad", "Onboarding líderes" — nunca el string literal "Onboarding"). Resultado real: **0 tareas asignadas siempre**, sin importar qué template elija HR en el dropdown — no 1.

**Bug secundario encontrado en el mismo bloque:** `task.estimatedDuration` (camelCase) se leía directo sobre la instancia de Sequelize del modelo `Task`, cuyo campo real es `estimated_duration` (snake_case, sin alias camelCase definido) — siempre evaluaba `undefined ?? 0`, así que **todas** las fechas de vencimiento de tareas auto-asignadas en el alta de empleado ignoraban la duración real de cada tarea (quedaban en la fecha de ingreso exacta, sin offset).

**Fix:** `createEmployee` ahora destructura `taskTypeId` (matchea la key real que envía el frontend) y resuelve el TaskType por `id` directo (`Task.findAll({where:{task_type_id: resolvedTaskTypeId}})`) en vez de por nombre vía `include`/`where`. Si no se envía `taskTypeId` (opción "Plan estándar" del dropdown), usa como default el TaskType de sistema `TASK_TYPE.SYSTEM_TASK_TYPES[0]` ("Onboarding estándar") resuelto por nombre una sola vez. Y `task.estimated_duration` reemplaza a `task.estimatedDuration` en el cálculo de `due_date`.

**Verificado end-to-end:** alta de empleado eligiendo "Onboarding estándar" explícito → 6 tareas creadas, `due_date` respetando la duración real de cada tarea (1-2 días). Alta sin elegir template (default) → mismas 6 tareas, mismo comportamiento.

---

### EXP-DEV-10-FIX-01 · Selector de destinatario en Feedback continuo no filtraba empleados inactivos
**Tipo:** Bug | **Rol:** Colaborador

**Descripción:**
Auditoría de EXP-DEV-10 (todos los call-sites de `Alert.create`/`bulkCreate` del backend). La mayoría está disparada por una acción puntual de un empleado/HR ya en contexto, o ya filtra por `status==='ACTIVE'` a nivel del selector frontend (ej. "Responsable" en `OkrManagement.jsx`). Se encontró un caso real sin filtrar: `ContinuousFeedback.jsx` pasaba a `CreateContinuousFeedbackModal` la lista completa de `employees` filtrando solo `id !== propio` y `role !== 'Talento'`, sin excluir Alumni/`INACTIVE` — un Colaborador podía elegir a un excompañero como destinatario de un reconocimiento/sugerencia y disparar `CONTINUOUS_FEEDBACK_RECEIVED` a alguien que ya no trabaja ahí.

**Fix:** se agregó `&& e.status === 'ACTIVE'` al filtro de `employees` en `ContinuousFeedback.jsx` (mismo patrón ya usado en `OkrManagement.jsx#employeeOptions`).

**Resto de la auditoría (sin cambios, ya seguros):** `feedbackAssignmentService.js` (evaluadores ya vienen de una query con `status:'ACTIVE'`), `okrService.js`/`okr.controllers.js` (selector de responsable ya filtrado en `OkrManagement.jsx`), `courseEnrollment.controller.js`/`exitInterview.controller.js`/`employee_task.controllers.js`/`jobOpening.controller.js` (siempre el propio empleado actuando sobre sí mismo), `alumni.controller.js` (el propio empleado siendo recontratado).

---

### EXP-DEV-11-FIX-01 · Checklist de despido mostraba datos de una renuncia previa sin limpiar
**Tipo:** Bug | **Rol:** Talento (HR)

**Descripción:**
Causa raíz: `EmployeeTask` (el checklist de offboarding) no tiene ningún `offboarding_id` que lo vincule a un `EmployeeOffboarding` específico — reutiliza las mismas filas (`employee_id`+`task_id` fijos) entre rondas. `formatOffboarding` buscaba el checklist filtrando solo por `employee_id`, sin scopear por ronda. Secuencia del bug: empleado renuncia (ronda 1) → completa 1 de 4 tareas (`COMPLETED`) → lo recontratan (`rehireAlumni` archiva las `ENROLLED`/`IN_PROGRESS`/`SUBMITTED` a `DROPPED`, pero no toca la que ya estaba `COMPLETED` — correcto en ese momento) → más adelante lo despiden (ronda 2, `TERMINATION`) → como un despido nunca asigna checklist, el bloque de reset de `startOffboarding` se salta por completo (`if (!isTermination...)`) → pero `formatOffboarding` seguía devolviendo `checklist:{total:4, completed:1}` para la ronda 2, arrastrando la tarea vieja de la ronda 1. No era user-facing porque el frontend ya oculta el checklist completo cuando `exitType==='TERMINATION'`, pero la API devolvía el dato sucio.

**Fix:** `formatOffboarding` ahora devuelve `checklist:{total:0, completed:0, tasks:[]}` directo (sin consultar `EmployeeTask`) cuando `offboarding.exit_type==='TERMINATION'`, en vez de depender de que el frontend siga ocultándolo correctamente para siempre. Cambio mínimo (un guard), sin migraciones — no se agregó `offboarding_id` a `EmployeeTask` (hubiera sido la solución arquitectónica completa, pero es sobre-ingeniería para un caso dormant y no user-facing).

**Verificado end-to-end:** renuncia → completar 1 de 4 tareas → recontratar → despido → `GET /offboarding/:employeeId` de la ronda 2 devuelve `checklist:{total:0,completed:0,tasks:[]}` (antes: `{total:4,completed:1}`).

---

### EXP-DEV-01-FIX-01 · Filtro de empleados por departamento movido al backend
**Tipo:** Mejora técnica | **Rol:** Talento (HR)

**Descripción:**
`useFeedbackParticipants.js` (consumido por `FeedbackDetailPage.jsx`, `FeedbackHome.jsx`, `CreateFeedback.jsx`) traía el directorio **completo** de empleados de la empresa (`useEmployees()`, sin filtro) y filtraba por departamento/status en el cliente — innecesario para `FeedbackDetailPage`, que solo necesita los participantes de **un** departamento puntual.

**Fix:**
- `GET /employees` (`employee.controllers.js#getAllEmployees`) ahora acepta `?departmentId=X` y `?status=Y` como filtros opcionales a nivel SQL (`where.department_id`/`where.status`), combinables con la restricción existente de Líder (ve solo su equipo).
- `employeeService.js#getEmployees(params)` y `useEmployees(params)` aceptan un objeto de query params opcional; `useEmployees` usa una `queryKey` separada (`['employees', params]`) cuando hay params, para no pisar/contaminar el cache del directorio completo (`['employees']`) que comparten el resto de las páginas.
- `useFeedbackParticipants(departmentId)`: cuando recibe un `departmentId` (caso `FeedbackDetailPage`), pide directo `GET /employees?departmentId=X&status=ACTIVE` — ya no trae a toda la empresa. Cuando no recibe `departmentId` (caso `FeedbackHome`/`CreateFeedback`, necesitan el headcount de **todos** los departamentos a la vez para `countByDept`), sigue usando la lista completa — filtrar por un solo departamento no aplica a ese cálculo, y de todos modos reutiliza el cache compartido sin petición extra.
- Cierra EXP-DEV-01 y EXP-DEV-06 (mismo pedido, dos tickets duplicados).

**Verificado:** `GET /employees?departmentId=X` → solo empleados de ese departamento; `GET /employees?departmentId=X&status=ACTIVE` → además filtrado por status (probado contra el seed: 22 empleados totales → 4 de un departamento → 2 ACTIVE de ese departamento). `vite build` sin errores.

---

### EXP-DEV-03-FIX-01 · PulseSurveys sin fallback a auth + sin entrada en sidebar
**Tipo:** Bug | **Rol:** Colaborador, Líder

**Descripción:**
El TODO original (de antes de implementar roles/auth) pedía integrar `EmployeeFeedbackReport`/`PulseSurveys` a "Mi perfil". Verificado el 2026-06-20: `EmployeeFeedbackReport.jsx` ya resuelve la identidad vía auth (`params.get('evaluatedId') || user?.employeeId`) desde hace tiempo — solo le falta la integración a "Mi perfil" (sigue siendo su propio ítem "Mis resultados 360°" en el sidebar, sin cambios hoy, redesign de UI mayor fuera de alcance). `PulseSurveys.jsx`, en cambio, seguía exactamente como describía el TODO viejo: leía `searchParams.get('employeeId')` directo de la URL **sin fallback a auth**, y no tenía ningún ítem en el sidebar — la única forma de llegar era un link armado a mano en `ColaboradorDashboard.jsx` (Home) o un alert `PULSE_SURVEY_DUE` con el query param ya resuelto. Un Líder no tenía **ninguna** forma de llegar ahí (ni sidebar ni Home), y cualquiera que navegara a `/pulsesurveys` sin el query param veía el estado vacío "especificá un empleado" aunque estuviera logueado.

**Fix:**
- `PulseSurveys.jsx`: `employeeId = searchParams.get('employeeId') || user?.employeeId` (mismo patrón que `EmployeeFeedbackReport`) — el query param sigue funcionando para los links existentes (Alertas, Home), pero ya no es obligatorio.
- `Sidebar.jsx`: nuevo ítem "Encuestas de pulso" (ícono `Activity`) → `/pulsesurveys`, `roles:['Colaborador','Líder']` — ahora Líder también tiene una entrada real, no solo Colaborador vía Home.
- No se integró a "Mi perfil" — eso requeriría rediseñar `DetailEmployee.jsx` como vista con tabs/secciones, un cambio de UI mucho mayor que el bug real (que era la falta de fallback a auth + sin acceso para Líder). Si en el futuro se quiere consolidar todo en "Mi perfil", es una iniciativa de diseño aparte.

**Verificado:** `GET /pulse-surveys/pending?employeeId=<propio>` responde 200 autenticado. `vite build` sin errores.

---

### EXP-DEV-17-FIX-01 · Endpoints admin/cron sin protección de rol
**Tipo:** Bug (seguridad) | **Rol:** Talento (HR)

**Descripción:**
Al verificar EXP-DEV-02 (que resultó ya estar implementado) se encontró que `POST /admin/cron/onboarding-run` y `POST /admin/cron/pulse-run` (`routes.js:141,148`) están detrás de `authenticateToken` (requieren sesión) pero **sin `authorize('Talento')`** — cualquier usuario autenticado, incluido un Alumni, podía disparar manualmente los crons de tareas vencidas y asignación de encuestas de pulso. El propio código los marca con `// TODO: eliminar estos endpoints — solo para pruebas de desarrollo`.

**Fix:** se agregó `authorize('Talento')` a ambas rutas (import de `middlewares/authorize` agregado a `routes.js`). Los endpoints siguen existiendo para pruebas manuales de HR, pero ya no son de acceso público-autenticado.

**Verificado:** Colaborador/Alumni → 403 en ambos endpoints; Talento → 200, cron ejecutado correctamente.

---

### EXP-DEV-17-FIX-02 · Endpoints admin/cron eliminados (no tenían un caso de uso real)
**Tipo:** Limpieza | **Rol:** —

**Descripción:**
Tras protegerlos con `authorize('Talento')` (EXP-DEV-17-FIX-01), se cuestionó si valía la pena mantenerlos vivos: no tienen ningún caller en el frontend, ningún botón en la UI, y un usuario Talento real no tiene forma de descubrir que existen (son rutas crudas, solo invocables con curl/Postman conociendo los nombres internos de los cron jobs). El argumento de "recovery si el cron no corrió" es débil — si el server estaba caído a las 9am, tampoco se puede pegar al endpoint HTTP; y si un dev necesita forzar el cron para testing, alcanza con un script suelto (`node -e "require(...).checkOverdueTasks()"`, como se usó durante toda esta sesión) sin necesidad de exponer una ruta HTTP en el código de producción.

**Fix:** se eliminaron por completo `POST /admin/cron/onboarding-run` y `POST /admin/cron/pulse-run` de `routes.js`, junto con los imports `authorize`, `checkOverdueTasks` y `assignDuePulseSurveys` (sin otro uso en ese archivo). Los cron jobs programados (`startOnboardingCronJob`/`startPulseCronJob`, diarios a las 9am) no se tocaron — siguen corriendo igual, solo se eliminó el trigger manual vía HTTP.

**Verificado:** backend arranca limpio, los 3 crons (`pulseCron`/`onboardingCron`/`okrCron`) siguen "scheduled (daily at 09:00)" en el log de arranque. `POST /admin/cron/pulse-run`/`onboarding-run` con sesión válida de Talento → `404` (antes `200`). Resto de la API sin cambios (`/auth/login` → `200`).

---

### EXP-DEV-07-FIX-01 · Activos asignados (`Asset`/`EmployeeAsset`) — exposición read-only
**Tipo:** Feature mínima | **Rol:** Talento

**Descripción:**
`Asset`/`EmployeeAsset` tenían modelo, seed (con datos realistas, ej. "Entregado al empleado en onboarding") y asociaciones completas en `relations.js` desde hacía tiempo, pero cero controllers/rutas/UI — el dato existía en la BD pero era invisible desde la app. En vez de construir un módulo de inventario completo (altas/bajas de activos, fuera de alcance) o borrar el modelo, se decidió cerrar el loop mínimo: hacer visible ese dato donde ya hace falta, sin tocar la gestión de activos en sí (que sigue siendo manual en BD).

**Fix backend:**
- `employee.controllers.js`: nuevo `EMPLOYEE_DETAIL_INCLUDE` (= `EMPLOYEE_INCLUDE` + `EmployeeAsset`→`Asset`), usado solo en `getEmployeeById` (no en `getAllEmployees`, para no agregar un JOIN extra a cada fila del listado completo). `formatEmployee` agrega `assets` (solo activos con `return_date: null`) — el campo queda `undefined` (no aparece en el JSON) cuando no se incluyó `e.assets`, así el listado (`GET /employees`) no lo expone.
- `offboarding.controller.js#formatOffboarding`: agrega `assets` (mismo filtro `return_date: null`) a la respuesta de `GET /offboarding`/`GET /offboarding/:employeeId`. A diferencia del checklist/entrevista de salida, **no se omite en despido** — la notebook hay que recuperarla en ambos casos (renuncia o despido).

**Fix frontend:**
- `DetailEmployee.jsx`: nueva sección "Activos asignados" (solo lectura, ícono `Laptop`), oculta si el empleado no tiene activos sin devolver.
- `OffboardingDetailPage.jsx`: nueva card "Activos a devolver" junto al checklist/entrevista de salida, con conteo y número de serie por activo.

**Verificado:** `GET /employees` (lista) no trae la key `assets` en ningún elemento; `GET /employees/:id` sí, filtrado a no devueltos (probado con Gonzalo Vega → Mouse Logitech). `GET /offboarding` trae `assets` en cada proceso (probado con Florencia Sosa → 6 activos). `vite build` sin errores.

**Bug encontrado durante esta misma verificación — corregido en el mismo commit:** `EMPLOYEE_DETAIL_INCLUDE` sin `separate: true` en el include de `assets` truncaba el array a 1 elemento (en vez de los 6 reales) cuando el empleado tenía además al menos 1 `leader` — dos `hasMany` (`leaders` vía `Team`, `assets` vía `EmployeeAsset`) en el mismo nivel bajo `Employee` generan un producto cartesiano en el SQL plano que Sequelize no separa bien al hidratar los arrays anidados. Fix: `separate: true` en el include de `assets` (fuerza una query aparte para esa relación). Verificado con Florencia Sosa (1 leader + 6 assets): sin el flag devolvía `assets.length === 1`; con el flag, `6`. El include de `offboarding.controller.js` no tiene este problema — ahí `EmployeeAsset` se consulta como modelo top-level (`EmployeeAsset.findAll(...)`), no anidado bajo `Employee` junto a otro `hasMany`.

---

### EXP-DEV-07-FIX-02 · "Marcar como devuelto" en OffboardingDetailPage
**Tipo:** Feature mínima | **Rol:** Talento

**Descripción:**
Cierra el loop de EXP-DEV-07-FIX-01: la card "Activos a devolver" mostraba los activos pendientes pero no había ninguna acción para resolverlos — quedaban listados para siempre aunque el empleado ya entregara el equipo.

**Fix backend:**
- `employee.controllers.js#returnAsset` (nuevo) — `PATCH /employees/:id/assets/:assetId/return`: busca el `EmployeeAsset` activo (`employee_id`+`asset_id`+`return_date: null`), 404 si no existe (ya devuelto o no asignado a ese empleado), si existe hace `update({return_date: new Date()})`. Sin body — la fecha de devolución es siempre "ahora", no se acepta una fecha arbitraria (no hace falta para este caso de uso).
- `routes.employee.js`: `router.patch('/:id/assets/:assetId/return', authorize('Talento'), ...)`.

**Fix frontend:**
- `services/employeeService.js#returnAsset` + `hooks/useEmployeeById.js#useReturnAsset` (invalida `['employee', employeeId]` y `['offboardings']` — la misma lista de activos se muestra en `DetailEmployee` y en `OffboardingDetailPage`).
- `OffboardingDetailPage.jsx`: cada activo de la card "Activos a devolver" tiene un botón "Marcar como devuelto" (deshabilitado mientras esa mutación específica está en curso, vía `mutation.variables?.assetId === a.id`); al confirmar, desaparece de la lista (el array ya no lo incluye, por filtrar `return_date: null`).

**Verificado:** con Florencia Sosa (6 activos) → `PATCH .../return` sobre uno → `200`, `GET /employees/:id` pasa de 5 a 4 sin devolver, mismo resultado reflejado en `GET /offboarding/:employeeId`. Segundo `PATCH` sobre el mismo activo → `404`. Intento con rol Colaborador → `403`. `vite build` sin errores.

---

### EXP-DEV-07-FIX-03 · Registro manual de activos a devolver al iniciar el proceso
**Tipo:** Feature mínima | **Rol:** Talento

**Descripción:**
Hasta ahora `Asset`/`EmployeeAsset` solo mostraban lo que vino del seed — no había ningún flujo para registrar un activo nuevo, así que un empleado cuyo equipo nunca quedó cargado en el sistema no aparecía en "Activos a devolver" aunque HR supiera perfectamente que tiene una notebook que recuperar. Se agregó un campo opcional en `StartOffboardingModal` para que HR anote esos activos justo en el momento en que más le importa: al iniciar el offboarding.

**Decisión de diseño:** cada item registrado crea un `Asset` nuevo (`Asset.create`, nunca `findOrCreate`) — no se intenta matchear contra el inventario existente por nombre/serie. Motivo: `EmployeeAsset.asset_id` tiene `unique: true` (un asset físico solo puede tener una asignación en toda su vida), así que reusar un `Asset` ya asignado a otro empleado en otro momento rompería ese constraint. Como esto es un registro ad-hoc ("recordame devolver esto"), no inventario real, crear siempre un objeto nuevo es la simplificación correcta — sin esto, dos empleados anotando "Notebook Dell" sin serie chocarían al segundo intento.

**Fix backend:** `offboarding.controller.js#startOffboarding` acepta `assets: [{name, serialNumber}]` opcional en el body. Por cada item con `name` no vacío: `Asset.create({name, serial_number: serialNumber || null})` + `EmployeeAsset.create({employee_id, asset_id, assignment_date: now})`. Corre sin condicionar por `exitType` — aplica igual en despido (hay que recuperar el equipo en ambos casos, mismo criterio que el resto de la sección de activos).

**Fix frontend:** `offboardingService.js#startOffboarding` reenvía `assets`. `StartOffboardingModal.jsx` agrega sección "Activos a devolver (opcional)" — lista dinámica con inputs nombre (requerido) + N° de serie (opcional) + botón "+", mismo patrón visual que la sección de Tags ya existente (chips con botón de quitar).

**Verificado:** `POST /offboarding` con 2 activos nuevos (uno con serie, uno sin) → `201`, ambos aparecen en la respuesta junto a los 5 ya existentes del seed, mismo resultado en `GET /offboarding/:employeeId` y `GET /employees/:id`. Limpiado con `PATCH .../return` ×2 + `PATCH .../complete` + `PATCH /alumni/:id/rehire` para devolver a Florencia Sosa a su estado original. `vite build` sin errores.

**Typo "Offboarding estándad" corregido a "Offboarding estándar" (2026-06-21):** detectado al revisar el diff antes de un commit — un cambio accidental en `OnboardingHome.jsx` (probablemente autocorrección del editor) había "arreglado" el typo solo ahí, lo que rompía el matching contra el nombre real persistido en la base (`task_types.name`) y todas las demás referencias en código, que seguían con el typo. En vez de revertir ese cambio, se corrigió de raíz: `UPDATE task_types SET name='Offboarding estándar' WHERE name='Offboarding estándad'` (1 fila, dato ya seedeado) + se actualizaron las 9 referencias restantes al string viejo en código (`models.constants.js#OFFBOARDING.CHECKLIST_TASK_TYPE`, `seeds.task_types.js`, `seeds.tasks.js` ×3, comentarios en `offboarding.controller.js`/`utils/offboarding.js`, y en frontend: `CreateEmployeeModal.jsx#NON_ONBOARDING_TASK_TYPES`, `TemplateListPanel.jsx#SYSTEM_TASK_TYPES`, `MyTasks.jsx`/`OffboardingChecklistCard.jsx#OFFBOARDING_CHECKLIST_TASK_TYPE`, comentario en `AlumniDashboard.jsx`). Verificado: el TaskType renombrado se sigue encontrando por nombre, `POST /offboarding` de prueba asignó el checklist completo (4 tareas) sin problemas.

**Limitación conocida, sin resolver (caso borde, baja probabilidad):** `Asset` tiene un índice único sobre `(name, serial_number)` juntos (no sobre `EmployeeAsset.asset_id`, ese es el constraint distinto que sí se evita con `Asset.create` siempre nuevo, ver arriba). Si dos registros manuales usan el mismo nombre **y** la misma serie exacta (ej. dos personas tipean "Notebook Dell" / "ABC123" por coincidencia o error de tipeo), el segundo `Asset.create` rompe ese índice único y la request de `POST /offboarding` falla con 500. No se resolvió porque el escenario es poco probable (una serie real debería ser única por definición) y no vale la pena la complejidad adicional (ej. capturar el error y reusar el asset, o validar antes) para este alcance básico. Si en el futuro se reporta este caso en producción, ahí se evalúa un fix puntual.

---

### EXP-DEV-19 · Auditoría de seguridad backend round 2 — `authorize()` faltante + ownership checks + reglas de negocio para Alumni

**Tipo:** Bug (seguridad) | **Rol:** Talento (HR)

**Descripción:**
Continuación de la auditoría de `authorize()` del 2026-06-18 (que cubrió `routes.user.js`, `routes.department.js`, `routes.team.js`, `routes.task.js`, `routes.task_type.js`, `routes.jobOpening.js`, `routes.continuousFeedback.js`). Esta ronda (2026-06-21) revisó los ~23 archivos de rutas restantes y encontró el mismo patrón de bug sin corregir, más algunas reglas de negocio faltantes alrededor del rol Alumni.

**`authorize()` faltante, corregido:**
- `POST /user` → `authorize('Talento')` (el `PATCH`/`DELETE` ya lo tenían desde 2026-06-18, el `POST` había quedado afuera — permitía auto-provisionar un `User` con `roleId` arbitrario).
- `POST/PATCH/DELETE` de `/learning-courses`, `/person`, `/question`, `/question-option`, `/question-type`, `/survey-type` → `authorize('Talento')` en los 6 archivos (CRUD de catálogo/admin usado solo desde páginas Talento-only, sin protección real en el backend).
- `PATCH /course-enrollments/:id/review` → `authorize('Talento')` (aprobación de finalización de curso, acción HR-only que cualquier autenticado podía disparar).
- `POST`/`DELETE /survey-assignment` → `authorize('Talento')` (sin caller real en el frontend).
- `DELETE /survey-response/...` → `authorize('Talento')`.
- `POST`/`DELETE /employee-task` → `authorize('Talento')` (creación/borrado son acciones de template management, Talento-only en el frontend).
- `GET /feedback-assignment`, `PATCH /feedback-assignment/:id` → `authorize('Talento','Líder','Colaborador')` (excluye Alumni).

**Ownership checks agregados a nivel controller** (no se podía restringir por rol porque el propio empleado usa el endpoint sobre sus propios datos):
- `PATCH /employee-task/:employeeId/:taskId` — Talento/Líder sin restricción (aprueban tareas de otros), el resto solo su propio `employeeId`.
- `PATCH /survey-assignment/:surveyId/:employeeId/:assignedBy` — mismo patrón (completar la propia encuesta de Pulso).
- `PATCH /alerts/:id/read` — Talento sin restricción, el resto solo si `alert.employee_id` es el propio.
- `POST /course-enrollments`, `POST /course-enrollments/external`, `PATCH /course-enrollments/:id/progress`, `PATCH /course-enrollments/:id/request-completion` — mismo patrón sobre la propia inscripción.

**Reglas de negocio agregadas (empleado `INACTIVE`/Alumni no debe ser target de acciones nuevas):**
- `createOkr`/`updateOkr` — 400 si el `responsibleEmployeeId` no está `ACTIVE`.
- `POST /job-openings/:id/apply` — 400 si el postulante no está `ACTIVE`.
- `POST /continuous-feedback` — 400 si el `receiver` no está `ACTIVE` (antes solo se filtraba en el selector del frontend).

**Otros fixes de la misma auditoría:**
- `team.controllers.js` — `PERSON_ATTRS` (objeto de include compartido entre `leader`/`collaborator`) separado en dos literales, defensivo (mismo patrón estructural del gotcha de "include compartido" ya documentado, aunque acá no estaba rompiendo nada).
- `offboarding.controller.js#startOffboarding` — valida que `lastWorkingDay` sea una fecha parseable (400, antes generaba un `Invalid Date` silencioso) y que los items de `assets` no superen 150 caracteres en `name`/`serialNumber` (400 en vez de un 500 crudo de Sequelize).

**Acceptance Criteria:**
- [ ] Las 13 rutas listadas arriba devuelven 403 para roles no autorizados
- [ ] Los 7 endpoints con ownership check devuelven 403 cuando un empleado intenta actuar sobre el recurso de otro, y 200 cuando actúa sobre el propio
- [ ] Talento/Líder mantienen su bypass donde corresponde (aprobaciones)
- [ ] OKR/postulación a vacante/feedback continuo rechazan empleados inactivos con 400

**Verificado end-to-end:** backend levantado con `--env-file=.env.dev`, `curl` autenticado como Talento/Líder/Colaborador reales (usuarios de seed). Confirmado 403 en los 3 endpoints Talento-only probados desde Colaborador; 403 cruzado / 200 propio en `employee-task` y `course-enrollments`; 403 al marcar la alerta de otro; 400 en OKR/feedback continuo/postulación contra un empleado Alumni; 400 (antes 500) en offboarding con fecha inválida.

**No corregido, deuda documentada (ver TODOs):**
- `EXP-DEV-20` — `/survey-response` (POST/PATCH) sin ownership check: el modelo no tiene `employee_id`, solo `survey_assignment_id`+`question_id`, y en la práctica `survey_assignment_id` viaja como el `surveyId` plano (no como referencia a una asignación de un empleado puntual). No se puede validar "es tu propia respuesta" sin agregar una columna — fuera de alcance de esta auditoría.
- `EXP-DEV-21` — `startOffboarding` no usa transacción de Sequelize a pesar de ~10 escrituras secuenciales (riesgo de estado a medio migrar si falla a mitad de camino, ej. el `Asset.create` con nombre+serie duplicados).
- `EXP-DEV-22` — `rehireAlumni` archiva (`DROPPED`) tareas en `SUBMITTED` al recontratar, perdiendo revisiones de HR en curso sin distinguirlo de una tarea simplemente abandonada.
- `EXP-DEV-23` — Falta `onDelete` en las FKs de `EmployeeOffboarding`, `AlumniProfile`, `CareerPlan`, `Asset`/`EmployeeAsset` — un `DELETE` de `Employee`/`JobOpening` con dependientes tira un 500 crudo de Postgres en vez de un 409 claro (mismo patrón ya resuelto a propósito para `Skill`, ver EXP-603).

---

### EXP-DEV-24 · Auditoría frontend cruzada con la auditoría de backend EXP-DEV-19 (mismo día)

**Tipo:** Bug (seguridad/privacidad) | **Rol:** Talento (HR)

**Descripción:**
Continuación inmediata de EXP-DEV-19: con el backend recién endurecido, se auditó el frontend buscando (1) páginas sin `RoleRoute` que el backend ya no cubre por sí solo, (2) si los flujos que ahora pueden recibir 403/400 nuevos los manejan con gracia, (3) calidad general (código muerto, duplicación).

**`RoleRoute` faltante, corregido:** `AssignTemplatePage`, `CreateTemplatePage`, `CreateFeedback`, `HRFeedbackReport` eran páginas Talento-only por nombre/uso real pero auto-generadas por `router.js` sin ningún `RoleRoute` — accesibles por URL directa para cualquier rol. Las 4 se agregaron a la exclusión de `router.js` y se registraron en `App.jsx` con `RoleRoute allowed={['Talento']}`.

**Bug de privacidad encontrado en el backend (una capa más abajo del `RoleRoute`):** investigando `HRFeedbackReport`/`EmployeeFeedbackReport` se encontró que `GET /feedback-assignment/results` y `GET /feedback-assignment/gap-analysis` no validaban `evaluatedId` contra el empleado autenticado — cualquier Colaborador/Líder podía ver los scores y el análisis de brechas IA **completo** de otro empleado, sin importar si HR ya lo había "enviado" (`sent_sections`). El flujo de aprobación de privacidad de EXP-103 solo se aplicaba en el frontend al renderizar, nunca en la API.
- Fix `getResults`: ownership check (Talento/Líder sin restricción, el resto solo su propio `evaluatedId`).
- Fix `getGapAnalysis`: mismo ownership check + redacción real server-side (`strengths`/`gaps`/`suggestions`/`summary` se devuelven `null` si la sección no está en `sent_sections`, para quien no sea HR) + `authorize('Talento','Líder','Colaborador')` agregado a la ruta (no tenía ninguno).

**Bugs de UX corregidos (modales con `unhandled promise rejection` ante cualquier error del backend):** `OkrFormModal.jsx`, `CreateContinuousFeedbackModal.jsx`, `ExternalCertificationModal.jsx` hacían `await onSubmit(...)` sin `try/catch` — un error (incluidos los 400 nuevos de EXP-DEV-19, aunque hoy inalcanzables desde la UI por los filtros ya existentes) dejaba el modal colgado sin mensaje. Se agregó `try/catch` + estado de error visible, mismo patrón que `ResponseForm360`/`JobOpeningApplyModal`.

**Acceptance Criteria:**
- [ ] Las 4 páginas devuelven `RoleRoute`/redirect para roles no-Talento
- [ ] `GET /feedback-assignment/results` y `/gap-analysis` devuelven 403 si `evaluatedId` no es el propio (salvo Talento/Líder)
- [ ] `/gap-analysis` no devuelve secciones no enviadas (`sent_sections`) a un Colaborador/Líder, incluso pegándole directo a la API
- [ ] Los 3 modales muestran un mensaje de error en vez de quedar colgados ante un fallo

**Verificado end-to-end:** `vite build` sin errores. Backend real + curl: Colaborador A con el `evaluatedId` de Colaborador B en `/results` y `/gap-analysis` → 403 en ambos; con su propio `evaluatedId` → pasa el chequeo; Talento → sin restricción.

**No corregido, deuda documentada (ver TODOs):**
- `EXP-DEV-25` — 5 de 8 flujos que pueden recibir un 403/400 nuevo (toggle de tareas, marcar alerta leída, los 4 de `course-enrollments`) fallan en silencio sin mensaje — patrón general de mutaciones con solo `onSuccess`/`mutate()` fire-and-forget, no específico de esta sesión.
- `EXP-DEV-26` — 11 exports huérfanos en `services/`/`hooks/` (`surveyTypeService.js` completo, `feedback360Service.js#getAssignments/createAssignment`, etc.) — mismo patrón de la limpieza de 2026-06-16, quedaron afuera.
- `EXP-DEV-27` — `JobOpeningsList`, `MyEvaluations`, `EmployeeFeedbackReport` registradas a mano en `App.jsx` pero también auto-generadas por no estar en la exclusión de `router.js` (doble-registro inofensivo al mismo path/componente, sin bug de protección — a diferencia del histórico — pero amerita prolijidad).
- `EXP-DEV-28` — ~10 reimplementaciones locales de `formatDate` casi idénticas en `pages/**` — candidato a extraer a un helper compartido, sin bug.
- `EXP-DEV-29` — `apiClient.js` sin interceptor de `response`/401 — cada sesión vencida se maneja (o no) independientemente en cada call site, sin redirect-a-login centralizado.

---

### EXP-DEV-29-FIX-01 · Cierre de los TODOs "simples" de la auditoría de seguridad (EXP-DEV-20/29) + bug nuevo encontrado en testing

**Tipo:** Bug + mejora técnica | **Rol:** Talento (HR)

**Descripción:**
Cierre de los ítems de menor esfuerzo identificados en EXP-DEV-19 (`apiClient.js` sin interceptor 401, activo duplicado → 500, `rehireAlumni` dropeando `SUBMITTED`, falta de guard en `DELETE /employee`/`DELETE /job-openings`). Verificado end-to-end contra el backend real (no solo lectura de código) — apareció un bug nuevo en el camino, no relacionado a los fixes en sí.

**`EXP-DEV-29` — `apiClient.js#interceptors.response`:** cualquier 401 fuera de `/auth/*` ahora dispara `store.dispatch(clearUser())` (import dinámico de `store.js`/`authSlice.js` para evitar el ciclo `apiClient → store → authSlice → authService → apiClient`). `PrivateRoute` ya redirige a `/login` solo con que `user` pase a `null`, así que no hace falta navegar a mano. Se excluye `/auth/*` porque un 401 ahí (login con credenciales inválidas) es un error de formulario esperado, no una sesión vencida.

**Activo duplicado (name+serial) → 400 en vez de 500:** `startOffboarding` ahora atrapa `UniqueConstraintError` en el `Asset.create` del loop de "activos a devolver" y devuelve un 400 claro (`"Ya existe un activo registrado con el nombre... y ese número de serie."`) en vez de dejar pasar el 500 crudo de Postgres.

**`EXP-DEV-22` — `rehireAlumni` ya no dropea tareas `SUBMITTED`:** el bulk-`DROPPED` al recontratar ahora excluye `SUBMITTED` (queda solo `ENROLLED`/`IN_PROGRESS`) — una certificación externa o curso con diploma ya subido y pendiente de revisión de HR sobrevive el ciclo de recontratación en vez de perderse silenciosamente.

**`EXP-DEV-23` — guard genérico contra `DELETE` con dependientes:**
- `deleteEmployee` (`employee.controllers.js`): se intentó primero un guard específico por `SequelizeForeignKeyConstraintError` (mismo patrón que `skill.controller.js`), pero **el testing en vivo reveló que el error real no es ese**: `SurveyAssignment.employee_id` es parte de la PK compuesta (`allowNull:true` a nivel Sequelize, pero NOT NULL real en Postgres por ser PK — mismo gotcha ya documentado para `assigned_by`), así que el `onDelete` que Sequelize infiere por default (`SET NULL`, porque el campo es `allowNull:true`) es **imposible de cumplir** sobre una columna de PK → Postgres tira un `SequelizeDatabaseError` crudo ("viola la restricción not-null"), no un `ForeignKeyConstraintError`. Fix ampliado para atrapar ambas clases de error y devolver 409 con un mensaje claro. **Verificado con un empleado real del seed:** antes → 500 con el mensaje crudo de Postgres expuesto al cliente; después → 409 limpio, empleado no tocado.
- `core_ctrl_delete_job_opening` (`jobOpening.controller.js`): cambiado de `res.status(500)` directo a `next(error)`, para que `errorHandler.js` (que ya traduce `ForeignKeyConstraintError`→400 y `UniqueConstraintError`→409 globalmente) se aplique acá también. **Corrección sobre la estimación original:** `JobOpening` es `paranoid:true` (soft-delete) — un `DELETE` nunca llega a ejecutar un `DELETE FROM` real en Postgres (es un `UPDATE deleted_at=now()`), así que el riesgo de FK violation que motivó este ítem **no existe en la práctica** para esta tabla; confirmado en vivo borrando (y restaurando) una vacante con un `CareerPlan` real asociado — la operación "tuvo éxito" sin tocar el `CareerPlan` en absoluto, sin ningún error que traducir. El cambio se mantiene como mejora de consistencia (mismo patrón de error que el resto de los controllers modernos), no como fix de un bug reproducible.

**Bug nuevo encontrado durante el testing de `rehireAlumni` (no relacionado a los fixes de arriba):** `formatOffboarding` tiene el guard `isTermination ? [] : ...` para el checklist (fix de EXP-DEV-11-FIX-01) pero **nunca se aplicó el mismo guard a la consulta de `exitInterview`** — a pesar de que el comentario en el código y el acceptance criteria de EXP-1006 dicen explícitamente que un despido no debe tener entrevista de salida (`exitInterview === null`). Reproducido en vivo: empleado con una ronda de renuncia vieja (entrevista ya `COMPLETED`) → despedido en una ronda nueva → `GET /offboarding/:employeeId` devolvía la entrevista `COMPLETED` de la ronda vieja en vez de `null`. No es user-facing (el frontend ya oculta la entrevista por completo para `TERMINATION` en los 3 lugares donde se muestra) pero la API devolvía el dato sucio — exactamente el mismo patrón ya resuelto para el checklist, que quedó sin aplicar acá. Fix: mismo guard `isTermination ? null : await SurveyAssignment.findOne(...)`.

**Verificado end-to-end (backend real, `curl`, usuarios de seed — con limpieza completa de cada artefacto de prueba después):**
- 401 fuera de `/auth/*` → interceptor agregado, verificado por `vite build` (revisión de código, no hay sesión real expirable a mano en este entorno de testing).
- Activo duplicado en el mismo `assets[]` de un `POST /offboarding` → 400 con mensaje claro; empleado no transicionó a Alumni (el error ocurre antes del cambio de rol); activo parcial creado por el primer item del array limpiado vía `PATCH .../assets/:assetId/return`.
- `DELETE /employees/:id` sobre un empleado real con datos asociados → 409 limpio (antes 500 con mensaje crudo de Postgres); empleado intacto.
- `DELETE /job-openings/:id` sobre una vacante con un `CareerPlan` real → sigue devolviendo 200 (soft-delete, no hay FK que viole) — **restaurada inmediatamente vía `.restore()`** tras confirmar que el soft-delete no afecta al `CareerPlan` (`job_opening_id` no quedó en `null`).
- Certificación externa `SUBMITTED` → empleado despedido (Alumni) → recontratado → tarea sigue `PENDING_APPROVAL` (antes se perdía a `DROPPED`) → rechazada manualmente para cerrar el ciclo de prueba.
- Bug nuevo de `exitInterview`: confirmado antes (devolvía la entrevista vieja) y después del fix (`null`) sobre el mismo empleado/ronda de despido.
- Efecto colateral encontrado y resuelto en el camino: el empleado de prueba tenía un `EmployeeOffboarding` `IN_PROGRESS` colgado de una sesión de testing anterior (exactamente el bug ya documentado en EXP-1002-FIX-03) — cerrado vía `PATCH .../complete` antes de poder continuar.

---

### EXP-DEV-21-FIX-01 · `startOffboarding` envuelto en una transacción de Sequelize

**Tipo:** Mejora técnica | **Rol:** Talento (HR)

**Descripción:**
`startOffboarding` hace ~10 escrituras secuenciales (crear el caso, activos a devolver, checklist, cancelar entrevistas viejas, crear la entrevista nueva, cambiar el rol a Alumni, crear `AlumniProfile`, vencer tareas de otros templates) sin ninguna transacción — si cualquier paso fallaba a mitad de camino (ej. el activo duplicado de EXP-DEV-07-FIX-03), el empleado quedaba en un estado a medio migrar: el `EmployeeOffboarding` ya creado pero el rol sin cambiar, o algunos activos ya guardados y otros no.

**Fix:** todo el bloque de escritura (desde `EmployeeOffboarding.create` hasta el vencimiento de tareas de otros templates) ahora corre dentro de `sequelize.transaction()`, con `{transaction: t}` en cada `create`/`update`/`bulkCreate`/`destroy`/`findOne`/`findAll` involucrado — mismo patrón ya usado en `employee.controllers.js#createEmployee`. Quedan **fuera** de la transacción a propósito:
- La resolución de `checklistTaskType`/`exitInterviewQuestionType` (`getOffboardingChecklistTaskType`/`getExitInterviewQuestionType`, `findOrCreate` idempotente sobre referencias de sistema ya seedeadas) — son datos de infraestructura compartidos, no algo específico de esta operación que deba revertirse.
- El `Alert.create` de `OFFBOARDING_STARTED` — fire-and-forget después del `commit`, una alerta que falle no debería revertir un offboarding ya confirmado.

El caso del activo duplicado (única rama que sale con un `return` directo en vez de propagar la excepción al `catch`) ahora hace `await t.rollback()` explícito antes de responder 400, para no dejar la conexión/transacción abierta.

**Acceptance Criteria:**
- [ ] Un fallo a mitad de camino (ej. activo duplicado) no deja ningún rastro: ni el `EmployeeOffboarding`, ni el checklist, ni el cambio de rol
- [ ] El camino feliz sigue creando todo exactamente igual que antes (checklist, entrevista, activo, transición a Alumni, alerta)
- [ ] No se reintroduce ningún `await t.rollback()` faltante en una rama de error nueva

**Verificado end-to-end (backend real, `curl`, con limpieza completa después de cada prueba):**
- **Rollback:** `POST /offboarding` con dos activos duplicados (mismo `name`+`serialNumber`) dentro del mismo `assets[]` → 400; confirmado que **ni siquiera el primer activo** del array quedó guardado (antes del fix, el primero sí se guardaba); el empleado siguió `ACTIVE`/`Colaborador` sin cambios; no se creó ningún `EmployeeOffboarding` nuevo (el endpoint `GET /offboarding/:employeeId` siguió devolviendo el último caso `COMPLETED` de una prueba anterior, no uno nuevo `IN_PROGRESS`).
- **Camino feliz:** `POST /offboarding` (renuncia, con un activo y tags) sobre un empleado limpio → 201 con checklist de 4 tareas `ENROLLED`, entrevista de salida `PENDING` con `Survey`/`SurveyAssignment` reales, activo nuevo creado y asociado, `employee.status` → `INACTIVE`, rol → `Alumni`, alerta `OFFBOARDING_STARTED` visible en `GET /alerts` del empleado — todo confirmado tras el `commit`. Revertido completo vía `PATCH /alumni/:id/rehire` (rol/status) + `PATCH .../assets/:assetId/return` (activo).

---

### EXP-DEV-20-FIX-01 · Ownership check en `/survey-response` sin cambiar el esquema

**Tipo:** Bug (seguridad) | **Rol:** Colaborador, Líder

**Descripción:**
`POST /survey-response` (único endpoint de este recurso con un caller real — `PulseSurveyForm.jsx#submitPulseResponse`, el flujo de Pulso 30/60/90) no validaba que el empleado autenticado fuera el dueño de la encuesta que estaba respondiendo. El modelo `SurveyResponse` no tiene columna `employee_id` (solo `survey_assignment_id`+`question_id` como PK compuesta), lo que parecía bloquear cualquier validación de ownership sin una migración.

**Decisión — sin cambio de esquema, mismo patrón ya usado en el código:**
Antes de decidir el approach se investigaron dos preguntas clave:
1. **¿`survey_assignment_id` identifica a un empleado puntual sin ambigüedad?** Sí — a pesar del nombre, este campo en la práctica guarda `Survey.id` (no una referencia real a la PK compuesta de `SurveyAssignment`, ver `PulseSurveyForm.jsx`). Pero `pulseCronJob.js#assignDuePulseSurveys` crea un `Survey` **nuevo por cada empleado** en cada check-in (nunca se reusa un template entre empleados), así que `survey_id` sí identifica una asignación de un empleado específico sin ambigüedad — no hace falta que sea una FK real para que la validación sea correcta.
2. **¿Ya existe este patrón de validación en el código?** Sí — `pulseSurveyService.js#handleCompletePulseSurvey` ya hace exactamente este lookup (`SurveyAssignment.findOne({where:{survey_id, employee_id}})`) antes de leer las respuestas para el análisis de Gemini. Se reusa el mismo patrón en vez de inventar uno nuevo.

Con esto confirmado, se optó por la solución liviana: en `createResponse`, si el rol no es Talento, se exige que exista una `SurveyAssignment` con `{survey_id: surveyAssignmentId, employee_id: req.user.employeeId, status: 'PENDING'}` — 403 si no. **Se agregó también el chequeo de `status: PENDING`** (no pedido originalmente, encontrado al analizar el flujo): sin esto, nada impedía crear/alterar respuestas sobre una encuesta ya `COMPLETED` — un Colaborador podía reabrir y modificar sus propias respuestas históricas de Pulso después de que el análisis de Gemini ya se había generado sobre la versión original, sin que HR se enterara del cambio.

**`GET`/`PATCH`/`DELETE` sin caller real → `authorize('Talento')` directo:** confirmado por grep que ningún archivo del frontend llama a `GET /survey-response` (ninguna de las dos variantes) ni a `PATCH /survey-response/:surveyAssignmentId/:questionId` — a diferencia de `POST`, no había ningún flujo de self-service legítimo que proteger con ownership check, así que se restringieron directo a Talento (mismo criterio que otros endpoints sin uso real esta sesión). `DELETE` ya estaba restringido a Talento desde la ronda anterior de la auditoría (EXP-DEV-19).

**Por qué no se migró el esquema:** agregar `employee_id` a `SurveyResponse` sería la solución "correcta" a nivel de modelo de datos, pero implica una migración + tocar el modelo + el controller + los 2 services de frontend que llaman a este endpoint — para un beneficio marginal sobre la solución liviana, dado que `survey_id` ya identifica la asignación sin ambigüedad en la práctica (ver punto 1 arriba). Queda como mejora de claridad de esquema para el futuro si alguna vez se necesita, no como deuda de seguridad — la validación de acceso ya es correcta con el approach actual.

**Acceptance Criteria:**
- [ ] `POST /survey-response` 403 si el empleado autenticado no es el dueño de la `SurveyAssignment` referenciada
- [ ] `POST /survey-response` 403 si la `SurveyAssignment` ya está `COMPLETED` (incluso siendo el dueño)
- [ ] Talento bypassa ambos chequeos
- [ ] `GET`/`PATCH /survey-response` devuelven 403 para cualquier rol que no sea Talento

**Verificado end-to-end (backend real, `curl`, con limpieza completa de los datos de prueba después):**
- `GET /survey-response` → 403 Colaborador, 200 Talento. `PATCH /survey-response/...` → 403 Colaborador.
- Creado un `Survey`+`SurveyAssignment` `PENDING` reales para un empleado (vía script directo, no hay endpoint de test para esto desde que se eliminaron los `/admin/cron/*` en EXP-DEV-17-FIX-02): el propio empleado responde → 201; otro empleado intenta responder la misma encuesta → 403; Talento responde en nombre del empleado (pregunta distinta, para no chocar con la PK ya usada) → 201, bypass confirmado.
- Asignación marcada `COMPLETED` (mismo flujo real: `PATCH /survey-assignment/.../status:COMPLETED`) → el propio dueño intenta agregar una respuesta más → 403 ("no es tuya o ya fue completada").
- Datos de prueba (`SurveyResponse`×2, `SurveyAssignment`, `Survey`) borrados al cerrar la prueba; empleado de test sin cambios de estado.

---

## Arquitectura técnica — Notas para desarrolladores

### Protección de rutas por rol
```jsx
// App.jsx — rutas restringidas por rol
<Route path="/continuous-feedback" element={
  <RoleRoute allowed={['Colaborador', 'Líder']}>
    <ContinuousFeedback />
  </RoleRoute>
} />
```
`RoleRoute` en `src/components/RoleRoute.jsx` — redirige a `/` si el rol no está permitido.

### Patrón de alertas fire-and-forget
```javascript
// En el controller, NO usar await para notificaciones
Alert.create({ ... }).catch(console.error);
```
La respuesta al cliente no espera la creación de la alerta.

### Includes de Sequelize — gotcha crítico
**NUNCA** compartir el mismo objeto de include entre dos asociaciones del mismo modelo:
```javascript
// ❌ ROMPE — receiver->person se genera antes que receiver
const INCLUDE = { model: Person, as: 'person' }
{ model: Employee, as: 'emitter', include: [INCLUDE] }
{ model: Employee, as: 'receiver', include: [INCLUDE] } // mismo objeto = bug SQL

// ✅ CORRECTO — objetos separados
{ model: Employee, as: 'emitter',  include: [{ model: Person, as: 'person' }] }
{ model: Employee, as: 'receiver', include: [{ model: Person, as: 'person' }] }
```
También usar `subQuery: false` en `findAll` cuando se incluyen dos JOINs al mismo modelo.

### Campos snake_case en modelos Sequelize
Sin `underscored: true` en la config de Sequelize, los nombres de campos en los modelos son el nombre literal de la columna en DB. Usar `snake_case` para FK y campos especiales:
```javascript
// Modelo ContinuousFeedback
is_anonymous: { type: DataTypes.BOOLEAN }  // columna: "is_anonymous"
emitter_id:   { type: DataTypes.UUID }     // columna: "emitter_id"
```

### Variables de entorno críticas
```
SYNC_PARAMS={"force":false}   # producción
SYNC_PARAMS={"alter":true}    # al agregar columnas nuevas
SYNC_PARAMS={"force":true}    # DESTRUYE la DB — solo desarrollo inicial
```

### Auto-generación de rutas
`router.js` genera una ruta por cada página en `src/pages/**/*.jsx` (nombre de archivo en minúsculas), **salvo que esté en una lista de exclusión manual** — necesaria para páginas que se registran a mano en `App.jsx` por necesitar `:id` o un `RoleRoute`. El riesgo de este patrón: si una página nueva con `RoleRoute` no se agrega también a la exclusión de `router.js`, queda **auto-registrada en paralelo, sin protección**, en un path ligeramente distinto (ej. `/continuousfeedback` sin guion conviviendo con `/continuous-feedback`). Esto pasó realmente (ver EXP-201-BUG-02, EXP-701-BUG-01) y deja la página accesible para cualquier rol con solo escribir la URL. Mientras no se rediseñe el patrón (una sola fuente de verdad en vez de dos listas sincronizadas a mano — ver TODOs), **toda página nueva con `RoleRoute` debe agregarse explícitamente a la exclusión de `router.js`**.

### Seguridad — cobertura de `authorize()` por rol (auditoría 2026-06-18)
Una auditoría completa de backend + frontend encontró varias rutas de escritura sin `authorize()` — solo protegidas por `authenticateToken` (sesión válida, sin chequeo de rol). Cualquier usuario autenticado podía, por ejemplo, cambiarle el rol a otro usuario (`PATCH /user/:id`) o borrar un departamento/template/equipo. Se agregó `authorize('Talento')` a `routes.user.js`, `routes.department.js`, `routes.team.js`, `routes.task.js`, `routes.task_type.js` y `routes.jobOpening.js` (excepto `POST /:id/apply`, que es la postulación de Colaborador/Líder — ver EXP-602), y `authorize('Colaborador')` a `POST /continuous-feedback`. Ver también EXP-201-BUG-02 y EXP-701-BUG-01 para los bypasses de `RoleRoute` encontrados en el mismo relevamiento.

---

## TODOs y deuda técnica

| ID | Descripción | Prioridad |
|---|---|---|
| EXP-401-BUG | ~~MyTasks muestra solo 1 tarea al asignar onboarding~~ — Resuelto 2026-06-20, ver EXP-401-FIX-01 (causa real era 0 tareas, no 1) | ~~Alta~~ |
| EXP-DEV-01 | ~~Mover filtro de empleados por departamento al backend~~ — Resuelto 2026-06-20, ver EXP-DEV-01-FIX-01 | ~~Media~~ |
| EXP-DEV-02 | ~~`POST /admin/cron/pulse-run` para disparar cron de pulso manualmente~~ — Ya existe (`routes.js:147-154`), nunca se había marcado en esta tabla. Ver EXP-DEV-17 por el hueco de seguridad encontrado al verificarlo | ~~Baja~~ |
| EXP-DEV-03 | (parcial) ~~Mover EmployeeFeedbackReport/PulseSurveys a "Mi perfil"~~ — no se integraron a "Mi perfil" (redesign de UI mayor, fuera de alcance), pero ver EXP-DEV-03-FIX-01: el bug real (`PulseSurveys` sin fallback a auth, sin entrada en sidebar) se corrigió 2026-06-20 | Media |
| EXP-DEV-04 | ~~Reemplazar `assigned_by = employee_id` en FeedbackAssignment~~ — No aplica: `FeedbackAssignment` no tiene (ni tuvo) campo `assigned_by`. El patrón real es en `SurveyAssignment` (Pulso/entrevista de salida) y es intencional — ver gotcha en CLAUDE.md. Único caso accionable: `startOffboarding` podría usar `req.user.employeeId` (HR real) en vez de auto-asignarse, ver EXP-DEV-18 | ~~Media~~ |
| EXP-DEV-05 | ~~Definir flujo y vistas para rol Alumni~~ — Resuelto, ver ÉPICA 10 | ~~Baja~~ |
| EXP-DEV-06 | ~~Implementar `GET /employee?departmentId=X` para escalar filtro de participantes 360°~~ — Resuelto 2026-06-20, ver EXP-DEV-01-FIX-01 | ~~Media~~ |
| EXP-DEV-07 | ~~Decidir destino de `Asset`/`EmployeeAsset`~~ — Resuelto 2026-06-20, ver EXP-DEV-07-FIX-01: exposición read-only en `DetailEmployee`/`OffboardingDetailPage`, sin altas/bajas desde la UI (eso sigue manual en BD) | ~~Media~~ |
| EXP-DEV-08 | Decidir destino de `EmployeeHistory` (los hooks de `Employee` escriben en cada cambio de depto/posición, pero ningún endpoint la expone) — exponer un endpoint de historial o eliminar los hooks | Media |
| EXP-DEV-09 | Rediseñar el patrón de exclusión manual de `router.js` (ver nota técnica arriba) — unificar en una sola fuente de verdad para evitar que una página nueva con `RoleRoute` quede sin proteger por descuido | Baja |
| EXP-1005-BUG-01 | ~~`useStartOffboarding` descartaba `rehirable`/`exitType` antes de llegar al backend~~ — Resuelto 2026-06-19, ver EXP-1006 | ~~Alta~~ |
| EXP-1005-BUG-02 | ~~Crons diarios (`onboardingCronJob.js`, `okrCronJob.js`) generaban alertas para empleados `INACTIVE`/Alumni~~ — Resuelto 2026-06-19, filtrado por `Employee.status==='ACTIVE'` | ~~Alta~~ |
| EXP-DEV-10 | ~~Auditar otros paths de creación de `Alert`~~ — Resuelto 2026-06-20, ver EXP-DEV-10-FIX-01. Auditados los ~30 call-sites: todos seguros salvo el selector de destinatario de Feedback continuo (ya corregido) | ~~Media~~ |
| EXP-DEV-11 | ~~`formatOffboarding`/`formatUser` buscan checklist/entrevista/`exitType` por `employee_id` sin scopear por proceso~~ — Resuelto 2026-06-20: renuncias repetidas (EXP-1002-FIX-01) y despido-tras-renuncia (EXP-DEV-11-FIX-01) | ~~Media~~ |
| EXP-DEV-12 | Implementar previsualización de email antes de enviar para acciones sensibles (paso a Alumni) — bloqueado por EXP-DEV-16 (no hay envío de emails reales todavía, solo alertas internas, acta cliente 2026-06-18) | Baja (bloqueado) |
| EXP-DEV-16 | Implementar el envío de emails reales (hoy todo el sistema de notificación es `Alert` interno in-app, sin integración SMTP/proveedor de email) — desbloquea EXP-DEV-12 y cualquier comunicación que deba llegarle al usuario fuera de la plataforma (alta de cuenta, paso a Alumni, recontratación, vencimientos) | Media |
| EXP-DEV-13 | Migrar los ~30 botones celestes (`bg-brand hover:bg-brand-hover text-white`) repartidos por el frontend a `components/ui/Button.jsx` (variant `primary`) — en progreso (migrado: `AlumniDetailPage.jsx`, `StartOffboardingModal.jsx`), el resto se va migrando de forma oportunista cuando se toque ese archivo por otra razón, no como barrido único | Baja |
| EXP-DEV-14 | Adoptar `components/ui/Button.jsx` (variants `ghost`/`danger`) y `components/ui/IconButton.jsx` (nuevo, variants `default`/`danger`/`success`/`reject`) en los botones "Cancelar", destructivos y de ícono-solo (editar/borrar/aprobar/rechazar) que hoy están repetidos en ~20 archivos — en progreso (migrado: `StartOffboardingModal.jsx` Cancelar/tag, `CreateJobOpeningModal.jsx` borrar skill), mismo criterio de migración oportunista que EXP-DEV-13 | Baja |
| EXP-DEV-15 | Borrar `components/ui/Button.jsx`'s variant `outline` sigue con colores `gray-*` (no `slate-*`/`brand-*` del resto del proyecto) — corregir si/cuando se empiece a usar ese variant | Baja |
| EXP-DEV-17 | ~~`POST /admin/cron/onboarding-run`/`pulse-run` sin `authorize('Talento')`~~ — Resuelto 2026-06-20, ver EXP-DEV-17-FIX-01 (protegidos), luego eliminados por completo el mismo día — ver EXP-DEV-17-FIX-02 | ~~Media~~ |
| EXP-DEV-18 | `startOffboarding` auto-asigna `SurveyAssignment.assigned_by = employeeId` (workaround de sistema) para la entrevista de salida — podría usar `req.user.employeeId` (el HR real que inició el proceso, ya capturado como `initiated_by`) en su lugar. Mejora cosmética/de trazabilidad, no es un bug | Baja |
| EXP-DEV-19 | ~~Auditoría round 2 de `authorize()` faltante + ownership checks + reglas de negocio Alumni~~ — Resuelto 2026-06-21, ver EXP-DEV-19 arriba | ~~Alta~~ |
| EXP-DEV-20 | ~~`/survey-response` (POST/PATCH) sin ownership check~~ — Resuelto 2026-06-21 sin cambio de esquema (mismo patrón que `handleCompletePulseSurvey`), ver EXP-DEV-20-FIX-01 | ~~Media~~ |
| EXP-DEV-21 | ~~`startOffboarding` sin transacción de Sequelize a pesar de ~10 escrituras secuenciales~~ — Resuelto 2026-06-21, ver EXP-DEV-21-FIX-01 | ~~Media~~ |
| EXP-DEV-22 | ~~`rehireAlumni` archiva (`DROPPED`) tareas en `SUBMITTED` al recontratar~~ — Resuelto 2026-06-21, ver EXP-DEV-29-FIX-01 | ~~Baja~~ |
| EXP-DEV-23 | ~~Falta `onDelete`/guard en `DELETE /employee`/`DELETE /job-openings`~~ — Resuelto 2026-06-21 para `Employee` (409 limpio, ver EXP-DEV-29-FIX-01); para `JobOpening` se confirmó que no aplica (`paranoid:true`, soft-delete nunca viola FK) | ~~Media~~ |
| EXP-DEV-30 | ~~`formatOffboarding` no aplicaba el guard `isTermination` a la consulta de `exitInterview` (solo al checklist) — un despido mostraba la entrevista de una ronda de renuncia previa en vez de `null`~~ — Resuelto 2026-06-21, ver EXP-DEV-29-FIX-01 | ~~Media~~ |
| EXP-DEV-24 | ~~Auditoría frontend cruzada con EXP-DEV-19 — `RoleRoute` faltante + privacidad de gap-analysis + modales colgados~~ — Resuelto 2026-06-21, ver EXP-DEV-24 arriba | ~~Alta~~ |
| EXP-DEV-25 | 5 de 8 flujos con 403/400 nuevo fallan en silencio sin mensaje (toggle de tareas, marcar alerta leída, `course-enrollments`) — patrón general de mutaciones sin `onError`, no nuevo de esta sesión | Baja |
| EXP-DEV-26 | 11 exports huérfanos en `services/`/`hooks/` (`surveyTypeService.js` completo, `feedback360Service.js#getAssignments/createAssignment`, etc.) — limpieza pendiente, mismo patrón de 2026-06-16 | Baja |
| EXP-DEV-27 | `JobOpeningsList`/`MyEvaluations`/`EmployeeFeedbackReport` con doble-registro inofensivo en `router.js` (auto-generado + manual al mismo path) — prolijidad, sin bug de protección | Baja |
| EXP-DEV-28 | ~10 reimplementaciones locales de `formatDate` en `pages/**` — extraer a helper compartido | Baja |
| EXP-DEV-29 | ~~`apiClient.js` sin interceptor de `response`/401~~ — Resuelto 2026-06-21, ver EXP-DEV-29-FIX-01 | ~~Media~~ |

---

## Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| `talento1@example.com` | `pass1` | Talento (HR) |
| `colaborador5@example.com` | `pass5` | Colaborador |
| `lider15@example.com` | `pass15` | Líder |
