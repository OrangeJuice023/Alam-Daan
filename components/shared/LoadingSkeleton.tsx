export function LoadingSkeleton({ variant }: { variant: 'sidebar' | 'map' | 'detail' }) {
  if (variant === 'sidebar') {
    return (
      <div className="bg-[#132338] border-r border-white/10 p-4 h-full flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-2 mb-4">
          <div className="skeleton h-8 flex-1"></div>
          <div className="skeleton h-8 w-16"></div>
          <div className="skeleton h-8 w-16"></div>
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-5 w-3/4"></div>
                <div className="skeleton h-3 w-1/2"></div>
              </div>
              <div className="skeleton h-5 w-16 rounded-sm"></div>
            </div>
            <div className="skeleton h-1.5 w-full rounded-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'map') {
    return (
      <div className="h-[50vh] min-h-[400px] bg-[#0d1b2a] border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 skeleton opacity-20"></div>
        <div className="absolute bottom-6 left-6 right-6 flex justify-between">
          <div className="skeleton h-10 w-48 shadow-card"></div>
          <div className="flex gap-2">
            <div className="skeleton h-8 w-8 rounded shadow-card"></div>
            <div className="skeleton h-8 w-8 rounded shadow-card"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="space-y-6">
        <div className="white-card p-6">
          <div className="h-1 bg-[#1c3354] rounded-t-lg -mt-6 -mx-6 mb-5" />
          <div className="skeleton h-6 w-1/3 mb-2 rounded-sm bg-black/10"></div>
          <div className="skeleton h-3 w-1/4 mb-6 rounded-sm bg-black/5"></div>
          <div className="space-y-4">
            <div className="skeleton h-8 w-full rounded-sm bg-black/5"></div>
            <div className="flex justify-between">
              <div className="skeleton h-4 w-1/4 bg-black/5"></div>
              <div className="skeleton h-4 w-1/4 bg-black/5"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="white-card p-4 h-24 flex flex-col justify-between">
              <div className="skeleton h-4 w-1/2 bg-black/5"></div>
              <div className="skeleton h-8 w-3/4 bg-black/10"></div>
            </div>
          ))}
        </div>

        <div className="white-card p-6">
          <div className="h-1 bg-[#1c3354] rounded-t-lg -mt-6 -mx-6 mb-5" />
          <div className="skeleton h-6 w-48 mb-4 bg-black/10"></div>
          <div className="skeleton h-20 w-full bg-black/5"></div>
        </div>
      </div>
    );
  }

  return null;
}
