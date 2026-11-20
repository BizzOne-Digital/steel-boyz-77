import Link from "next/link";
import type { PagesContent } from "@/lib/content/defaults";
import { Icon } from "@/components/ui/Icon";

type Features = PagesContent["home"]["features"];

export function FeatureStrip({ data }: { data: Features }) {
  if (!data.items.length) return null;
  return (
    <section aria-label="Program highlights" className="relative z-20 -mt-6 px-3 sm:px-6 lg:-mt-10">
      <div className="mx-auto max-w-7xl bg-brand p-[2px] clip-strip">
        <ul className="grid grid-cols-2 bg-ink clip-strip sm:grid-cols-3 lg:grid-cols-5">
          {data.items.map((item, i) => (
            <li
              key={`${item.label}-${i}`}
              className="border-white/15 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-r lg:border-b-0 last:col-span-2 sm:last:col-span-1"
            >
              <Link
                href={item.href || "/services"}
                className="group flex h-full items-center gap-3 px-4 py-5 transition-colors hover:bg-brand/10 sm:px-5 lg:justify-center lg:py-7"
              >
                <Icon name={item.icon} className="size-9 shrink-0 text-brand transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 lg:size-11" strokeWidth={1.75} />
                <span className="font-condensed text-sm font-bold uppercase leading-tight text-white group-hover:text-brand sm:text-base">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
