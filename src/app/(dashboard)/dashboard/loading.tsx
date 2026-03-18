import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 border-4 border-[#F2A971]/20 rounded-full animate-ping" />
        <Loader2 className="h-12 w-12 animate-spin text-[#F2A971] drop-shadow-[0_0_8px_rgba(242,169,113,0.5)]" />
      </div>
      <p className="text-[#F2A971]/60 font-medium tracking-widest uppercase text-xs animate-pulse">
        Menyiapkan Dashboard Anda...
      </p>
    </div>
  );
}
