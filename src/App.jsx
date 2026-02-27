
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './components/DashboardLayout'
import Posts from './pages/Posts'
import Campaigns from './pages/Campaigns'
import Analytics from './pages/Analytics'
import Users from './pages/Users'
import { RoleProtectedRoute } from './components/RoleProtectedRoute'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<Posts />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Users />
            </RoleProtectedRoute>
          } />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
