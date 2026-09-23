import { Sparkles, CheckCircle2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SummaryCardProps {
  headline: string
  context: string
  discussionPoints: string
  takeaways: string[]
}

export function SummaryCard({
  headline,
  context,
  discussionPoints,
  takeaways,
}: SummaryCardProps) {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide">
            AI Summary
          </span>
        </div>
        <CardTitle className="text-pretty text-2xl font-semibold leading-tight">
          {headline}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Context
          </h3>
          <p className="text-pretty text-sm leading-relaxed text-foreground">
            {context}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Discussion
          </h3>
          <p className="text-pretty text-sm leading-relaxed text-foreground">
            {discussionPoints}
          </p>
        </section>

        {takeaways.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Takeaways
            </h3>
            <ul className="flex flex-col gap-2.5">
              {takeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-pretty text-sm leading-relaxed text-foreground">
                    {takeaway}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
