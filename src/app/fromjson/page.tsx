'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Home() {
  const deltaV = 0.005;
  const mountRef = useRef<HTMLDivElement>(null);
  const cubeRotation = useRef({ x: 0, y: 0, z: 0 }); // Use ref to track rotation without causing re-renders

  // State to store and display the cube's state information
  const [cubeState, setCubeState] = useState({
    eulerAngles: { x: 0, y: 0, z: 0 },
    quaternions: { x: 0, y: 0, z: 0, w: 0 },
    rotationalVelocity: { x: 0.00, y: 0.00, z: 0.00 }
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x09090b);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }


    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Bright white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1); // Adjust as needed
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(1, -1, 1); // Adjust as needed
    scene.add(directionalLight2);

    // Box geometry setup with axes
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x7b49fc,
      metalness: 0.8,
      roughness: 0.5,
      opacity: 1,
      transparent: true,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const axesHelper = new THREE.AxesHelper(1);
    cube.add(axesHelper); // Add axes to the cube

    camera.position.z = 5;

    // Animation loop with updated rotation handling
    const animate = function () {
      requestAnimationFrame(animate);

      // Use the ref for rotation
      cube.rotation.x = cubeRotation.current.x;
      cube.rotation.y = cubeRotation.current.y;
      cube.rotation.z = cubeRotation.current.z;

      // Update rotation based on velocity
      cubeRotation.current.x += cubeState.rotationalVelocity.x;
      cubeRotation.current.y += cubeState.rotationalVelocity.y;
      cubeRotation.current.z += cubeState.rotationalVelocity.z;

      // Update state for display without resetting rotation
      setCubeState(prevState => ({
        ...prevState,
        eulerAngles: { x: cube.rotation.x, y: cube.rotation.y, z: cube.rotation.z },
        quaternions: cube.quaternion,
      }));

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [cubeState.rotationalVelocity]); // Dependency remains to re-run animation loop on velocity change


  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative">
      <div ref={mountRef} className='h-[80%]'></div>
      {/* State information display */}
      <div className="absolute flex-col top-0 left-0 m-4 p-4 bg-gradient-to-br from-black/0 to-indigo-500/10 
      w-[550px] px-5 text-white/70 rounded-lg border-indigo-300/20 border font-mono">
        <div className=''>STATE</div>
        <p>Euler Angles: φ: {cubeState.eulerAngles.x.toFixed(2)}°, θ: {cubeState.eulerAngles.y.toFixed(2)}°, ψ: {cubeState.eulerAngles.z.toFixed(2)}°</p>
        <p>Quaternions: W: {cubeState.quaternions.w.toFixed(2)}, X: {cubeState.quaternions.x.toFixed(2)}, Y: {cubeState.quaternions.y.toFixed(2)}, Z: {cubeState.quaternions.z.toFixed(2)}</p>
        <p>Rotational Velocity: X: {cubeState.rotationalVelocity.x.toFixed(3)}, Y: {cubeState.rotationalVelocity.y.toFixed(3)}, Z: {cubeState.rotationalVelocity.z.toFixed(3)}</p>
      </div>
    </main>
  );
}
