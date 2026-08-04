import { useMemo } from "react"
import { DashboardCard } from "./DashboardCard"
import { AlertCircle, ChartNoAxesColumn } from "lucide-react"
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { Transaction } from "@/features/transactions/hooks/useTransactions"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

interface ExpensesChartProps {
  transactions: Transaction[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function ExpensesChart({ transactions, isLoading = false, error, onRetry }: ExpensesChartProps) {
  const { chartData, totalAmount } = useMemo(() => {
    // Default empty week
    const dataMap: Record<string, number> = {
      "MON": 0, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 0
    }
    let total = 0

    if (transactions.length) {
      const now = new Date()
      // Let's just look at the last 7 days
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      transactions.forEach(t => {
        const d = new Date(t.date)
        if (t.type === "expense" && d >= sevenDaysAgo && d <= now) {
          const amount = Math.abs(t.amount);
          total += amount;
          const dayName = DAYS[d.getDay()];
          dataMap[dayName] += amount;
        }
      })
    }

    const chartData = [
      { name: "MON", value: dataMap["MON"] },
      { name: "TUE", value: dataMap["TUE"] },
      { name: "WED", value: dataMap["WED"] },
      { name: "THU", value: dataMap["THU"] },
      { name: "FRI", value: dataMap["FRI"] },
      { name: "SAT", value: dataMap["SAT"] },
      { name: "SUN", value: dataMap["SUN"] },
    ]

    return { chartData, totalAmount: total }
  }, [transactions])

  return (
    <DashboardCard title="WEEKLY EXPENSES">
      {isLoading ? (
        <div className="flex min-h-[304px] animate-pulse flex-col pt-2" aria-hidden="true">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="mt-3 h-9 w-28 rounded bg-muted" />
          <div className="mt-auto h-32 rounded-xl bg-muted/70" />
        </div>
      ) : error ? (
        <div className="flex min-h-[304px] flex-col items-center justify-center px-4 text-center" role="alert">
          <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
          <p className="text-sm font-semibold text-foreground">Unable to load expenses</p>
          <p className="mt-1 text-xs text-muted-foreground">Please try again.</p>
          {onRetry && (
            <button type="button" className="mt-4 text-sm font-semibold text-primary hover:text-ds-primary-hover" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      ) : totalAmount === 0 ? (
        <div className="flex min-h-[304px] flex-col items-center justify-center px-4 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ChartNoAxesColumn className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">No expenses in the last 7 days</p>
          <p className="mt-1 text-xs text-muted-foreground">Your weekly spending will appear here.</p>
        </div>
      ) : (
      <>
      <div className="flex flex-col mb-4 mt-1">
        <span className="text-xs text-muted-foreground">Last 7 Days</span>
        <h3 className="text-[32px] font-bold tracking-tight mt-1 mb-2">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}
        </h3>
      </div>
      
      <div className="h-[200px] w-full mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#55727B', fontWeight: 700 }}
              dy={10}
            />
            <Tooltip 
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="relative -translate-y-2.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-bold text-primary-foreground shadow-md">
                      ${payload[0].value}
                      <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-primary"></div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2FA99E"
              strokeWidth={4} 
              dot={false}
              activeDot={{ r: 5, fill: "#167F78", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </>
      )}
    </DashboardCard>
  )
}
