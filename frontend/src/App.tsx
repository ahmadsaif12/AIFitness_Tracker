import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import FoodLog from './pages/FoodLog'
import ActivityLog from './pages/ActivityLog'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import { useAppContext } from './context/AppContext'
import Loading from './components/Loading'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { pathname } = useLocation()
  const {user,isUserFetched, onboardingCompleted}= useAppContext()
  if (pathname === '/') {
    return <Onboarding />
  }
  if (!user) {
    return isUserFetched ? <Login /> : <Loading />
  }
  if(!onboardingCompleted){
    return <Onboarding />
  }

  return (
  <>
  <Toaster />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="food" element={<FoodLog />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </>
  )
}

export default App
