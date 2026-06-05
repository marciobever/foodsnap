export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex animate-in fade-in duration-500">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-white/80 border-r border-gray-200/50 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4 flex-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3 pt-6 border-t border-gray-100">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex-1 pb-20 md:pb-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="h-64 md:h-80 w-full bg-gray-200 rounded-[2rem] animate-pulse"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-72 w-full bg-gray-200 rounded-[2rem] animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-64 w-full bg-gray-200 rounded-3xl animate-pulse"></div>
            <div className="h-48 w-full bg-gray-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
