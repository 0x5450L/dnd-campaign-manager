function AppLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-bg"
    >
      <span className="font-fantasy text-sm uppercase tracking-[0.3em] text-faint motion-safe:animate-pulse">
        Rolling initiative
      </span>
    </div>
  );
}

export default AppLoading;
