import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 700;

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const { viewport, pointer } = useThree();

  const { positions, base, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const base = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 4;
      positions.set([x, y, z], i * 3);
      base.set([x, y, z], i * 3);
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, base, seeds };
  }, []);

  const displacement = useMemo(() => new Float32Array(COUNT * 3), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
    const px = (pointer.x * viewport.width) / 2;
    const py = (pointer.y * viewport.height) / 2;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const bx = base[ix];
      const by = base[ix + 1];
      const waveX = Math.sin(t * 0.15 + seeds[i]) * 0.35;
      const waveY = Math.cos(t * 0.12 + seeds[i] * 1.7) * 0.28;
      // gentle cursor repel within ~120px-equivalent world radius
      const dx = bx + waveX - px;
      const dy = by + waveY - py;
      const dist = Math.hypot(dx, dy);
      if (dist < 1.6 && dist > 0.001) {
        const f = ((1.6 - dist) / 1.6) * 0.06;
        displacement[ix] += (dx / dist) * f;
        displacement[ix + 1] += (dy / dist) * f;
      }
      displacement[ix] *= 0.95;
      displacement[ix + 1] *= 0.95;
      attr.array[ix] = bx + waveX + displacement[ix];
      attr.array[ix + 1] = by + waveY + displacement[ix + 1];
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#6A6775" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

/** Slow amber signal pulse: an expanding ring every ~7s. */
function SignalPulse() {
  const ref = useRef<THREE.Mesh>(null);
  const origin = useMemo(() => new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, 0), []);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const cycle = (clock.getElapsedTime() % 7) / 7;
    const scale = 0.5 + cycle * 9;
    mesh.scale.setScalar(scale);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.05 * (1 - cycle);
  });
  return (
    <mesh ref={ref} position={origin}>
      <ringGeometry args={[0.95, 1, 64]} />
      <meshBasicMaterial color="#FFB648" transparent opacity={0.05} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Hero particle field (design.md §5: dpr ≤ 1.5, ≤ 900 particles). */
export default function ParticleField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 55 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      gl={{ antialias: false, alpha: true }}
    >
      <Particles />
      <SignalPulse />
    </Canvas>
  );
}
