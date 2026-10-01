import { Navigate, Route, Routes } from 'react-router-dom'
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
  const { user, isUserFetched, onboardingCompleted } = useAppContext()

  if (!isUserFetched) {
    return <Loading />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (!onboardingCompleted) {
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

        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App