"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Shield, Sparkles, ArrowRight, Server, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// Performance Optimization: Dynamic Imports for Heavy Components
const LightRays = dynamic(() => import("@/components/light-rays"), { ssr: false });
const ScrollVelocity = dynamic(() => import("@/components/scroll-velocity"), { ssr: false });
const CircularGallery = dynamic(() => import("@/components/circular-gallery"), { ssr: false });
const FlowingMenu = dynamic(() => import("@/components/flowing-menu"), { ssr: false });

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  
  // Ref untuk Fase Parallax & Pinning
  const pinSectionRef = useRef<HTMLElement>(null);
  const pinTextRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk Bento Cards
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // === FASE BARU: THE STORYTELLING ===
  const sinkholeSectionRef = useRef<HTMLElement>(null);
  const debtItemsRef = useRef<HTMLDivElement>(null);
  const cleansingSectionRef = useRef<HTMLElement>(null);
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const nodesSectionRef = useRef<HTMLElement>(null);
  const nodesContainerRef = useRef<HTMLDivElement>(null);
  const ascensionSectionRef = useRef<HTMLElement>(null);
  const pillarGridRef = useRef<HTMLDivElement>(null);
  // === FASE 17: SUPREME VISUAL ADDITIONS ===
  const orbitSectionRef = useRef<HTMLElement>(null);
  const eyeSectionRef = useRef<HTMLElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Client-Side Only GSAP Engine Injection
    let ctx: any;
    
    (async () => {
      try {
        const gsapModule = await import("gsap");
        const gsap = gsapModule.default || gsapModule.gsap;
        const scrollTriggerModule = await import("gsap/ScrollTrigger");
        const ScrollTrigger = scrollTriggerModule.default || scrollTriggerModule.ScrollTrigger;
        
        gsap.registerPlugin(ScrollTrigger);

        // GLITCH FIX: Global ScrollTrigger config for smoother rendering
        ScrollTrigger.config({
          ignoreMobileResize: true, // prevents scroll jumps on mobile viewport changes
          autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", // avoid resize re-triggers
        });
        // End mark: ensure GSAP coordinates with browser's native rendering pipeline
        gsap.ticker.lagSmoothing(500, 33); // max 500ms catch-up, corrects after 33ms lag

        if (!containerRef.current) return;

        // Buka Context GSAP untuk proteksi Scope React Unmount
        ctx = gsap.context(() => {

          // ==========================================
          // FASE 1: THE IGNITION (Cinematic Heavy Reveal)
          // ==========================================
          const tlSetup = gsap.timeline();
          
          // Teks Header memudar lambat dengan bobot kurva power3
          tlSetup.fromTo(
            ".hero-text",
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out" }
          )
          // Tombol CTA melontar (bounce) dengan massa / gaya pegas nyata
          .fromTo(
            ".cta-btn",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
            "-=0.6"
          )
          // MOCKUP INIT: Diputar Isometris Sangat Tajam (+45deg) dan dilempar dari kedalaman Z (-150px)
          .fromTo(
            mockupRef.current,
            { y: 150, z: -200, rotateX: 45, rotateY: -15, opacity: 0, boxShadow: "0 0 0px rgba(0,0,0,0)" },
            { y: 0, z: 0, rotateX: 30, rotateY: 0, opacity: 1, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", duration: 1.8, ease: "power4.out" },
            "-=0.8"
          );

          // Health Score Counter Ticking
          if (scoreRef.current) {
            gsap.to(scoreRef.current, {
              innerHTML: 85,
              duration: 3,
              delay: 1.5,
              modifiers: { innerHTML: (i) => Math.round(i) },
              ease: "expo.out"
            });
          }


          // ==========================================
          // FASE 2: THE IMMERSION (Asymetric Scrubbing)
          // ==========================================
          
          // 1. Bilateral Parallax Glows - REMOVED for LightRays WebGL.

          // 2. 3D Kinetic Flattening (Mockup ditarik menghadap user)
          if (mockupRef.current) {
            gsap.to(mockupRef.current, {
              rotateX: 0, // Flatten persis lurus saat scroll penuh
              y: -50,
              scale: 1.05,
              ease: "none", 
              scrollTrigger: {
                trigger: mockupRef.current,
                start: "top 75%", 
                end: "top 20%",
                scrub: 1.2, // Delay cairan kinetik untuk memperlembut roda gulir yang tajam
              }
            });
          }

          // ==========================================
          // FASE 17-A: ORBIT RINGS (Trust Triad) — DOM: BEFORE pinSection
          // ==========================================
          if (orbitSectionRef.current) {
            const tlOrbit = gsap.timeline({
              scrollTrigger: {
                trigger: orbitSectionRef.current,
                start: "top top",
                end: "+=600%",
                pin: true,
                anticipatePin: 1,
                scrub: 1.5,
                invalidateOnRefresh: true,
              }
            });
            tlOrbit
              // GLITCH FIX: Removed filter:blur - causes GPU repaints on scrub. Use opacity+y instead.
              .fromTo(".orbit-title", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 2, ease: "power3.out", force3D: true })
              .fromTo(".ring-1", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 3, ease: "expo.out", force3D: true }, "<0.5")
              .fromTo(".ring-2", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 3, ease: "expo.out", force3D: true }, "<0.5")
              .fromTo(".ring-3", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 3, ease: "expo.out", force3D: true }, "<0.5")
              .fromTo(".orbit-label", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, stagger: 0.3, duration: 1.5, ease: "back.out(2)", force3D: true }, 2)
              .fromTo(".orbit-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out", force3D: true }, 3);
          }

          // ==========================================
          // FASE 17-B: AI SURVEILLANCE EYE — DOM: BEFORE pinSection
          // ==========================================
          if (eyeSectionRef.current) {
            const tlEye = gsap.timeline({
              scrollTrigger: {
                trigger: eyeSectionRef.current,
                start: "top top",
                end: "+=800%",
                pin: true,
                anticipatePin: 1,
                scrub: 2,
                invalidateOnRefresh: true,
              }
            });
            tlEye
              .fromTo(".crosshair-v", { scaleY: 0 }, { scaleY: 1, transformOrigin: "top center", duration: 3, ease: "power2.out", force3D: true })
              .fromTo(".crosshair-h", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 3, ease: "power2.out", force3D: true }, "<")
              .fromTo(".eye-sclera", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: "expo.out", force3D: true }, 0.5)
              .fromTo(".eye-iris", { scale: 0 }, { scale: 1, duration: 2, ease: "back.out(2)", force3D: true }, 1.2)
              .fromTo(".eye-pupil", { scale: 0 }, { scale: 1, duration: 1.5, ease: "back.out(3)", force3D: true }, 1.8)
              .to(".eye-pupil", { boxShadow: "0 0 80px #F2A971", backgroundColor: "#F2A971", duration: 0.5 }, 3)
              .fromTo(".neural-line", { strokeDashoffset: 500, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.5, stagger: 0.1, duration: 3, ease: "power1.inOut" }, 1.5)
              .fromTo(".eye-scan-label", { opacity: 0 }, { opacity: 1, duration: 2, ease: "power3.out" }, 3)
              // GLITCH FIX: letterSpacing on scrub causes layout reflow; removed.
              .fromTo(".eye-tagline", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 2, ease: "power3.out", force3D: true }, 4);
          }

          // ==========================================
          // FASE 3: THE LOCKDOWN & SURGE (Absolute Pinning) — DOM: AFTER Orbit+Eye
          // ==========================================
          if (pinSectionRef.current && shieldRef.current && pinTextRef.current) {

            // Penguncian Absolute (Pin) selama 150% jarak scroll
            ScrollTrigger.create({
              trigger: pinSectionRef.current,
              start: "top top",
              end: "+=150%",
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            });

            // The Engine Throttle (Scroll disalurkan ke Rotasi/Glow)
            const tlPin = gsap.timeline({
              scrollTrigger: {
                trigger: pinSectionRef.current,
                start: "top top",
                end: "+=150%",
                scrub: true,
                invalidateOnRefresh: true,
              }
            });

            // Mesin AI berputar kencang, mekar membesar, dan memanas (oren)
            tlPin.to(shieldRef.current, {
              rotateZ: 360 * 2, // 2 putaran penuh
              scale: 1.5,
              boxShadow: "0 0 150px rgba(242,169,113,0.8)",
              ease: "none"
            }, 0)
            // Latar teks bergerak mundur memberi panggung
            .to(pinTextRef.current, {
              x: -50,
              opacity: 0.3,
              ease: "none"
            }, 0);
          }


          // ==========================================
          // FASE 4: WEBGL CIRCULAR GALLERY (Replaced GSAP Bento)
          // ==========================================
          // CircularGallery operates via OGL natively, does not require GSAP pinning here.

          // ==========================================
          // FASE 5: THE GRAVITY OF DEBT (Sinkhole Pinning)
          // ==========================================
          if (sinkholeSectionRef.current && debtItemsRef.current) {
            const debts = Array.from(debtItemsRef.current.querySelectorAll('.debt-item'));
            
            // Generate chaotic starting scattered positions securely on Client-Side
            gsap.set(debts, {
              x: () => (Math.random() - 0.5) * 800,
              y: () => (Math.random() - 0.5) * 400,
              z: () => (Math.random() - 0.5) * 400,
              rotateX: () => Math.random() * 360
            });

            ScrollTrigger.create({
              trigger: sinkholeSectionRef.current,
              start: "center center",
              end: "+=150%",
              pin: true,
              anticipatePin: 1
            });

            gsap.to(debts, {
              scale: 0,
              opacity: 0,
              x: 0, // Disedot ke tengah
              y: 0,
              rotateZ: 720,
              stagger: 0.05,
              ease: "power4.in",
              scrollTrigger: {
                trigger: sinkholeSectionRef.current,
                start: "center center",
                end: "+=150%",
                scrub: 1.5 // Simulasi gravitasi gaya sentripetal lambat
              }
            });
          }

          // ==========================================
          // FASE 6: THE INTERVENTION (Glowing Scanner Sweep)
          // ==========================================
          // FASE 6: THE INTERVENTION (Glowing Scanner - Master Pin)
          // ==========================================
          if (cleansingSectionRef.current && scannerLineRef.current) {
            const tl6 = gsap.timeline({
              scrollTrigger: {
                trigger: cleansingSectionRef.current,
                start: "top top",
                end: "+=800%",
                pin: true,
                anticipatePin: 1, // GLITCH FIX: prevent jump at pin entry
                scrub: 1.5,
                invalidateOnRefresh: true,
              }
            });

            // Latar belakang perlahan gelap
            tl6.to(cleansingSectionRef.current, { backgroundColor: "#010101", duration: 1 })
               .fromTo(scannerLineRef.current,
                 { scaleX: 0, opacity: 0 },
                 { scaleX: 1, opacity: 1, duration: 2, ease: "power2.out", force3D: true }
               )
               .to(scannerLineRef.current,
                 { top: "100%", opacity: 0.1, duration: 5, ease: "power1.inOut" }
               )
            // GLITCH FIX: filter:blur removed on scrubbed element — only use opacity+y
               .fromTo(".scanner-content",
                 { opacity: 0, y: 80, scale: 0.95 },
                 { opacity: 1, y: 0, scale: 1, duration: 4, ease: "power3.out", force3D: true },
                 "-=4"
               )
            // GLITCH FIX: drop-shadow filter removed from scrub; use box-shadow instead
               .to(".scanner-shield",
                 { scale: 1.5, duration: 3, ease: "power2.out", force3D: true },
                 "-=2"
               );
            tl6.fromTo(".hex-grid-item",
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 0.8, stagger: { each: 0.04, from: "center" }, duration: 1.5, ease: "back.out(2)", force3D: true },
              7
            );
            // GLITCH FIX: letterSpacing on scrub causes layout reflow — removed
            tl6.fromTo(".ai-lock-text",
              { opacity: 0 },
              { opacity: 1, duration: 2, ease: "power3.out" },
              9
            );
          }

          // ==========================================
          // FASE 7: MICRO-ECONOMY AWAKENING (Pinned Orbit Scatter)
          // ==========================================
          if (nodesSectionRef.current && nodesContainerRef.current?.children) {
            const nodes = Array.from(nodesContainerRef.current.children);
            
            const tl7 = gsap.timeline({
              scrollTrigger: {
                trigger: nodesSectionRef.current,
                start: "top top",
                end: "+=1000%",
                pin: true,
                anticipatePin: 1, // GLITCH FIX: prevent jump at pin entry
                scrub: 2,
                invalidateOnRefresh: true,
              }
            });

            // GLITCH FIX: filter:blur removed from scrubbed element
            tl7.fromTo(".micro-text",
              { opacity: 0, y: 60 },
              { opacity: 1, y: 0, duration: 2, ease: "power2.out", force3D: true }
            );

            // The nodes explode outward slowly connecting the economy
            nodes.forEach((node, i) => {
              const angle = (i / nodes.length) * Math.PI * 2;
              const radius = gsap.utils.random(100, 600);
              const targetX = Math.cos(angle) * radius;
              const targetY = Math.sin(angle) * radius;

              tl7.fromTo(node,
                { scale: 0, opacity: 0, x: 0, y: 0 },
                {
                  scale: gsap.utils.random(0.5, 2),
                  opacity: gsap.utils.random(0.3, 1),
                  x: targetX,
                  y: targetY,
                  duration: 6,
                  ease: "expo.out",
                },
                1 // start together after text
              );
            });

            // Grid background zooms into the user simulating diving into the network
            tl7.fromTo(".micro-bg-grid",
              { scale: 1, opacity: 0 },
              { scale: 3, opacity: 0.5, duration: 8, ease: "power1.inOut" },
              0
            );
            // Constellation lines connect nodes
            tl7.fromTo(".constellation-line",
              { strokeDashoffset: 1000, opacity: 0 },
              { strokeDashoffset: 0, opacity: 0.5, stagger: { each: 0.1, from: "random" }, duration: 4, ease: "power2.out" },
              3
            );
            tl7.fromTo(".node-city-label",
              { opacity: 0, scale: 0 },
              { opacity: 1, scale: 1, stagger: { each: 0.15, from: "random" }, duration: 1.5, ease: "back.out(2)" },
              5
            );
          }

          // ==========================================
          // FASE 8: MACRO ASCENSION (End Pinning & Pillar Lift)
          // ==========================================
          if (ascensionSectionRef.current && pillarGridRef.current) {
            const tl8 = gsap.timeline({
              scrollTrigger: {
                trigger: ascensionSectionRef.current,
                start: "top top",
                end: "+=1500%", // Deepest and slowest — maximum cinematic pace
                pin: true,
                scrub: 3, // Heaviest scrub lag = most fluid 3D sensation
                anticipatePin: 1, // Prevents jump glitches at pin start
                invalidateOnRefresh: true,
              }
            });

            // ACT 1: Ground grid rises slowly from below
            tl8.to(pillarGridRef.current, {
              rotateX: 10,
              scale: 3,
              y: 600,
              opacity: 1,
              duration: 5,
              ease: "power1.inOut"
            }, 0);

            // ACT 2: User STARTS inside INDONESIA (Scale limited to 15 to prevent Webkit raster rendering glitches)
            gsap.set(".indo-text", { scale: 15, opacity: 0.08, filter: "blur(20px)", letterSpacing: "-5px", force3D: true, transformOrigin: "center center" });
            tl8.to(".indo-text", {
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              letterSpacing: "20px",
              force3D: true,
              duration: 10,
              ease: "power2.inOut"
            }, 0);

            // ACT 3: At scale ~4 (midway), a golden forge-sweep light crosses left to right
            // This "burns" the letters into their final luminous form
            tl8.fromTo(".indo-forge-sweep",
              { x: "-110%", scaleX: 0.3, opacity: 0 },
              { x: "110%", scaleX: 1, opacity: 1, duration: 3, ease: "power2.inOut" },
              5
            );

            // ACT 4: Text arrives at final scale, letters pulse with heatglow then settle
            tl8.to(".indo-text", {
              textShadow: "0 0 120px rgba(242,169,113,0.9), 0 0 60px rgba(255,255,255,0.4)",
              duration: 2,
              ease: "power2.out"
            }, 9);

            // ACT 5: Subtitle drifts up from beneath the crystallized text — GLITCH FIX: no blur
            tl8.fromTo(".indo-subtitle",
              { opacity: 0, y: 80 },
              { opacity: 1, y: 0, duration: 3, ease: "power3.out", force3D: true },
              10
            );

            // ACT 6: CTA button materializes last — the finale reward — GLITCH FIX: no blur
            tl8.fromTo(".indo-cta",
              { opacity: 0, scale: 0.85, y: 40 },
              { opacity: 1, scale: 1, y: 0, ease: "back.out(1.5)", duration: 3, force3D: true },
              12
            );
          }

        }, containerRef); // Tutup GSAP React Scope

      } catch (err) {
        console.error("GSAP Spatio-Temporal Matrix Failed to Load: ", err);
      }
    })();

    return () => {
      // Membersihkan Memori GSAP apabila User pindah halaman
      if (ctx) ctx.revert();
    };
  }, []);

  // Event Handlers GSAP murni (Kinetic Weighted Hover)
  const handleCTAEnter = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      const gsapModule = await import("gsap");
      const gsap = gsapModule.default || gsapModule.gsap;
      gsap.to(e.currentTarget, {
        scale: 1.05,
        y: -3,
        boxShadow: "0 10px 40px rgba(242,169,113,0.5)",
        duration: 0.5,
        ease: "back.out(2)" 
      });
    } catch(err) {}
  };

  const handleCTALeave = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      const gsapModule = await import("gsap");
      const gsap = gsapModule.default || gsapModule.gsap;
      gsap.to(e.currentTarget, {
        scale: 1,
        y: 0,
        boxShadow: "0 0 20px rgba(242,169,113,0.2)",
        duration: 0.5,
        ease: "back.out(2)"
      });
    } catch(err) {}
  };

  const featureItems = [
    { image: '/images/judol-tracker.png', text: 'Judol Tracker' },
    { image: '/images/pinjol-rescue.png', text: 'Pinjol Rescue' },
    { image: '/images/side-hustle.png', text: 'Side-Hustle Matrix' },
    { image: '/images/ai-guardian.png', text: 'AI Guardian' },
    { image: '/images/wealth-builder.png', text: 'Wealth Builder' },
  ];

  const footerMenu = [
    { link: '/', text: 'SafeWallet © 2026', image: 'https://picsum.photos/seed/sw1/800/600' },
    { link: '/kebijakan-privasi', text: 'Kebijakan Privasi', image: 'https://picsum.photos/seed/sw2/800/600' },
    { link: '/syarat-ketentuan', text: 'Syarat Operasi', image: 'https://picsum.photos/seed/sw3/800/600' }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0B0A08] text-white font-sans selection:bg-[#F2A971]/30 overflow-x-hidden">
      {/* Navigation Bar - Tetap Statis/Solid  */}
      <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-[#0B0A08]/50 border-b border-white/5">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2A971] to-amber-600 shadow-[0_0_15px_rgba(242,169,113,0.4)] transition-transform group-hover:scale-105">
              <Shield className="h-6 w-6 text-[#0B0A08]" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/90">SafeWallet</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5 rounded-full px-6">
                 Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#F2A971] text-[#0B0A08] hover:bg-[#F2A971]/90 rounded-full px-8 font-semibold transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* ========================================== */}
        {/* HERO SECTION */}
        {/* ========================================== */}
        <section className="relative px-6 pt-20 pb-32 text-center" style={{ perspective: "1500px" }}>
          {/* === WEBGL LIGHT RAYS BACKGROUND === */}
          <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none mix-blend-screen opacity-60">
             <LightRays
                raysOrigin="top-center"
                raysColor="#D96D4B"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={3.5}
                followMouse={true}
                mouseInfluence={0.15}
                noiseAmount={0.05}
                className="custom-rays z-[-1]"
             />
          </div>

          <div className="relative z-10 container mx-auto flex flex-col items-center">
            <div className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-sm opacity-80">
              <Sparkles className="w-4 h-4 text-[#F2A971]" />
              <span className="text-sm font-medium text-white/80">SaaS Finansial AI #1 di Indonesia</span>
            </div>
            
            <h1 className="hero-text text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 block md:inline">AI Guardian untuk </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2A971] to-amber-300 drop-shadow-[0_0_15px_rgba(242,169,113,0.15)] block md:inline">Uangmu</span>
            </h1>
            
            <p className="hero-text text-xl md:text-2xl text-white/50 max-w-2xl mb-14 leading-relaxed font-light">
              Deteksi mutasi pinjol, judi online, dan dapatkan saran finansial personal dengan kecerdasan buatan kelas institusi.
            </p>
            
            <div className="cta-btn">
              <Link 
                href="/signup" 
                onMouseEnter={handleCTAEnter} 
                onMouseLeave={handleCTALeave}
                className="inline-flex items-center justify-center h-16 px-10 rounded-full bg-[#F2A971] text-[#0B0A08] text-lg font-bold shadow-[0_0_20px_rgba(242,169,113,0.2)] transition-colors duration-300 hover:bg-[#FADCBE]"
              >
                Mulai Perjalanan Finansialmu
                <ArrowRight className="ml-3 w-5 h-5 opacity-80" />
              </Link>
            </div>
          </div>

          {/* 3D Glassmorphism Mockup Card (Scrubbing Target Phase 2) */}
          <div className="relative mt-28 max-w-4xl mx-auto" style={{ perspective: "2000px" }}>
            <div ref={mockupRef} className="w-full transform-style-3d will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-b from-[#3323D2]/15 to-transparent blur-[100px] -z-10" />
              <div className="w-full rounded-[2.5rem] bg-white/[0.02] backdrop-blur-2xl border border-white/5 shadow-2xl p-2 md:p-4">
                <div className="w-full aspect-[16/9] rounded-[2rem] bg-[#0A0907]/90 border border-white/[0.03] overflow-hidden relative flex flex-col">
                  {/* Mockup Top Bar */}
                  <div className="h-12 border-b border-white/[0.03] flex items-center px-6 gap-2 bg-white/[0.01]">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  {/* Mockup Content */}
                  <div className="flex-1 p-8 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,169,113,0.05)_0%,transparent_60%)] pointer-events-none" />
                    <div className="text-center z-10">
                      <div className="w-24 h-24 rounded-full border border-[#F2A971]/30 bg-[#F2A971]/5 flex items-center justify-center mx-auto mb-6 relative">
                        {/* Denyut Cincin Luar */}
                        <div className="absolute inset-0 border border-[#F2A971]/50 rounded-full animate-ping opacity-20" />
                        <span ref={scoreRef} className="text-3xl font-bold text-[#F2A971]">0</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-white/90 mb-3 tracking-wide">Health Score: Excellent</h3>
                      <p className="text-white/40 font-light text-sm max-w-xs mx-auto">Sistem pelacakan real-time melaporkan 0 aktivitas abnormal di seluruh gerbang pembayaran Anda.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* FASE 17-A: ORBIT RINGS — TRUST TRIAD */}
        {/* ========================================== */}
        <section ref={orbitSectionRef} className="relative h-screen bg-[#000000] flex items-center overflow-hidden border-t border-[#F2A971]/10">
          <div className="absolute right-0 w-full md:w-1/2 h-full flex items-center justify-center" style={{ perspective: "1600px" }}>
            <div className="relative w-72 h-72 md:w-[480px] md:h-[480px]" style={{ transformStyle: "preserve-3d" }}>
              <div className="ring-1 absolute inset-0 border-2 border-[#F2A971]/60 rounded-full opacity-0" style={{ transform: "rotateX(75deg)" }} />
              <div className="ring-2 absolute inset-10 border border-white/30 rounded-full opacity-0" style={{ transform: "rotateX(30deg) rotateZ(45deg)" }} />
              <div className="ring-3 absolute inset-20 border border-[#D9772B]/60 rounded-full opacity-0" style={{ transform: "rotateX(15deg) rotateY(80deg)" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#F2A971]/10 border-2 border-[#F2A971]/60 flex items-center justify-center shadow-[0_0_80px_rgba(242,169,113,0.5)] backdrop-blur-sm z-10">
                <Shield className="w-10 h-10 text-[#F2A971]" />
              </div>
              <span className="orbit-label absolute top-0 left-1/2 -translate-x-1/2 text-[#F2A971] text-[10px] font-mono tracking-[0.3em] uppercase opacity-0">Pengguna</span>
              <span className="orbit-label absolute bottom-0 left-[5%] text-white/60 text-[10px] font-mono tracking-[0.3em] uppercase opacity-0">Teknologi</span>
              <span className="orbit-label absolute bottom-0 right-[5%] text-[#D9772B] text-[10px] font-mono tracking-[0.3em] uppercase opacity-0">Dana</span>
            </div>
          </div>
          <div className="relative z-10 px-10 md:px-20 w-full md:w-1/2">
            <div className="mb-4 font-mono text-[#F2A971]/40 text-xs tracking-[0.4em] uppercase">// kepercayaan.triad</div>
            <h2 className="orbit-title text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8 opacity-0">
              <span className="text-white block">Tiga Lapis</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2A971] to-[#D9772B] block">Perlindungan</span>
            </h2>
            <p className="orbit-subtitle text-lg text-white/40 font-light leading-relaxed max-w-md opacity-0">Finansial Anda dijaga oleh triad kecerdasan AI yang berputar dan saling mengunci satu sama lain tanpa henti.</p>
          </div>
        </section>

        {/* ========================================== */}
        {/* FASE 17-B: AI SURVEILLANCE EYE */}
        {/* ========================================== */}
        <section ref={eyeSectionRef} className="relative h-screen bg-[#020101] flex items-center justify-center overflow-hidden border-t border-white/5">
          {/* Crosshair lines */}
          <div className="crosshair-v absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#F2A971]/60 to-transparent" style={{ transformOrigin: "top" }} />
          <div className="crosshair-h absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#F2A971]/60 to-transparent" style={{ transformOrigin: "left" }} />
          {/* The Eye */}
          <div className="relative z-10 flex flex-col items-center gap-10">
            <div className="eye-sclera relative w-80 h-52 md:w-[500px] md:h-80 rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden opacity-0"
              style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.9), 0 0 100px rgba(242,169,113,0.08)" }}>
              <div className="eye-iris w-44 h-44 md:w-60 md:h-60 rounded-full flex items-center justify-center"
                style={{ background: "conic-gradient(from 0deg, #F2A971, #D9772B, #0B0A08, #F2A971, #D9772B)" }}>
                <div className="eye-pupil w-16 h-16 md:w-24 md:h-24 bg-black border border-[#F2A971]/50 flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}>
                  <Eye className="w-8 h-8 text-[#F2A971]/70" />
                </div>
              </div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
                {[[0,80,250,160],[500,60,250,160],[0,240,250,160],[500,280,250,160],[120,0,250,160],[380,0,250,160],[100,320,250,160],[400,320,250,160]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} className="neural-line" x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F2A971" strokeWidth="0.5" strokeDasharray="500" strokeDashoffset="500" />
                ))}
              </svg>
            </div>
            <p className="eye-tagline text-3xl md:text-5xl font-black text-white tracking-tighter text-center opacity-0">
              Deteksi Bahaya <span className="text-[#F2A971]">Sebelum Terjadi</span>
            </p>
          </div>
          <div className="eye-scan-label absolute bottom-10 right-10 font-mono text-[#F2A971] text-xs tracking-[0.5em] uppercase opacity-0">AI SCAN: ESTABLISHED</div>
        </section>
        {/* ========================================== */}
        {/* BENTENG TERAKHIR — Brankas AI Pin (Phase 3) */}
        {/* ========================================== */}
        <section ref={pinSectionRef} className="relative h-screen bg-[#0B0A08] flex items-center justify-center overflow-hidden border-t border-white/5">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between z-10">
            {/* Teks Sebelah Kiri */}
            <div ref={pinTextRef} className="flex-1 md:pr-16 text-center md:text-left mb-16 md:mb-0 transform-gpu">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                <span className="text-white">Benteng </span> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-[#F2A971]">Terakhir</span>
              </h2>
              <p className="text-white/50 text-xl font-light leading-relaxed max-w-lg mx-auto md:mx-0">
                Layar ini terkunci sementara. Saat Anda menggulir ke bawah, mesin AI kami memproses kordinat data Anda di latar belakang layaknya mesin gigi presisi.
              </p>
              <div className="mt-8 flex items-center gap-3 justify-center md:justify-start text-white/30">
                <Server className="w-5 h-5 animate-pulse text-[#F2A971]" />
                <span className="text-sm uppercase tracking-widest font-semibold text-[#F2A971]">Scroll Untuk Memutar Brankas AI</span>
              </div>
            </div>

            {/* Shield 3D Sebelah Kanan (Scroll Throttle Triggers Here) */}
            <div className="flex-1 flex justify-center perspective-[1500px]">
              <div className="relative w-72 h-72 md:w-96 md:h-96 transform-style-3d">
                {/* Orbit Luar (Pasif) */}
                <div className="absolute inset-0 border-[2px] border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-6 border-[1px] border-dashed border-[#F2A971]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                
                {/* Shield Core (Reaktif Scroll) */}
                <div ref={shieldRef} className="absolute inset-16 border-2 border-[#F2A971]/50 rounded-full flex flex-col justify-center items-center backdrop-blur-md bg-[#0B0A08]/40 transform-gpu" style={{ boxShadow: "0 0 20px rgba(242,169,113,0.1)" }}>
                  <Shield className="w-20 h-20 md:w-32 md:h-32 text-[#F2A971]" strokeWidth={1.5} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#F2A971]/10 rounded-full blur-[20px] -z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* REVEAL ON SCROLL Bento Box Replaced by CircularGallery (Phase 4) */}
        {/* ========================================== */}
        <section className="container mx-auto px-6 py-20 pb-40">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Infrastruktur Keamanan Menyeluruh</h2>
            <p className="text-white/40">Geser untuk mengeksplorasi modul inti SafeWallet.</p>
          </div>

          <div className="w-full h-[600px] relative rounded-[3rem] overflow-hidden border border-white/5 bg-[#0A0907]/50 mix-blend-screen shadow-[0_0_100px_rgba(242,169,113,0.05)]">
             <CircularGallery items={featureItems} bend={3} textColor="#ffffff" borderRadius={0.05} />
          </div>
        </section>

        {/* ========================================== */}
        {/* FASE 5: THE GRAVITY OF DEBT (Sinkhole) */}
        {/* ========================================== */}
        <section ref={sinkholeSectionRef} className="relative h-screen bg-[#050403] flex items-center justify-center overflow-hidden border-t border-red-900/20 my-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,50,50,0.05)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="container mx-auto px-6 z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
              <span className="text-red-500/80">Kenyataan Pahit.</span>
            </h2>
            <p className="text-white/40 text-xl font-light leading-relaxed max-w-2xl mx-auto mb-20">
              Ribuan masyarakat terjebak kebocoran finansial pasif. Gaya hidup konsumerisme beracun memutar uang lari dari ekonomi lokal kita.
            </p>

            {/* Chaotic 3D Objects Container */}
            <div ref={debtItemsRef} className="relative w-full h-[300px] flex items-center justify-center perspective-[800px]">
              {/* Dummy elements representing debts scattered around the center */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="debt-item absolute w-16 h-16 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm transform-gpu will-change-transform"
                />
              ))}
              {/* The "Blackhole" Core */}
              <div className="absolute w-20 h-20 bg-black rounded-full border border-red-900/50 shadow-[0_0_50px_rgba(200,0,0,0.3)] z-10" />
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* FASE 6: THE INTERVENTION (Glowing Scanner) */}
        {/* ========================================== */}
        <section ref={cleansingSectionRef} className="relative h-screen bg-[#000000] flex items-center justify-center overflow-hidden border-t border-white/5">
           {/* Horizontal Scanner Beam crossing the middle of the screen initially */}
           <div ref={scannerLineRef} className="absolute top-[20%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F2A971] to-transparent shadow-[0_0_80px_20px_rgba(242,169,113,0.8)] z-50 mix-blend-screen opacity-0" />
           
           <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center h-full">
              <div className="scanner-content max-w-4xl mx-auto text-center transform-gpu">
                <Shield className="scanner-shield w-24 h-24 text-[#F2A971] mx-auto mb-10 opacity-80" />
                <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter">
                  <span className="text-white/40">Intervensi </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FFF5ED] via-[#F2A971] to-[#D9772B] drop-shadow-[0_0_20px_rgba(242,169,113,0.3)]">Kecerdasan Buatan</span>
                </h2>
                <div className="w-24 h-[1px] bg-[#F2A971]/30 mx-auto mb-8" />
                <p className="text-white/60 text-2xl font-light leading-relaxed px-4 md:px-20">
                  Sistem perlindungan yang mengkalibrasi ulang impuls finansial Anda.
                  <br className="hidden md:block" />
                  Mengunci bahaya. Membuka peluang.
                </p>
              </div>
           </div>
            {/* HexGrid HUD Overlay */}
            <div className="absolute inset-0 z-5 flex flex-wrap items-center justify-center gap-2 p-10 pointer-events-none">
              {[...Array(48)].map((_, i) => (
                <div key={i} className="hex-grid-item w-10 h-10 opacity-0"
                  style={{ clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)", background: "rgba(242,169,113,0.04)", border: "1px solid rgba(242,169,113,0.15)" }}
                />
              ))}
            </div>
            {/* AI Lock Text */}
            <div className="ai-lock-text absolute bottom-10 right-10 font-mono text-[#F2A971] text-xs tracking-[0.5em] uppercase opacity-0 z-20">AI LOCK: ESTABLISHED ▐ THREAT: 0</div>
         </section>

        {/* ========================================== */}
        {/* FASE 7: THE MICRO-ECONOMY AWAKENING */}
        {/* ========================================== */}
        <section ref={nodesSectionRef} className="h-screen bg-[#050403] relative overflow-hidden flex flex-col items-center justify-start pt-24 border-t border-[#F2A971]/10">
          <div className="micro-text container mx-auto px-6 text-center z-20 relative mt-8 mb-6 transform-gpu">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-widest uppercase"><span className="text-[#F2A971]">Sirkulasi</span> Bangkit</h2>
            <p className="text-white/40 text-2xl font-light tracking-[0.2em] uppercase">Setiap titik ekonomi adalah Anda.</p>
          </div>

          <div className="relative w-full h-full absolute inset-0 flex items-center justify-center">
            <div ref={nodesContainerRef} className="z-20 w-10 h-10 absolute flex items-center justify-center">
              {[...Array(60)].map((_, i) => (
                <div key={i} className="absolute w-2 h-2 md:w-4 md:h-4 rounded-full bg-[#F2A971] shadow-[0_0_30px_rgba(242,169,113,1)] border border-white/40 transform-gpu will-change-transform mix-blend-screen" />
              ))}
            </div>
            {/* Constellation SVG overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
              {[[100,200,400,350],[400,350,700,150],[700,150,1000,400],[1000,400,600,550],[600,550,300,600],[300,600,100,200],[700,150,300,600],[400,350,1000,400],[100,200,600,550],[700,150,600,550],[1000,400,300,600],[400,350,600,550],[200,100,800,250],[800,250,1100,500],[250,600,900,150]].map(([x1,y1,x2,y2],i) => (
                <line key={i} className="constellation-line" x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F2A971" strokeWidth="0.5" strokeDasharray="1000" strokeDashoffset="1000" />
              ))}
            </svg>
            {/* City Labels */}
            {["Jakarta","Surabaya","Medan","Bandung","Makassar","Yogyakarta","Semarang","Palembang"].map((city, i) => (
              <div key={city} className="node-city-label absolute font-mono text-[#F2A971] text-[10px] opacity-0 tracking-widest"
                style={{ left: `${8 + (i % 4) * 24}%`, top: `${20 + Math.floor(i / 4) * 55}%` }}>
                {city}
              </div>
            ))}
            <div className="micro-bg-grid absolute inset-[-100%] bg-[linear-gradient(rgba(242,169,113,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(242,169,113,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 pointer-events-none transform-gpu will-change-transform shadow-[inset_0_0_200px_rgba(5,4,3,1)]" />
          </div>
        </section>

        {/* ========================================== */}
        {/* FASE 8: THE MACRO ASCENSION (Pillar) */}
        {/* ========================================== */}
        <section ref={ascensionSectionRef} className="relative h-screen bg-[#000000] flex flex-col items-center justify-center overflow-hidden border-t border-[#F2A971]/20">
          {/* Ground Grid — Pillar that rises from below */}
          <div className="perspective-[2500px] w-full h-[150vh] flex flex-col justify-end absolute bottom-[-50vh] left-0 pointer-events-none z-0">
             <div ref={pillarGridRef} className="w-full max-w-7xl mx-auto h-[100vh] border-x-8 border-t-[16px] border-[#F2A971]/40 bg-gradient-to-t from-[#F2A971]/30 via-[#F2A971]/10 to-transparent transform rotate-x-[80deg] translate-y-[500px] opacity-0 will-change-transform shadow-[0_-100px_300px_rgba(242,169,113,0.3)]" />
          </div>

          {/* THE FORGE SWEEP — golden beam that crosses left to right mid-journey */}
          <div className="indo-forge-sweep absolute top-0 left-0 w-[30%] h-full pointer-events-none z-30 opacity-0"
            style={{ background: "linear-gradient(to right, transparent, rgba(242,169,113,0.6) 40%, rgba(255,255,255,0.3) 50%, rgba(242,169,113,0.6) 60%, transparent)", filter: "blur(8px)", mixBlendMode: "screen" }} />

          <div className="z-10 text-center relative w-full h-full flex flex-col items-center justify-center px-4">
            {/* INDONESIA TEXT — starts at scale(25) via gsap.set, zooms out to scale(1) */}
            <h2 className="indo-text will-change-transform text-[8rem] md:text-[18rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-[#D9772B] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-full text-center select-none pointer-events-none">
              INDONESIA
            </h2>

            {/* SUBTITLE — drifts up after text crystallizes */}
            <p className="indo-subtitle absolute bottom-[28%] left-1/2 -translate-x-1/2 w-full text-xl md:text-3xl text-white/70 font-light leading-relaxed tracking-wider text-center max-w-4xl mx-auto px-6 opacity-0">
              Negara tak terkalahkan bermula dari finansial individu yang terproteksi.
            </p>

            {/* CTA — materializes last as the finale reward */}
            <div className="indo-cta opacity-0 transform-gpu absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-20 px-16 rounded-full bg-gradient-to-r from-[#F2A971] to-[#D9772B] text-[#0B0A08] text-2xl font-black shadow-[0_0_100px_rgba(242,169,113,0.8)] hover:scale-105 hover:shadow-[0_0_200px_rgba(242,169,113,1)] transition-all duration-500 hover:brightness-110"
              >
                Mulai Selamatkan Dana Anda
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================== */}
      {/* FINAL BRANDING (Scroll Velocity) */}
      {/* ========================================== */}
      <div className="relative w-full overflow-hidden flex items-center bg-[#F2A971] py-8 md:py-16 shadow-[0_0_150px_rgba(242,169,113,0.15)] z-20">
        <ScrollVelocity
          texts={["SafeWallet"]}
          velocity={100}
          className="text-[#0B0A08] font-black mx-8 text-7xl md:text-9xl drop-shadow-xl"
          damping={50}
          stiffness={400}
          numCopies={6}
        />
      </div>

      {/* Flowing Menu Footer */}
      <footer className="border-t border-white/5 bg-[#060010] h-[300px] md:h-[400px]">
         <FlowingMenu 
           items={footerMenu} 
           speed={20} 
           textColor="#ffffff" 
           bgColor="#0B0A08" 
           marqueeBgColor="#F2A971" 
           marqueeTextColor="#0B0A08" 
           borderColor="rgba(255,255,255,0.05)"
         />
      </footer>
    </div>
  );
}
