'use client';
import React, { useEffect, useState } from 'react';

const AddOneForm = () => {
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the default form submit action
    try {
      const response = await fetch(`/api/multiply/${number1}/${number2}`);
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResult(null);
    }
  };

  return (
    <div className="p-4 bg-[#09090b]">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2 text-black">
        <label htmlFor="numberInput1" className="text-lg  text-slate-300">Enter the first number:</label>
        <input
          id="numberInput1"
          type="number"
          value={number1}
          onChange={(e) => setNumber1(e.target.value)}
          className="border border-gray-300 p-2"
          required
        />
        <label htmlFor="numberInput2" className="text-lg text-slate-300">Enter the second number:</label>
        <input
          id="numberInput2"
          type="number"
          value={number2}
          onChange={(e) => setNumber2(e.target.value)}
          className="border border-gray-300 p-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-black p-2 rounded hover:bg-blue-700 transition duration-150">
          Add One
        </button>
      </form>
      {result !== null && (
        <div className="mt-4">
          <p className="text-lg">Result: {result}</p>
        </div>
      )}
    </div>
  );
};


export default function Home() {
  const [apiResponse, setApiResponse] = useState({ status: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/healthchecker');
      const data = await response.json();
      setApiResponse(data);
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* Display API response */}
        <div>
          <p>Status: {apiResponse.status}</p>
          <p>Message: {apiResponse.message}</p>
        </div>
        <AddOneForm />
      </div>
    </main>
  );
}
