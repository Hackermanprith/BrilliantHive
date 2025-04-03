"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCw } from "lucide-react";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isRunning) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-200 to-blue-300">
      <motion.div
        className="relative w-64 h-64 flex items-center justify-center rounded-full bg-white shadow-lg"
        animate={{ rotate: isRunning ? 360 : 0 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-semibold text-gray-700">{formatTime(time)}</h1>
        </div>
      </motion.div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-3 rounded-full bg-green-500 text-white shadow-md hover:bg-green-600 transition"
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={() => { setTime(0); setIsRunning(false); }}
          className="p-3 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition"
        >
          <RotateCw size={24} />
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;