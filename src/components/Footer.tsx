export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="font-bold text-zinc-900">
              Mickey<span className="text-blue-600">Hub.</span>
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Tech, Lifestyle และชุมชนในที่เดียว
            </p>
          </div>

          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} MickeyHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}