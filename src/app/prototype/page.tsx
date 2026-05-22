'use client';

import React, { useRef, useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Skull, TrendingDown, Eye, Database, Smartphone, Flame, AlertCircle, HeartPulse, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// ==========================================
// 1. 3D "CONSCIOUS" MASCOT COMPONENT
// ==========================================
function Companion3D() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Breathing effect
    const breath = 1 + Math.sin(t * 2) * 0.05;
    meshRef.current.scale.set(breath, breath, breath);
    
    // Hovering
    meshRef.current.position.y = Math.sin(t * 1.5) * 0.2;

    // Smooth tracking
    const targetRotX = (state.mouse.y * Math.PI) / 6;
    const targetRotY = (state.mouse.x * Math.PI) / 4;
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.1;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#10B981" // Emerald 500
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={1}
          roughness={0.1}
          distort={0.5}
          speed={3}
        />
      </mesh>
    </Float>
  );
}

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================
export default function ExtendedCinematicPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mascotWrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useGSAP(() => {
    if (!isMounted) return;

    // Custom Cursor
    const cursor = cursorRef.current;
    if (cursor) {
      window.addEventListener("mousemove", (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
      });
    }

    // Progress Bar
    gsap.to(".progress-bar", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.1,
      }
    });

    // ----------------------------------------------------
    // SCROLL-TRIGGERED STORYTELLING (PINNING & FADING)
    // ----------------------------------------------------
    const sections = gsap.utils.toArray(".story-panel");
    
    sections.forEach((sec: any, i) => {
      const textBlock = sec.querySelector(".panel-content");
      const subText = sec.querySelector(".panel-subtext");

      // Pinning the section to create a long reading experience
      ScrollTrigger.create({
        trigger: sec,
        start: "top top",
        end: "+=150%", // Scroll lasts 1.5x the screen height per section
        pin: true,
        pinSpacing: true,
      });

      // Animate elements inside the pinned section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "+=150%",
          scrub: 1,
        }
      });

      // Fade in
      tl.fromTo(textBlock, 
        { y: 150, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
      )
      .fromTo(subText, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5"
      )
      // Hold
      .to({}, { duration: 1 })
      // Fade out before next section
      .to([textBlock, subText], { y: -100, opacity: 0, duration: 1, ease: "power2.in" });
    });

    // ----------------------------------------------------
    // MASCOT GUIDANCE TIMELINE (Mapped to entire page)
    // ----------------------------------------------------
    // The mascot acts as a guide, pointing or observing the text.
    const mascotTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    // Intro (Center) -> Pinjol 1 (Top Right)
    mascotTl.to(mascotWrapperRef.current, { x: "35vw", y: "-30vh", scale: 0.7, rotationZ: 15 }, (1/9) * 1)
    // Pinjol 2 (Bottom Left)
    .to(mascotWrapperRef.current, { x: "-35vw", y: "30vh", scale: 0.8, rotationZ: -10 }, (1/9) * 2)
    // Judol 1 (Top Center, looking down)
    .to(mascotWrapperRef.current, { x: "0vw", y: "-40vh", scale: 0.6, rotationX: 45 }, (1/9) * 3)
    // Judol 2 (Right edge, hovering)
    .to(mascotWrapperRef.current, { x: "40vw", y: "0vh", scale: 0.8, rotationX: 0 }, (1/9) * 4)
    // Ponzi 1 (Left edge, cautious)
    .to(mascotWrapperRef.current, { x: "-40vw", y: "-10vh", scale: 0.7, rotationZ: -20 }, (1/9) * 5)
    // Ponzi 2 (Bottom Center, observing the collapse)
    .to(mascotWrapperRef.current, { x: "0vw", y: "40vh", scale: 0.9, rotationZ: 0 }, (1/9) * 6)
    // Aftermath (Center, pulsing)
    .to(mascotWrapperRef.current, { x: "0vw", y: "0vh", scale: 1 }, (1/9) * 7)
    // SafeWallet Reveal (Grows massive)
    .to(mascotWrapperRef.current, { x: "0vw", y: "0vh", scale: 2 }, (1/9) * 8)
    // SafeWallet Impact (Final form)
    .to(mascotWrapperRef.current, { x: "0vw", y: "-15vh", scale: 2.5 }, (1/9) * 9);

  }, { scope: containerRef, dependencies: [isMounted] });

  if (!isMounted) return null;

  return (
    <div ref={containerRef} className="relative bg-black text-white font-sans overflow-x-hidden selection:bg-emerald-400 selection:text-black cursor-none">
      
      {/* Kursor */}
      <div ref={cursorRef} className="fixed top-0 left-0 w-6 h-6 bg-emerald-400 rounded-full pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference" style={{ willChange: "transform" }} />

      {/* Global Progress Line Tracker */}
      <div className="fixed left-8 top-0 bottom-0 w-1 bg-zinc-900 z-40 origin-top">
        <div className="progress-bar w-full h-full bg-emerald-400 scale-y-0 origin-top"></div>
      </div>

      {/* COMPANION MASCOT - Menemani User secara Fixed */}
      <div 
        ref={mascotWrapperRef} 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 z-50 pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
          <pointLight position={[-5, -5, -5]} intensity={2} color="#10B981" />
          <Companion3D />
        </Canvas>
      </div>

      {/* ======================= LONG SCROLL STORY PANELS ======================= */}

      {/* LAYER 1: The Hook */}
      <section className="story-panel relative h-screen flex flex-col justify-center px-16 md:px-32 bg-[#FDFCF8] text-black border-b-8 border-black">
        <div className="panel-content z-10 max-w-5xl">
          <p className="font-bold tracking-widest uppercase mb-6 text-slate-500">Sebuah Epidemi Tak Kasat Mata</p>
          <h1 className="text-7xl md:text-[8rem] font-black leading-[0.9] uppercase tracking-tighter">
            Hancur Dalam <br/><span className="text-red-600 underline decoration-8">Satu Klik.</span>
          </h1>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold border-l-8 border-black pl-8 max-w-3xl z-10">
          Setiap detiknya, uang hasil keringat bertahun-tahun lenyap begitu saja. Bukan karena dirampok di jalan, melainkan dirampok melalui layar yang sedang Anda genggam saat ini. Terus gulir ke bawah.
        </div>
      </section>

      {/* LAYER 2: Pinjol - The Trap */}
      <section className="story-panel relative h-screen flex flex-col justify-center px-16 md:px-32 bg-red-600 text-black border-b-8 border-black">
        <div className="absolute inset-0 opacity-10 font-black text-[20rem] leading-none overflow-hidden text-black pointer-events-none">
          UTANG UTANG UTANG UTANG UTANG
        </div>
        <div className="panel-content z-10 max-w-4xl">
          <Smartphone className="w-20 h-20 mb-8" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[7rem] font-black uppercase leading-[0.9]">
            Lingkaran <br/><span className="text-white drop-shadow-md">Setan Pinjol.</span>
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold bg-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-3xl z-10">
          Awalnya menawarkan "Pencairan Cepat Tanpa BI Checking". Anda terdesak, Anda setuju. Minggu depannya, bunga membengkak 300%.
        </div>
      </section>

      {/* LAYER 3: Pinjol - Data Terror */}
      <section className="story-panel relative h-screen flex flex-col justify-center items-end text-right px-16 md:px-32 bg-[#111] text-white border-b-8 border-zinc-900">
        <div className="panel-content z-10 max-w-4xl flex flex-col items-end">
          <Database className="w-20 h-20 mb-8 text-red-500" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[7rem] font-black uppercase leading-[0.9] text-zinc-300">
            Teror <br/><span className="text-red-600">Digital.</span>
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-medium text-zinc-400 border-r-8 border-red-600 pr-8 max-w-3xl z-10">
          Mereka tidak hanya mengambil uang Anda. Mereka menyedot kontak, galeri, dan lokasi Anda. Ketika Anda gagal bayar, foto identitas Anda disebar ke bos, keluarga, dan teman. Reputasi Anda hancur total.
        </div>
      </section>

      {/* LAYER 4: Judol - The Illusion */}
      <section className="story-panel relative h-screen flex flex-col justify-center px-16 md:px-32 bg-yellow-400 text-black border-b-8 border-black">
        <div className="panel-content z-10 max-w-4xl">
          <Flame className="w-20 h-20 mb-8" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[7rem] font-black uppercase leading-[0.9]">
            Racun <br/><span className="bg-black text-white px-4">Dopamin.</span>
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold bg-black text-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] max-w-3xl z-10">
          Iklan selebgram menjanjikan "Gacor" dan "Maxwin". Hanya dengan deposit 50 ribu, Anda diberi ilusi kemenangan kecil. Otak Anda dibanjiri dopamin. Anda kecanduan.
        </div>
      </section>

      {/* LAYER 5: Judol - The Rigged System */}
      <section className="story-panel relative h-screen flex flex-col justify-center items-end text-right px-16 md:px-32 bg-zinc-900 text-white border-b-8 border-black">
        <div className="panel-content z-10 max-w-4xl flex flex-col items-end">
          <Eye className="w-20 h-20 mb-8 text-yellow-400" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[7rem] font-black uppercase leading-[0.9]">
            Mesin yang <br/>Telah <span className="text-yellow-400">Diatur.</span>
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold text-zinc-300 border-r-8 border-yellow-400 pr-8 max-w-3xl z-10">
          Anda tidak sedang bermain mengandalkan keberuntungan. Anda sedang bertarung melawan baris-baris kode algoritma yang didesain matematis untuk memeras harta Anda hingga tak tersisa.
        </div>
      </section>

      {/* LAYER 6: Ponzi - The Fake Lifestyle */}
      <section className="story-panel relative h-screen flex flex-col justify-center px-16 md:px-32 bg-[#FDFCF8] text-black border-b-8 border-black">
        <div className="panel-content z-10 max-w-4xl">
          <TrendingDown className="w-20 h-20 mb-8" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[7rem] font-black uppercase leading-[0.9]">
            Gaya Hidup <br/><span className="bg-emerald-300 px-4">Palsu.</span>
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold bg-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-3xl z-10">
          Di media sosial, mereka pamer mobil mewah dan liburan ke Dubai. Mengklaim memiliki robot trading atau koin kripto revolusioner. Faktanya? Mereka membayar keuntungan anggota lama dengan uang pendaftaran dari Anda.
        </div>
      </section>

      {/* LAYER 7: Ponzi - The Collapse */}
      <section className="story-panel relative h-screen flex flex-col justify-center items-center text-center px-16 md:px-32 bg-red-600 text-white border-b-8 border-black">
        <div className="panel-content z-10 max-w-4xl">
          <AlertCircle className="w-24 h-24 mb-8 mx-auto" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[8rem] font-black uppercase leading-[0.9] drop-shadow-[8px_8px_0_rgba(0,0,0,1)]">
            Sistem <br/>Runtuh.
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold bg-black text-white p-8 border-4 border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-3xl z-10">
          Satu per satu member kesulitan menarik dana. Alasan "maintenance" dan "serangan hacker" mulai keluar. Sampai akhirnya website menghilang, membawa triliunan rupiah uang masyarakat tanpa jejak.
        </div>
      </section>

      {/* LAYER 8: The Void */}
      <section className="story-panel relative h-screen flex flex-col justify-center items-center text-center px-16 md:px-32 bg-[#0a0a0a] text-white border-b-8 border-emerald-900">
        <div className="panel-content z-10 max-w-5xl">
          <HeartPulse className="w-16 h-16 mb-8 mx-auto text-zinc-600" strokeWidth={2}/>
          <h2 className="text-5xl md:text-[5rem] font-black uppercase leading-[1.1] text-zinc-500">
            Kita tidak bisa melawan mesin penipu canggih hanya dengan sekadar "berhati-hati".
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-2xl font-medium text-zinc-400 max-w-3xl z-10">
          Manusia memiliki kelemahan: Keserakahan, Ketakutan, dan Keputusasaan. Kita butuh sesuatu yang dingin, analitis, dan kebal terhadap emosi untuk melindungi kita.
        </div>
      </section>

      {/* LAYER 9: SafeWallet - The Guardian */}
      <section className="story-panel relative h-screen flex flex-col justify-center px-16 md:px-32 bg-[#FDFCF8] text-black border-b-8 border-black">
        <div className="panel-content z-10 max-w-4xl">
          <ShieldCheck className="w-24 h-24 mb-8 text-emerald-500" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[7rem] font-black uppercase leading-[0.9]">
            Inilah Mengapa <br/><span className="text-emerald-500 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">SafeWallet</span> Hadir.
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold text-slate-800 bg-emerald-100 p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-3xl z-10">
          Sebuah entitas AI (*Powered by Gemini 2.0*) yang bertindak sebagai lapis baja pelindung literasi Anda. Sebelum Anda klik atau mentransfer, ia membedah miliaran pola data, regulasi OJK, dan red-flags penipuan dalam hitungan detik.
        </div>
      </section>

      {/* LAYER 10: The Impact */}
      <section className="story-panel relative h-screen flex flex-col justify-center items-center text-center px-16 md:px-32 bg-emerald-400 text-black">
        <div className="panel-content z-10 max-w-5xl">
          <CheckCircle2 className="w-32 h-32 mb-8 mx-auto" strokeWidth={3}/>
          <h2 className="text-6xl md:text-[8rem] font-black uppercase leading-[0.9]">
            Ambil Alih <br/>Kendali.
          </h2>
        </div>
        <div className="panel-subtext mt-12 text-3xl font-bold bg-white text-black p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-4xl z-10">
          Mencegah kehancuran sebelum terjadi. Mengubah Anda dari target empuk menjadi individu yang tak bisa dimanipulasi. Waktunya mempersenjatai diri Anda.
          <br/><br/>
          <button className="bg-black text-white px-12 py-6 rounded-2xl font-black text-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all mt-8">
            Gunakan SafeWallet
          </button>
        </div>
      </section>

    </div>
  );
}
