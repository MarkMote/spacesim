'use client';
import React from 'react';
import ThreeScene from './ThreeScene';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-slate-100">
        <ThreeScene />
      </div>
    </main>
  );
}