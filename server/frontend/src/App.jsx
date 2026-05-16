import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from './store/store.js'
import { srv_front_router_generate_routes } from './router/router.js'
import AppLayout from './components/layouts/AppLayout.jsx'

function App() {
  const { layoutRoutes, publicRoutes } = srv_front_router_generate_routes()

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Pages with Sidebar + Topbar */}
          <Route element={<AppLayout />}>
            {layoutRoutes.map(({ path, component: C }) => (
              <Route key={path} path={path} element={<C />} />
            ))}
          </Route>

          {/* Public pages: login, 404, etc. */}
          {publicRoutes.map(({ path, component: C }) => (
            <Route key={path} path={path} element={<C />} />
          ))}
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
