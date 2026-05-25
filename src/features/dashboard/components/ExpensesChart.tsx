import { useEffect, useMemo } from "react"
import { DashboardCard } from "./DashboardCard"
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts"
import { useTransactions } from "@/features/transactions/hooks/useTransactions"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export function ExpensesChart() {
  const { transactionsData, fetchTransactions } = useTransactions()

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    fetchTransactions({ 
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 100 
    });
  }, [fetchTransactions])

  const { chartData, totalAmount } = useMemo(() => {
    // Default empty week
    const dataMap: Record<string, number> = {
      "MON": 0, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 0
    }
    let total = 0

    if (transactionsData?.data) {
      const now = new Date()
      // Let's just look at the last 7 days
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      transactionsData.data.forEach(t => {
        const d = new Date(t.date)
        if (d >= sevenDaysAgo && d <= now) {
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
  }, [transactionsData])

  return (
    <DashboardCard title="EXPENSES">
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
              tick={{ fontSize: 10, fill: '#A0A0A0', fontWeight: 700 }} 
              dy={10}
            />
            <Tooltip 
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#FF4F64] text-white text-[13px] font-bold px-3 py-1.5 rounded-lg shadow-md relative translate-y-[-10px]">
                      ${payload[0].value}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#FF4F64] rotate-45 rounded-sm"></div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#FFB6C1" 
              strokeWidth={4} 
              dot={false}
              activeDot={{ r: 5, fill: "#FF4F64", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
}
