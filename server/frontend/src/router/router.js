
export function srv_front_router_generate_routes() {
	// Busca archivos .jsx dentro de cualquier bs/*/frontend/src/pages/**
	const modules = import.meta.glob(
		"/../../bs/**/frontend/src/pages/**/*.jsx",
		{ eager: true }
	);

	const routes = [];

	for (const fullPath in modules) {
		const component = modules[fullPath].default;

		// ejemplo: /bs/core/frontend/src/pages/Home/Home.jsx
		const clean = fullPath
			.replace("/bs/", "")
			.replace("/frontend/src/pages/", "")
			.replace(".jsx", "");

		// ejemplo clean: core/Home/Home
		// extrae solo el nombre de la última carpeta → "Home"
		const segments = clean.split("/");
		const pageName = segments[segments.length - 1];

		const path = "/" + pageName.toLowerCase();

		routes.push({
			path,
			element: component,
		});
	}

	return routes;
}
