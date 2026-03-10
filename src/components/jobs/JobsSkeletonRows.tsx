export function JobsSkeletonRows() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="grid items-center h-row px-3 border-b border-border"
          style={{
            gridTemplateColumns: "28px 1fr 120px 100px 100px 80px 90px 36px",
          }}
        >
          <div />
          <div className="space-y-1.5 pr-4">
            <div className="h-3.5 bg-muted rounded w-3/4" />
            <div className="h-2.5 bg-muted rounded w-1/2" />
          </div>
          <div><div className="h-5 bg-muted rounded-full w-16" /></div>
          <div><div className="h-3 bg-muted rounded w-14" /></div>
          <div><div className="h-5 bg-muted rounded w-16" /></div>
          <div className="flex justify-center"><div className="h-4 bg-muted rounded w-6" /></div>
          <div><div className="h-3 bg-muted rounded w-12" /></div>
          <div />
        </div>
      ))}
    </div>
  );
}
