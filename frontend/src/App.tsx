import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../pages/Layout'
import Dashboard from '../pages/Dashboard'
import FoodLog from '../pages/FoodLog'
import ActivityLog from '../pages/ActivityLog'
import Profile from '../pages/Profile'
import Login from '../pages/Login'
import Onboarding from '../pages/Onboarding'

const App = () => {
  return (
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
  )
}

export default App
