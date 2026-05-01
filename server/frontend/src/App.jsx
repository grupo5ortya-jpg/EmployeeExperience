
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from './store/store.js';
import Home from "./pages/Home/Home.jsx";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import { srv_front_router_generate_routes } from './router/router.js';
import './App.css'


function App() {
	const dynamicRoutes = srv_front_router_generate_routes();

	return (
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />

					{dynamicRoutes.map((r) => (
						<Route
						key={r.path}
						path={r.path}
						element={<r.element />}
						/>
					))}

					{/* 404 */}
					<Route path="*" element={<PageNotFound />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	)
}

export default App
