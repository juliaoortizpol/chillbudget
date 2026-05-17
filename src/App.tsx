import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage, OAuthCallback } from "@/features/auth"
import { DashboardLayout } from "@/features/dashboard"
import { BudgetOverview } from "@/features/budget"
import { TransactionsPage } from "@/features/transactions"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/budget" element={<BudgetOverview />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
