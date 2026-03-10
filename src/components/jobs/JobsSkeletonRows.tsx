export function JobsSkeletonRows() {
  return (
    <div className="animate-pulse">
      {/* Group header skeleton */}
      <div className="flex items-center" style={{ height: '32px', padding: '0 8px' }}>
        <div className="h-3 rounded" style={{ width: '180px', backgroundColor: '#f3f4f6' }} />
      </div>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="grid items-center"
          style={{
            gridTemplateColumns: "28px 1fr 120px 100px 100px 80px 90px 36px",
            height: '34px',
            borderBottom: '1px solid #f3f4f6',
            padding: '0 8px',
          }}
        >
          <div />
          <div className="space-y-1 pr-4 pl-3">
            <div className="h-3 rounded" style={{ width: '75%', backgroundColor: '#f3f4f6' }} />
            <div className="h-2" style={{ width: '50%', backgroundColor: '#f3f4f6', borderRadius: '2px' }} />
          </div>
          <div><div className="h-5 rounded-full" style={{ width: '64px', backgroundColor: '#f3f4f6' }} /></div>
          <div><div className="h-3 rounded" style={{ width: '56px', backgroundColor: '#f3f4f6' }} /></div>
          <div><div className="h-5 rounded-full" style={{ width: '64px', backgroundColor: '#f3f4f6' }} /></div>
          <div className="flex justify-center"><div className="h-3 rounded" style={{ width: '24px', backgroundColor: '#f3f4f6' }} /></div>
          <div><div className="h-3 rounded" style={{ width: '48px', backgroundColor: '#f3f4f6' }} /></div>
          <div />
        </div>
      ))}
    </div>
  );
}
