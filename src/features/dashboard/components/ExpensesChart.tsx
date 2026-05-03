import { DashboardCard } from "./DashboardCard"
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "MON", value: 400 },
  { name: "TUE", value: 300 },
  { name: "WED", value: 550 },
  { name: "THU", value: 900 },
  { name: "FRI", value: 720 },
  { name: "SAT", value: 200 },
  { name: "SUN", value: 450 },
]

export function ExpensesChart() {
  return (
    <DashboardCard title="EXPENSES">
      <div className="flex flex-col mb-4 mt-1">
        <span className="text-xs text-muted-foreground">Last Week</span>
        <h3 className="text-[32px] font-bold tracking-tight mt-1 mb-2">$1,200.00</h3>
      </div>
      
      <div className="h-[200px] w-full mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
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
