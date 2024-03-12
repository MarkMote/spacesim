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

  const resetCubeState = () => {
    setCubeState({
      eulerAngles: { x: 0, y: 0, z: 0 },
      quaternions: { x: 0, y: 0, z: 0, w: 0 },
      rotationalVelocity: { x: 0.00, y: 0.00, z: 0.00 }
    });
  }

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
      <div className="absolute flex-col top-0 right-0 m-4 p-4 bg-gradient-to-br from-black/0 to-indigo-500/10 
        w-[250px] px-5 text-white/70 rounded-lg border-indigo-300/20 border font-mono g">
        <div className='pb-2'>CONTROLS</div>
        <div className='flex gap-2'>
          <button
            className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg '
            onClick={() => setCubeState(prevState => ({
              ...prevState,
              rotationalVelocity: {
                x: prevState.rotationalVelocity.x + deltaV,
                y: prevState.rotationalVelocity.y,
                z: prevState.rotationalVelocity.z
              }
            }))}>←</button>

          <button
            className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg '
            onClick={() => setCubeState(prevState => ({
              ...prevState,
              rotationalVelocity: {
                x: prevState.rotationalVelocity.x - deltaV,
                y: prevState.rotationalVelocity.y,
                z: prevState.rotationalVelocity.z
              }
            }))}>→</button>
          <div className='p-1 px-2 text-red-300'>x-rotation</div>
        </div>
        <div className='flex gap-2 py-2'>
          <button
            className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg '
            onClick={() => setCubeState(prevState => ({
              ...prevState,
              rotationalVelocity: {
                x: prevState.rotationalVelocity.x,
                y: prevState.rotationalVelocity.y + deltaV,
                z: prevState.rotationalVelocity.z
              }
            }))}>←</button>

          <button
            className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg '
            onClick={() => setCubeState(prevState => ({
              ...prevState,
              rotationalVelocity: {
                x: prevState.rotationalVelocity.x,
                y: prevState.rotationalVelocity.y - deltaV,
                z: prevState.rotationalVelocity.z
              }
            }))}>→</button>
          <div className='p-1 px-2 text-green-300'>y-rotation</div>
        </div>
        <div className='flex gap-2'>
          <button
            className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg '
            onClick={() => setCubeState(prevState => ({
              ...prevState,
              rotationalVelocity: {
                x: prevState.rotationalVelocity.x,
                y: prevState.rotationalVelocity.y,
                z: prevState.rotationalVelocity.z + deltaV
              }
            }))}>←</button>

          <button
            className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg '
            onClick={() => setCubeState(prevState => ({
              ...prevState,
              rotationalVelocity: {
                x: prevState.rotationalVelocity.x,
                y: prevState.rotationalVelocity.y,
                z: prevState.rotationalVelocity.z - deltaV
              }
            }))}>→</button>
          <div className='p-1 px-2 text-blue-300'>z-rotation</div>
        </div>
        <button
          className='bg-indigo-500/20 hover:bg-indigo-500/30 text-white/80 px-3 py-1 rounded-lg mt-2'
          onClick={resetCubeState}>Reset</button>


      </div>
    </main>
  );
}
