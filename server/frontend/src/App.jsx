import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from './store/store.js'
import { srv_front_router_generate_routes } from './router/router.js'
import AppLayout from './components/layouts/AppLayout.jsx'
import DetailEmployee from './pages/detailEmployee/DetailEmployee.jsx'
import TemplateDetailPage from './pages/onboarding/TemplateDetailPage.jsx'
import AllAssignmentsPage from './pages/onboarding/AllAssignmentsPage.jsx'
import FeedbackDetailPage       from './pages/feedback/FeedbackDetailPage.jsx'
import HRFeedbackReport         from './pages/feedback/HRFeedbackReport.jsx'
import EmployeeFeedbackReport   from './pages/feedback/EmployeeFeedbackReport.jsx'
import ContinuousFeedback from './pages/continuousFeedback/ContinuousFeedback.jsx'
import ContinuousFeedbackDetail from './pages/continuousFeedback/ContinuousFeedbackDetail.jsx'
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
            <Route path="/detailemployee/:id" element={<DetailEmployee />} />
            <Route path="/onboarding-template/:id" element={<TemplateDetailPage />} />
            <Route path="/all-assignments" element={<AllAssignmentsPage />} />
            <Route path="/feedback/:id"            element={<FeedbackDetailPage />} />
            <Route path="/hrfeedbackreport"       element={<HRFeedbackReport />} />
            <Route path="/employeefeedbackreport" element={<EmployeeFeedbackReport />} />
            <Route path="/continuous-feedback" element={<ContinuousFeedback />} />

            <Route path="/continuous-feedback/:id" element={<ContinuousFeedbackDetail />} />
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
