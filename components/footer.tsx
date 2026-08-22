import Link from "next/link";

export function Footer({ dark = false }: { dark?: boolean }) {
  return (
    <footer
      className={`border-t py-6 text-center text-sm ${
        dark
          ? "border-white/10 text-slate-500"
          : "border-zinc-200 text-zinc-500"
      }`}
    >
      <div className="flex items-center justify-center gap-4">
        <span>&copy; {new Date().getFullYear()} VibeLocal Analytics</span>
        <Link href="/privacy" className={dark ? "hover:text-white" : "hover:text-zinc-900"}>
          Privacy
        </Link>
        <Link href="/terms" className={dark ? "hover:text-white" : "hover:text-zinc-900"}>
          Terms
        </Link>
      </div>
    </footer>
  );
}
