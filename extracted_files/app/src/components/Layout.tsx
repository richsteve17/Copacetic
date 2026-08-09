import { Outlet } from 'react-router';
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import GrainOverlay from '@/components/GrainOverlay';

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared layout (nested-route pattern). The navbar is FIXED at 64px (design.md §7.1),
 * so the content slot owns the matching top padding (pt-16). Full-bleed heroes
 * opt out inside the page with a negative top margin.
 */
export default function Layout() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-void text-ink-hi">
      <CustomCursor />
      <GrainOverlay />
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
