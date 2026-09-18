import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import type { OnboardingStep } from "./OnboardingProgress"

export function OnboardingNextStep({ step }: { step: OnboardingStep }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles aria-hidden="true" className="h-6 w-6" /></div>
      <div className="flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Tu siguiente paso</p>
        <h2 className="text-lg font-bold">{step.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
      </div>
      <Link to={step.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-ds-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        {step.action}<ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  )
}
