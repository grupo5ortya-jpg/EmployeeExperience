import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from './store/store.js'
import { srv_front_router_generate_routes } from './router/router.js'

function App() {
  const routes = srv_front_router_generate_routes()

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {routes.map(({ path, component: C }) => (
            <Route key={path} path={path} element={<C />} />
          ))}
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
