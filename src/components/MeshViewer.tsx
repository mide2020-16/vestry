"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

/* ── Module-level cache: url → centered clone (no color applied) ─────────── */
const sceneCache = new Map<string, THREE.Group>();

/* ── Auto-fit camera ─────────────────────────────────────────────────────── */
function AutoFitCamera({ target }: { target: THREE.Group }) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(target);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const distance = (maxDim / 2 / Math.tan(fov / 2)) * 1.15;

    camera.position.set(center.x, center.y + size.y * 0.1, distance);
    camera.lookAt(center);
    gl.render(scene, camera);
  }, [target, camera, gl, scene]);

  return null;
}

/* ── Model ───────────────────────────────────────────────────────────────── */
function Model({ url, color }: { url: string; color: string }) {
  const { scene } = useGLTF(url);

  // Get or create a centered base clone (never mutated after caching)
  const baseClone = useMemo(() => {
    if (!sceneCache.has(url)) {
      const clone = scene.clone(true);
      const box = new THREE.Box3().setFromObject(clone);
      const center = box.getCenter(new THREE.Vector3());
      clone.position.sub(center);
      sceneCache.set(url, clone);
    }
    return sceneCache.get(url)!;
  }, [url, scene]);

  // Create a fresh clone of the base for this viewer instance
  const instanceClone = useMemo(() => baseClone.clone(true), [baseClone]);

  // Apply color as a side effect — never inside useMemo
  useEffect(() => {
    instanceClone.traverse((child: THREE.Object3D) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      const applyColor = (mat: THREE.Material): THREE.MeshStandardMaterial => {
        const m = (mat as THREE.MeshStandardMaterial).clone();
        m.color.set(color);
        return m;
      };

      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(applyColor)
        : applyColor(mesh.material as THREE.Material);
    });
  }, [instanceClone, color]);

  return (
    <>
      <primitive object={instanceClone} />
      <AutoFitCamera target={instanceClone} />
    </>
  );
}

/* ── Loading placeholder ─────────────────────────────────────────────────── */
function LoadingBox({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ── Viewer ──────────────────────────────────────────────────────────────── */
interface MeshViewerProps {
  modelUrl?: string;
  color?: string;
}

export default function MeshViewer({
  modelUrl = "/models/shirt.glb",
  color = "#ffffff",
}: MeshViewerProps) {
  useGLTF.preload(modelUrl);

  return (
    <div className="w-full h-105 rounded-2xl overflow-hidden bg-black/30 border border-white/10">
      <Canvas shadows camera={{ fov: 40, near: 0.01, far: 100 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 3]} intensity={1.4} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.4} />

        <Suspense fallback={<LoadingBox color={color} />}>
          <Model url={modelUrl} color={color} />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.3}
            blur={3}
            far={3}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
