import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BalanceCard() {
  return (
    <div className="rounded-[2rem] p-8 text-white relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-medium tracking-wider opacity-90 uppercase">Current Balance</span>
        <span className="text-xl font-bold italic opacity-80">VISA</span>
      </div>
      
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight">$12,450.80</h2>
        <p className="text-sm font-medium tracking-[0.2em] opacity-80 mt-2">•••• •••• •••• 2576</p>
      </div>

      <div className="flex justify-between items-end">
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase opacity-70 mb-1 font-bold tracking-wider">Cardholder</p>
            <p className="text-sm font-medium">Alex Sterling</p>
          </div>
          <div>
            <p className="text-[10px] uppercase opacity-70 mb-1 font-bold tracking-wider">Expires</p>
            <p className="text-sm font-medium">12/28</p>
          </div>
        </div>
        <Button size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 h-10 w-10 backdrop-blur-sm cursor-pointer shadow-none">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
