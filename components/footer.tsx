import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
      <div className="flex items-center justify-center gap-4">
        <span>&copy; {new Date().getFullYear()} VibeLocal Analytics</span>
        <Link href="/privacy" className="hover:text-zinc-900">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-zinc-900">
          Terms
        </Link>
      </div>
    </footer>
  );
}
