import { CheckCircle2 } from "lucide-react"

export interface OnboardingStep {
  label: string
  complete: boolean
  title: string
  description: string
  action: string
  href: string
}

export function OnboardingProgress({ steps }: { steps: OnboardingStep[] }) {
  const completed = steps.filter(step => step.complete).length
  const current = steps.findIndex(step => !step.complete)

  return (
    <section aria-label="Progreso de configuración" className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
      <div className="shrink-0">
        <h2 className="text-xl font-bold text-foreground">Configura chillBudget</h2>
        <p className="mt-1 text-sm text-muted-foreground">{completed} de {steps.length} pasos completados</p>
      </div>
      <div className="min-w-0 flex-1">
        <ol className="mb-3 flex justify-between gap-2 text-xs sm:text-sm">
          {steps.map((step, index) => (
            <li key={step.label} aria-current={index === current ? "step" : undefined} className={`flex items-center gap-1 ${step.complete ? "text-emerald-700" : index === current ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {step.complete && <CheckCircle2 aria-label="Completado" className="h-3.5 w-3.5 shrink-0" />}
              {step.label}
            </li>
          ))}
        </ol>
        <div role="progressbar" aria-label="Pasos completados" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completed} className="h-1.5 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${completed / steps.length * 100}%` }} />
        </div>
      </div>
    </section>
  )
}
