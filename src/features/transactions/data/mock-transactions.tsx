import React from "react"
import { Laptop, TrendingUp, Utensils, Wallet, Zap, Home } from "lucide-react"

export type TransactionCategory = {
  name: string
  icon: React.ReactNode
  iconBgClass: string
  iconColor: string
}

export type Transaction = {
  id: string
  date: string
  description: string
  category: TransactionCategory
  amount: number
}

export const categories: Record<string, TransactionCategory> = {
  technology: {
    name: "Technology",
    icon: <Laptop className="w-4 h-4" />,
    iconBgClass: "bg-blue-500/10",
    iconColor: "text-blue-700"
  },
  investment: {
    name: "Investment",
    icon: <TrendingUp className="w-4 h-4" />,
    iconBgClass: "bg-green-500/10",
    iconColor: "text-green-700"
  },
  dining: {
    name: "Dining",
    icon: <Utensils className="w-4 h-4" />,
    iconBgClass: "bg-red-500/10",
    iconColor: "text-red-700"
  },
  income: {
    name: "Income",
    icon: <Wallet className="w-4 h-4" />,
    iconBgClass: "bg-emerald-500/10",
    iconColor: "text-emerald-700"
  },
  transport: {
    name: "Transport",
    icon: <Zap className="w-4 h-4" />,
    iconBgClass: "bg-indigo-500/10",
    iconColor: "text-indigo-700"
  },
  housing: {
    name: "Housing",
    icon: <Home className="w-4 h-4" />,
    iconBgClass: "bg-stone-500/10",
    iconColor: "text-stone-700"
  }
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "Oct 24, 2023",
    description: "Apple Store - One Central",
    category: categories.technology,
    amount: -1249.00
  },
  {
    id: "2",
    date: "Oct 23, 2023",
    description: "Dividend Payment - AAPL",
    category: categories.investment,
    amount: 450.25
  },
  {
    id: "3",
    date: "Oct 21, 2023",
    description: "The Grand Brasserie",
    category: categories.dining,
    amount: -182.50
  },
  {
    id: "4",
    date: "Oct 20, 2023",
    description: "Quarterly Bonus Deposit",
    category: categories.income,
    amount: 8500.00
  },
  {
    id: "5",
    date: "Oct 19, 2023",
    description: "Tesla Supercharger #44",
    category: categories.transport,
    amount: -32.18
  },
  {
    id: "6",
    date: "Oct 18, 2023",
    description: "Monthly Rent - Skyview Loft",
    category: categories.housing,
    amount: -3450.00
  }
]
