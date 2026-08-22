export function GradientBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-[100px]" />
      <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
    </div>
  );
}
