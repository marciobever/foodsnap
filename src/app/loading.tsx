export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-brand-100 rounded-full animate-spin border-t-brand-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-brand-500 rounded-full animate-pulse-soft"></div>
        </div>
      </div>
      <p className="mt-4 text-brand-900 font-bold tracking-widest uppercase text-xs animate-pulse">FoodSnap.ai</p>
    </div>
  );
}
