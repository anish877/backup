'use client';
import React, { useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import HealthImprovementChart from '../components/HealthImprovementChart';
import WaterTracker from '../components/WaterTracker';
import MealTrackingCard from '../components/MealTrackingCard';
import MoodAnalysisCard from '../components/MoodAnalysisCard';
import SleepTrackingCard from '../components/SleepTrackingCard';

const Index = () => {
  const textRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Top section taking full screen height */}
      <section className="h-screen bg-zinc-100">
        <div className="container mx-auto px-4 py-6 h-full">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
            <div className="md:col-span-3 h-full flex items-center">
              <div className="w-full h-full">
                <HealthImprovementChart />
              </div>
            </div>
            <div className="md:col-span-2 h-full flex items-center">
              <div className="w-full h-full">
                <WaterTracker />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Animated Text Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden relative">
        <div 
          ref={textRef}
          className="text-center transition-all duration-1000 transform translate-y-full opacity-0"
        >
          <h2 className="text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tight animate-pulse">
            <span className="inline-block hover:scale-110 transition-transform duration-300">D</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">I</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">S</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">C</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">I</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">P</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">L</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">I</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">N</span>
            <span className="inline-block hover:scale-110 transition-transform duration-300">E</span>
          </h2>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 opacity-80">
            <span className="inline-block animate-bounce delay-100">I</span>
            <span className="inline-block animate-bounce delay-200">S</span>
            <span className="mx-4 inline-block animate-bounce delay-300">P</span>
            <span className="inline-block animate-bounce delay-400">O</span>
            <span className="inline-block animate-bounce delay-500">W</span>
            <span className="inline-block animate-bounce delay-600">E</span>
            <span className="inline-block animate-bounce delay-700">R</span>
          </h2>
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white opacity-10 rounded-full"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(100px, -100px) rotate(180deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
          }
          .animate-in {
            transform: translateY(0);
            opacity: 1;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }
          .delay-700 { animation-delay: 0.7s; }
        `}</style>
      </section>
      
      {/* Cards section appears when scrolling */}
      <section className="min-h-screen bg-zinc-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <MealTrackingCard />
            </div>
            <div>
              <MoodAnalysisCard />
            </div>
            <div>
              <SleepTrackingCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;