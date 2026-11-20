import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink px-4 text-center grain">
      <p className="font-display text-[10rem] leading-none text-brand">404</p>
      <h1 className="font-display text-5xl text-white">Wrong Route</h1>
      <p className="mt-3 max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center bg-brand px-8 font-condensed font-bold uppercase text-black clip-angle">
        Back to Home
      </Link>
    </main>
  );
}
