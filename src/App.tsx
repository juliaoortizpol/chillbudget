import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage, OAuthCallback } from "@/features/auth"
import { DashboardLayout } from "@/features/dashboard"
import { BudgetOverview } from "@/features/budget"
import { TransactionsPage } from "@/features/transactions"
import { AccountsPage } from "@/features/accounts"
import { BudgetProvider } from "@/features/budget/context/BudgetContext"

import { MainLayout } from "@/components/layout/MainLayout"

function App() {
  return (
    <BrowserRouter>
      <BudgetProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/budget" element={<BudgetOverview />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BudgetProvider>
    </BrowserRouter>
  )
}

export default App
