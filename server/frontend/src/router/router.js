export function srv_front_router_generate_routes() {
  const modules = import.meta.glob('../pages/**/*.jsx', { eager: true })
  const layoutRoutes = []
  const publicRoutes = []

  for (const fullPath in modules) {
    const normalized = fullPath.replace(/\\/g, '/')

    // skip sub-component files (any path segment named "components")
    if (normalized.includes('/components/')) continue

    const component = modules[fullPath].default
    const clean = normalized.replace('../pages/', '').replace('.jsx', '')
    const segments = clean.split('/')
    const pageName = segments[segments.length - 1]

    // 404 → public, no layout
    if (pageName === 'PageNotFound') {
      publicRoutes.push({ path: '*', component })
      continue
    }

    // auth/** → public, no layout
    if (segments[0] === 'auth') {
      publicRoutes.push({ path: '/' + pageName.toLowerCase(), component })
      continue
    }

    // Home → root path, with layout
    if (pageName === 'Home') {
      layoutRoutes.push({ path: '/', component })
      continue
    }

    // These need dynamic :id params — registered manually in App.jsx
    if (pageName === 'DetailEmployee') continue
    if (pageName === 'TemplateDetailPage') continue
    if (pageName === 'FeedbackDetailPage') continue
    // Role-restricted — registered manually in App.jsx with RoleRoute
    if (pageName === 'FeedbackHome') continue
    if (pageName === 'ContinuousFeedback') continue
    if (pageName === 'ContinuousFeedbackDetail') continue
    if (pageName === 'OKRManagement') continue
    if (pageName === 'MyObjectives') continue
    if (pageName === 'CourseCatalog') continue
    if (pageName === 'MyLearning') continue
    if (pageName === 'LearningDashboard') continue
    if (pageName === 'QuestionManagement') continue
    if (pageName === 'OffboardingHome') continue
    if (pageName === 'OffboardingDetailPage') continue
    if (pageName === 'AlumniHome') continue
    if (pageName === 'AlumniDetailPage') continue
    if (pageName === 'CareerSimulatorPage') continue
    if (pageName === 'EmployeeList') continue
    if (pageName === 'AllAssignmentsPage') continue

    layoutRoutes.push({ path: '/' + pageName.toLowerCase(), component })
  }

  return { layoutRoutes, publicRoutes }
}
