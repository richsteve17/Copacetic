import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 400;

function Drift() {
  const ref = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions.set(
        [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 4],
        i * 3,
      );
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds };
  }, []);

  const base = useMemo(() => positions.slice(), [positions]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      attr.array[ix] = base[ix] + Math.sin(t * 0.12 + seeds[i]) * 0.4;
      attr.array[ix + 1] = base[ix + 1] + Math.cos(t * 0.1 + seeds[i] * 1.6) * 0.3;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#FFB648" transparent opacity={0.2} sizeAttenuation />
    </points>
  );
}

/** Dimmer 400-point field behind the results header dial; pauses off-screen. */
export default function ResultsParticles() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 55 }}
        frameloop={visible ? 'always' : 'never'}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        gl={{ antialias: false, alpha: true }}
      >
        <Drift />
      </Canvas>
    </div>
  );
}
