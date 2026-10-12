import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage, OAuthCallback } from "@/features/auth"
import { DashboardLayout } from "@/features/dashboard"
import { BudgetOverview } from "@/features/budget"
import { TransactionsPage } from "@/features/transactions"
import { AccountsPage } from "@/features/accounts"
import { PlanningPage } from "@/features/planning"
import { LoanCalculatorPage } from "@/features/loan-calculator/LoanCalculatorPage"
import { RetirementPlannerPage } from "@/features/retirement-planner/RetirementPlannerPage"
import { BudgetProvider } from "@/features/budget/context/BudgetContext"

import { MainLayout } from "@/components/layout/MainLayout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route element={<BudgetProvider><MainLayout /></BudgetProvider>}>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/budget" element={<BudgetOverview />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/planning/loan-calculator" element={<LoanCalculatorPage />} />
          <Route path="/planning/retirement-planner" element={<RetirementPlannerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
