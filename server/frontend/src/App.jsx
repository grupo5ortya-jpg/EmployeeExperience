import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Provider, useDispatch }        from "react-redux"
import { useEffect }                    from "react"
import { store }                        from './store/store.js'
import { initializeAuth }               from './store/authSlice.js'
import { srv_front_router_generate_routes } from './router/router.js'
import AppLayout              from './components/layouts/AppLayout.jsx'
import PrivateRoute           from './components/PrivateRoute.jsx'
import RoleRoute              from './components/RoleRoute.jsx'
import DetailEmployee         from './pages/detailEmployee/DetailEmployee.jsx'
import TemplateDetailPage     from './pages/onboarding/TemplateDetailPage.jsx'
import AllAssignmentsPage     from './pages/onboarding/AllAssignmentsPage.jsx'
import FeedbackHome           from './pages/feedback/FeedbackHome.jsx'
import FeedbackDetailPage     from './pages/feedback/FeedbackDetailPage.jsx'
import HRFeedbackReport       from './pages/feedback/HRFeedbackReport.jsx'
import EmployeeFeedbackReport from './pages/feedback/EmployeeFeedbackReport.jsx'
import ContinuousFeedback     from './pages/continuousFeedback/ContinuousFeedback.jsx'
import ContinuousFeedbackDetail from './pages/continuousFeedback/ContinuousFeedbackDetail.jsx'
import JobOpeningsList        from './pages/jobOpenings/JobOpeningsList.jsx'
import MyEvaluations          from './pages/feedback/MyEvaluations.jsx'
import MyTasks                from './pages/onboarding/MyTasks.jsx'
import OKRManagement          from './pages/okr/OKRManagement.jsx'
import MyObjectives           from './pages/okr/MyObjectives.jsx'
import CourseCatalog          from './pages/learning/CourseCatalog.jsx'
import MyLearning             from './pages/learning/MyLearning.jsx'
import LearningDashboard      from './pages/learning/LearningDashboard.jsx'
import QuestionManagement     from './pages/questions/QuestionManagement.jsx'
import OffboardingHome        from './pages/offboarding/OffboardingHome.jsx'
import OffboardingDetailPage  from './pages/offboarding/OffboardingDetailPage.jsx'
import AlumniHome             from './pages/alumni/AlumniHome.jsx'
import AlumniDetailPage       from './pages/alumni/AlumniDetailPage.jsx'

// Restores session from cookie on every page load
function AuthInit({ children }) {
  const dispatch = useDispatch()
  useEffect(() => { dispatch(initializeAuth()) }, [dispatch])
  return children
}

function App() {
  const { layoutRoutes, publicRoutes } = srv_front_router_generate_routes()

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthInit>
          <Routes>
            {/* Protected pages — require valid session */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              {layoutRoutes.map(({ path, component: C }) => (
                <Route key={path} path={path} element={<C />} />
              ))}
              <Route path="/detailemployee/:id"      element={<DetailEmployee />} />
              <Route path="/onboarding-template/:id" element={<TemplateDetailPage />} />
              <Route path="/all-assignments"         element={<AllAssignmentsPage />} />
              <Route path="/feedbackhome"            element={<RoleRoute allowed={['Talento']}><FeedbackHome /></RoleRoute>} />
              <Route path="/feedback/:id"            element={<FeedbackDetailPage />} />
              <Route path="/hrfeedbackreport"        element={<HRFeedbackReport />} />
              <Route path="/employeefeedbackreport"  element={<EmployeeFeedbackReport />} />
              <Route path="/continuous-feedback"     element={<RoleRoute allowed={['Colaborador']}><ContinuousFeedback /></RoleRoute>} />
              <Route path="/continuous-feedback/:id" element={<RoleRoute allowed={['Colaborador']}><ContinuousFeedbackDetail /></RoleRoute>} />
              <Route path="/job-openings"            element={<JobOpeningsList />} />
              <Route path="/myevaluations"           element={<MyEvaluations />} />
              <Route path="/mytasks"                element={<MyTasks />} />
              <Route path="/okrmanagement"           element={<RoleRoute allowed={['Talento']}><OKRManagement /></RoleRoute>} />
              <Route path="/myobjectives"            element={<RoleRoute allowed={['Colaborador', 'Líder']}><MyObjectives /></RoleRoute>} />
              <Route path="/coursecatalog"           element={<RoleRoute allowed={['Colaborador', 'Líder']}><CourseCatalog /></RoleRoute>} />
              <Route path="/mylearning"              element={<RoleRoute allowed={['Colaborador', 'Líder']}><MyLearning /></RoleRoute>} />
              <Route path="/learningdashboard"       element={<RoleRoute allowed={['Talento']}><LearningDashboard /></RoleRoute>} />
              <Route path="/questionmanagement"      element={<RoleRoute allowed={['Talento']}><QuestionManagement /></RoleRoute>} />
              <Route path="/offboardinghome"         element={<RoleRoute allowed={['Talento']}><OffboardingHome /></RoleRoute>} />
              <Route path="/offboarding/:employeeId" element={<RoleRoute allowed={['Talento']}><OffboardingDetailPage /></RoleRoute>} />
              <Route path="/alumnihome"              element={<RoleRoute allowed={['Talento']}><AlumniHome /></RoleRoute>} />
              <Route path="/alumni/:employeeId"      element={<RoleRoute allowed={['Talento']}><AlumniDetailPage /></RoleRoute>} />
            </Route>

            {/* Public pages: login, 404, etc. */}
            {publicRoutes.map(({ path, component: C }) => (
              <Route key={path} path={path} element={<C />} />
            ))}
          </Routes>
        </AuthInit>
      </BrowserRouter>
    </Provider>
  )
}

export default App
