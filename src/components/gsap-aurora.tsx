"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function GsapAurora() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create refs for multiple color blobs that will blend together
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const blob4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Configuration for a slow, organic, breathing movement
      const durBase = 6;
      
      // Blob 1: Top Left Origin (Deep Orange/Gold)
      gsap.to(blob1Ref.current, {
        x: "30vw",
        y: "20vh",
        scaleX: 1.5,
        scaleY: 1.2,
        rotation: 45,
        duration: durBase * 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Blob 2: Bottom Right Origin (Bright Gold)
      gsap.to(blob2Ref.current, {
        x: "-40vw",
        y: "-30vh",
        scaleX: 1.2,
        scaleY: 1.8,
        rotation: -45,
        duration: durBase * 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
      });

      // Blob 3: Center Origin (Subtle Red/Orange)
      gsap.to(blob3Ref.current, {
        x: "20vw",
        y: "-20vh",
        scaleX: 2,
        scaleY: 0.8,
        rotation: 90,
        duration: durBase * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2
      });
      
      // Blob 4: Top Right Origin (Darker Accent)
      gsap.to(blob4Ref.current, {
        x: "-20vw",
        y: "40vh",
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: 180,
        duration: durBase * 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      // Force hardware acceleration for opacity/transform
      style={{ willChange: "transform, opacity" }}
    >
      {/* 
        The core technique for "Aurora": 
        We use ultra-blurred colored ellipses (blobs) that overlap.
        When they cross paths while rotating/scaling, the mix-blend-mode creates the Aurora fluid look.
      */}
      
      {/* Noise overlay to give it texture (prevents color banding) */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-[5]"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} 
      />

      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        {/* Deep Orange Blob */}
        <div 
          ref={blob1Ref}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#D96D4B] rounded-full blur-[140px] opacity-70"
        />
        
        {/* Bright Gold/Yellow Blob */}
        <div 
          ref={blob2Ref}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-[#F2A971] rounded-full blur-[160px] opacity-60"
        />
        
        {/* Core Radiance Blob */}
        <div 
          ref={blob3Ref}
          className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-[#E88A5D] rounded-full blur-[130px] opacity-50"
        />
        
        {/* Subtle Darker Accent Blob */}
        <div 
          ref={blob4Ref}
          className="absolute -top-[30%] right-[10%] w-[80%] h-[50%] bg-[#C55A37] rounded-full blur-[150px] opacity-40"
        />
      </div>
    </div>
  );
}
