# EmployeeExperience — Documentación Jira

**Proyecto:** EmployeeExperience HR Platform  
**Branch activo:** `fullstack-changes`  
**Última actualización:** 2026-06-18  
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
HR inicia un proceso de offboarding para un empleado activo, indicando su último día de trabajo. El sistema genera automáticamente un checklist de salida (3 tareas, reutilizando el `TaskType` seedeado "Offboarding estándad") y programa la entrevista de salida digital, con vencimiento a 30 días desde el último día.

**Flujo:**
1. HR selecciona un empleado `ACTIVE` y la fecha de último día → `POST /offboarding`
2. Se crea `EmployeeOffboarding` (`status: IN_PROGRESS`, `initiated_by` = HR que lo inicia)
3. Se bulk-crean 3 `EmployeeTask` (checklist: devolver notebook/tarjetas, completar checklist con RRHH, entrevista de salida con RRHH), `due_date = lastWorkingDay`
4. Se crea `Survey` + `SurveyAssignment` para la entrevista de salida (`question_type: Offboarding/Salida`, `due_date = lastWorkingDay + 30d`)
5. Alerta `OFFBOARDING_STARTED` para el empleado

**Acceptance Criteria:**
- [ ] No se permite iniciar un offboarding si ya existe uno `IN_PROGRESS` para ese empleado (409)
- [ ] El checklist aparece en `/mytasks` del empleado y en `/all-assignments` de HR
- [ ] La entrevista de salida queda programada con vencimiento a 30 días

**Ruta:** `/offboardinghome` (`RoleRoute allowed={['Talento']}`)
**Endpoints:** `POST /offboarding`, `GET /offboarding`, `GET /offboarding/:employeeId`
**Modelo:** `EmployeeOffboarding` (tabla `employee_offboardings`) — `employee_id`, `initiated_by`, `last_working_day`, `status` (`IN_PROGRESS`/`COMPLETED`), `started_at`, `completed_at`

---

### EXP-1002 · Seguimiento y finalización del proceso
**Tipo:** Story | **Rol:** Talento (HR)

**Descripción:**
HR visualiza el detalle de un proceso de offboarding (progreso del checklist, estado de la entrevista de salida) y puede finalizarlo manualmente en cualquier momento. Finalizar transiciona al empleado al estado Alumni.

**Flujo:**
1. HR entra a `/offboarding/:employeeId` y revisa progreso checklist + estado entrevista
2. Click "Finalizar proceso" (con confirmación) → `PATCH /offboarding/:employeeId/complete`
3. `EmployeeOffboarding.status → COMPLETED`, `completed_at = now`
4. Se busca el `Role` "Alumni" y se actualiza `User.role_id` del empleado → dispara el hook existente `syncEmployeeStatus` (`Employee.status → INACTIVE`, limpia `department_id`/`position`)
5. `AlumniProfile.findOrCreate` (`rehirable: true, tags: []`)

**Acceptance Criteria:**
- [ ] Botón "Finalizar proceso" solo visible si `status === IN_PROGRESS`
- [ ] No exige checklist/entrevista completos — HR puede forzar el cierre
- [ ] 404 si no hay un proceso `IN_PROGRESS` para ese empleado (también evita doble-completado)
- [ ] Tras finalizar, el empleado pasa a `INACTIVE` y aparece listado en `/alumnihome`

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

**Rutas:** `/alumnihome`, `/alumni/:employeeId` (`RoleRoute allowed={['Talento']}`)
**Endpoints:** `GET /alumni`, `GET /alumni/:employeeId`, `PATCH /alumni/:employeeId`
**Modelo:** `AlumniProfile` (tabla `alumni_profiles`, 1:1 con `Employee`) — `employee_id` (PK/FK), `rehirable` (default `true`), `tags` (JSONB, default `[]`)

---

### EXP-1005 · Acceso restringido para rol Alumni
**Tipo:** Story | **Rol:** Alumni

**Descripción:**
Un usuario con rol Alumni accede a una versión mínima y de solo lectura de la plataforma: únicamente "Mi perfil" y, si corresponde, la entrevista de salida pendiente. No tiene acceso a ningún otro módulo del sidebar.

**Acceptance Criteria:**
- [ ] El sidebar de Alumni solo muestra "Mi perfil" (resuelve dinámicamente a `/detailemployee/:employeeId`) y "Alertas" — el resto de items mantiene sus `roles` originales y queda oculto
- [ ] `DetailEmployee.jsx` no renderiza el botón "Editar" (ni el flujo de edición) para rol Alumni (`canEdit = authUser?.role !== 'Alumni'`)
- [ ] El home de Alumni (`AlumniDashboard`) muestra una card "Ver mi perfil" → `/detailemployee/:employeeId` y, si hay una entrevista de salida pendiente, la sección correspondiente
- [ ] `GET /alumni` (HR-only) devuelve 403 para rol Alumni; `GET /employees/:id` (usado por "Mi perfil") devuelve 200 para Alumni

**Ruta:** `/` (Home, branch `role === 'Alumni'`), `/detailemployee/:employeeId` (sin `RoleRoute`, modo solo lectura para Alumni)

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
| EXP-401-BUG | MyTasks muestra solo 1 tarea al asignar onboarding | Alta |
| EXP-DEV-01 | Mover filtro de empleados por departamento al backend (`GET /employee?departmentId=X`) | Media |
| EXP-DEV-02 | `POST /admin/cron/pulse-run` para disparar cron de pulso manualmente | Baja |
| EXP-DEV-03 | Mover `EmployeeFeedbackReport` y `PulseSurveys` a "Mi perfil" en sidebar cuando haya roles completos | Media |
| EXP-DEV-04 | Reemplazar `assigned_by = employee_id` en FeedbackAssignment por el ID del usuario HR logueado real | Media |
| EXP-DEV-05 | ~~Definir flujo y vistas para rol Alumni~~ — Resuelto, ver ÉPICA 10 | ~~Baja~~ |
| EXP-DEV-06 | Implementar `GET /employee?departmentId=X` en backend para escalar filtro de participantes 360° | Media |
| EXP-DEV-07 | Decidir destino de `Asset`/`EmployeeAsset` (modelo + seed completos, sin controllers/rutas/UI) — terminar la feature, dejarla, o borrar modelo+seed+asociaciones | Media |
| EXP-DEV-08 | Decidir destino de `EmployeeHistory` (los hooks de `Employee` escriben en cada cambio de depto/posición, pero ningún endpoint la expone) — exponer un endpoint de historial o eliminar los hooks | Media |
| EXP-DEV-09 | Rediseñar el patrón de exclusión manual de `router.js` (ver nota técnica arriba) — unificar en una sola fuente de verdad para evitar que una página nueva con `RoleRoute` quede sin proteger por descuido | Baja |

---

## Usuarios de prueba

| Email | Password | Rol |
|---|---|---|
| `talento1@example.com` | `pass1` | Talento (HR) |
| `colaborador5@example.com` | `pass5` | Colaborador |
| `lider15@example.com` | `pass15` | Líder |
