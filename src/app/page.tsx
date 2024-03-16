


'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// declare module 'three/examples/jsm/controls/OrbitControls' {
//   export * from 'three/examples/jsm/controls/OrbitControls';
// }


type SimulationData = {
  quaternion: [number, number, number, number],
  angular_velocity: [number, number, number],
  time: number,
};

type CubeState = {
  time: number,
  eulerAngles: { x: number; y: number; z: number };
  quaternions: [number, number, number, number];
  rotationalVelocity: [number, number, number];
};

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [simulationTrigger, setSimulationTrigger] = useState<number>(0);
  const simulationData = useRef<SimulationData[]>([]);

  const [cubeState, setCubeState] = useState<CubeState>({
    time: 0.0,
    eulerAngles: { x: 0, y: 0, z: 0 },
    quaternions: [1, 0, 0, 0],
    rotationalVelocity: [0.0, 0.0, 0.0]
  });

  function initiateSimulation() {
    const url = `/api/simulate`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        simulationData.current = data.simulation_data as SimulationData[];
        setSimulationTrigger(prev => prev + 1);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x09090b, 0.0);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 20);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = false;
    // controls.dampingFactor = 0.025;
    // controls.enableZoom = true;

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial(
      { opacity: 0.85, transparent: true }
    ); // Changed to MeshBasicMaterial for compatibility
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.set(3, 3, 3);
    camera.lookAt(cube.position);

    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const cubeAxesHelper = new THREE.AxesHelper(1);
    cube.add(cubeAxesHelper);

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      if (simulationData.current.length > 0) {
        const stepData = simulationData.current.shift(); // Assuming we consume the data sequentially
        if (!stepData) return;

        cube.quaternion.set(stepData.quaternion[1], stepData.quaternion[2], stepData.quaternion[3], stepData.quaternion[0]);
        const euler = new THREE.Euler().setFromQuaternion(cube.quaternion, 'XYZ');

        setCubeState({
          time: stepData.time,
          eulerAngles: { x: euler.x, y: euler.y, z: euler.z },
          quaternions: stepData.quaternion,
          rotationalVelocity: stepData.angular_velocity
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [simulationTrigger]); // Ensure dependencies are correctly managed

  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative">


      <div ref={mountRef} className='h-[100%] z-20'></div>
      {/* State information display updated to reflect cubeState */}
      <div className="z-20 absolute flex-col top-0 left-0 m-4 p-4 bg-gradient-to-br from-black/0 to-indigo-500/20 
      w-[550px] h-[130px] px-5 text-white/70 rounded-lg border-indigo-500/50 border font-mono">
        {/* <div>STATE</div> */}
        <div className=' w-full '> Time: {cubeState.time.toFixed(3)} s </div>
        <p>Euler Angles: φ: {(cubeState.eulerAngles.x * 180 / Math.PI).toFixed(2)}°, θ: {(cubeState.eulerAngles.y * 180 / Math.PI).toFixed(2)}°, ψ: {(cubeState.eulerAngles.z * 180 / Math.PI).toFixed(2)}°</p>
        <p>Quaternions: W: {cubeState.quaternions[0].toFixed(2)}, X: {cubeState.quaternions[1].toFixed(2)}, Y: {cubeState.quaternions[2].toFixed(2)}, Z: {cubeState.quaternions[3].toFixed(2)}</p>
        <p>Rotational Velocity: X: {cubeState.rotationalVelocity[0].toFixed(3)}, Y: {cubeState.rotationalVelocity[1].toFixed(3)}, Z: {cubeState.rotationalVelocity[2].toFixed(3)}</p>
      </div>
      <button onClick={initiateSimulation} className="z-20 bg-indigo-500/20 text-white p-2 rounded-lg mt-4 absolute top-0 right-0 mx-4 px-5
       font-mono text-bold hover:bg-indigo-800/20 border border-indigo-500/50">Simulate</button>

      <img src="/earth.jpg" alt="Earth Background" className=" z-0 absolute inset-0 w-full h-full object-cover" />
      {/* <img src="/space1.jpg" alt="Earth Background" className=" z-0 absolute inset-0 w-full h-full object-cover" /> */}

    </main >
  );
}
