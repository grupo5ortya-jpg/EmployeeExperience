export function srv_front_router_generate_routes() {
  const modules = import.meta.glob('../pages/**/*.jsx', { eager: true })
  const routes = []

  for (const fullPath in modules) {
    const component = modules[fullPath].default
    const normalized = fullPath.replace(/\\/g, '/')
    const clean = normalized.replace('../pages/', '').replace('.jsx', '')
    const segments = clean.split('/')
    const pageName = segments[segments.length - 1]

    if (pageName === 'PageNotFound') {
      routes.push({ path: '*', component })
      continue
    }

    if (pageName === 'Home') {
      routes.push({ path: '/', component })
      continue
    }

    routes.push({ path: '/' + pageName.toLowerCase(), component })
  }

  return routes
}
