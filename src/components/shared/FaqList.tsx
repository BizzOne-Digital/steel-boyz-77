import { Plus } from "lucide-react";

/** Native <details> accordion: accessible and zero client JavaScript. */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((f) => (
        <details key={f.question} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-condensed text-lg font-bold uppercase text-white transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
            {f.question}
            <Plus className="size-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="pb-5 pr-8 text-sm leading-relaxed text-muted sm:text-base">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
