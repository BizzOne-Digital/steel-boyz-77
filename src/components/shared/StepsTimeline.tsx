import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Step = { title: string; text: string; icon: string };

export function StepsTimeline({ steps, detailed = false }: { steps: Step[]; detailed?: boolean }) {
  return (
    <ol className={cn("relative grid gap-8 sm:grid-cols-2", detailed ? "lg:grid-cols-2" : "lg:grid-cols-4")}>
      {!detailed && (
        <span aria-hidden="true" className="absolute left-0 right-0 top-14 hidden h-0.5 bg-gradient-to-r from-brand via-brand/40 to-transparent lg:block" />
      )}
      {steps.map((s, i) => (
        <Reveal as="li" key={`${s.title}-${i}`} delay={i * 0.1} className="relative">
          <div className={cn("relative h-full border-l-2 border-brand/40 pl-6", detailed && "border bg-charcoal/60 p-7 clip-card lg:p-9")}>
            <div className="flex items-center gap-4">
              <span className="font-display text-7xl text-brand sm:text-8xl">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative z-10 inline-flex size-14 items-center justify-center border-2 border-brand bg-ink text-brand">
                <Icon name={s.icon} className="size-7" />
              </span>
            </div>
            <h3 className="mt-3 font-display text-4xl text-white">{s.title}</h3>
            <p className={cn("mt-2 leading-relaxed text-muted", detailed ? "text-base" : "text-sm")}>{s.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
