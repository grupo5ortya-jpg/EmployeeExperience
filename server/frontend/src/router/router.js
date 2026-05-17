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

		layoutRoutes.push({ path: '/' + pageName.toLowerCase(), component })
	}

	return { layoutRoutes, publicRoutes }
}