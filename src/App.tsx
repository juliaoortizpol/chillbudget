import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage, OAuthCallback } from "@/features/auth"
import { DashboardLayout } from "@/features/dashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
