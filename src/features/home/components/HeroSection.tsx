import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="text-center max-w-md px-6">
      <h1 className="text-4xl font-bold text-[#0B2C40] mb-2">chillBudget</h1>
      <p className="text-lg text-indigo-600 font-medium mb-4">Personal Finance App</p>
      <p className="text-gray-500 mb-8">
        Track your expenses and manage your budget easily.
      </p>
      <div className="flex gap-3 justify-center">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </div>
  )
}
