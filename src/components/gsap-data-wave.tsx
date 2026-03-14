"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function GsapDataWave() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Constants for the 3D grid
  const cols = 20;
  const rows = 12;
  const dotCount = cols * rows;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial 3D Isometric setup
      gsap.set(gridRef.current, {
        rotateX: 65,
        rotateZ: -45,
        scale: 1.5,
        transformStyle: "preserve-3d",
      });

      // 2. Continuous Wave Engine using Trigonometry (GSAP Ticker)
      const dots = gsap.utils.toArray(".data-dot");
      
      let time = 0;
      const onTick = () => {
        time += 0.05; // Speed of the wave
        
        dots.forEach((dot: any, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          
          // Calculate compound Sine/Cosine wave based on 2D coordinates + Time
          // This creates the "Fluid Organic" wave look
          const waveX = Math.sin(col * 0.4 + time) * 30; // Amplitude
          const waveY = Math.cos(row * 0.4 + time) * 30;
          
          // Apply individual height/z-index using GSAP set for ultimate performance
          gsap.set(dot, {
            z: waveX + waveY, // Moves the dot up and down in 3D space
            opacity: 0.3 + (Math.sin(col * 0.4 + time) + 1) * 0.35, // Glows as it crests
          });
        });
      };

      gsap.ticker.add(onTick);

      return () => {
        gsap.ticker.remove(onTick);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Glow Ambient Behind the wave */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] to-transparent z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D96D4B]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* 3D Grid Engine */}
      <div 
        ref={gridRef}
        className="relative flex flex-wrap"
        style={{ width: `${cols * 40}px`, height: `${rows * 40}px` }}
      >
        {Array.from({ length: dotCount }).map((_, i) => (
          <div
            key={i}
            className="data-dot w-[40px] h-[40px] flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* The physical glowing node */}
            <div className="w-[6px] h-[6px] bg-[#F2A971] rounded-full shadow-[0_0_15px_#D96D4B]" />
            {/* The vertical beam (connecting to the floor) to give "data pillar" depth */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 w-[1px] h-[100px] bg-gradient-to-b from-[#F2A971]/30 to-transparent origin-top rotate-x-90" />
          </div>
        ))}
      </div>
    </div>
  );
}
