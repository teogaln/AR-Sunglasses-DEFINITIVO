import React, { useState, useEffect } from 'react';
import Camera from './components/Camera';
import SunglassesSelector from './components/SunglassesSelector';
import { SUNGLASSES_STYLES } from './constants';
import { AppStep, SunglassesStyle } from './types';
import { tryOnSunglasses } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<SunglassesStyle | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);

  // Check for API Key on load
  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === "" || process.env.API_KEY === "undefined";

  useEffect(() => {
    // Reset error when navigating
    setError(null);
  }, [step]);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep('select');
  };

  const handleSelectStyle = (style: SunglassesStyle) => {
    setSelectedStyle(style);
  };

  const handleGenerate = async () => {
    if (!capturedImage || !selectedStyle) return;
    if (isApiKeyMissing) {
      setError("API Key is missing. Please add it to your Environment Variables in your hosting dashboard.");
      return;
    }

    const now = Date.now();
    if (rateLimitedUntil && now < rateLimitedUntil) {
      setError(`Rate limited. Please wait ${Math.ceil((rateLimitedUntil - now) / 1000)}s and try again.`);
      return;
    }

    setStep('processing');
    try {
      console.log('Calling tryOnSunglasses...', { selectedStyle, capturedImage: capturedImage?.slice(0, 50) });
      const result = await tryOnSunglasses(capturedImage, selectedStyle.prompt);
      setResultImage(result);
      setStep('result');
    } catch (err: any) {
      console.error("Try-on error:", err);
      const message = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));

      // Handle rate limiting from Gemini API
      if (message.toLowerCase().includes('too many requests') || message.toLowerCase().includes('quota')) {
        const retryAfterMs = 30_000; // 30 seconds
        setRateLimitedUntil(Date.now() + retryAfterMs);
        setError(`Rate limited by the API. Please wait ${Math.round(retryAfterMs / 1000)}s and try again.`);
      } else {
        setError(message || "Failed to generate your look. Please try again.");
      }
      setStep('select');
    }
  };

  const resetApp = () => {
    setCapturedImage(null);
    setResultImage(null);
    setSelectedStyle(null);
    setStep('intro');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black transition-colors duration-500">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={resetApp}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
             <div className="w-3 h-3 bg-black rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tighter">LUMINA SPECS</h1>
        </div>
        <div className="flex items-center gap-4">
           {isApiKeyMissing && (
             <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
               CONFIG NEEDED
             </span>
           )}
           <div className="text-[10px] font-mono text-neutral-500 hidden sm:block uppercase tracking-widest">
             AI Engine: Gemini 2.5
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        
        {/* Step: Intro */}
        {step === 'intro' && (
          <div className="text-center max-w-2xl animate-fade-in-up">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] mb-6 border border-white/10 uppercase">
              Spring 2025 Collection
            </span>
            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              SEE<br />THE FUTURE
            </h2>
            <p className="text-neutral-400 text-lg mb-12 max-w-sm mx-auto font-light leading-relaxed">
              Virtual eyewear precision powered by Google Gemini AI. Instant fit, perfect style.
            </p>
            <button
              onClick={() => setStep('camera')}
              className="group relative inline-flex items-center justify-center h-16 px-12 text-lg font-bold text-black bg-white rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              Start Experience
              <svg className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Step: Camera */}
        {step === 'camera' && (
          <div className="w-full h-full max-h-[80vh] flex flex-col items-center">
            <div className="w-full max-w-2xl aspect-[3/4] md:aspect-video">
              <Camera onCapture={handleCapture} onCancel={() => setStep('intro')} />
            </div>
            <p className="mt-6 text-neutral-500 text-xs tracking-widest uppercase">
              Position your face within the frame
            </p>
          </div>
        )}

        {/* Step: Select */}
        {step === 'select' && capturedImage && (
          <div className="w-full flex flex-col items-center animate-fade-in">
             <div className="mb-8 relative group">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-neutral-900 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                   <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => setStep('camera')} 
                  className="absolute -bottom-2 right-0 bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-200 transition-colors"
                  title="Retake photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </button>
             </div>
             
             <SunglassesSelector selectedId={selectedStyle?.id || null} onSelect={handleSelectStyle} />

             {error && (
                <div className="mt-8 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-200 text-sm max-w-md text-center">
                  <p className="font-bold mb-1">Notice</p>
                  <p className="opacity-80">{error}</p>
                </div>
             )}

             <div className="mt-12 w-full max-w-md flex flex-col items-center">
               <button
                 disabled={!selectedStyle || (rateLimitedUntil && Date.now() < rateLimitedUntil)}
                 onClick={handleGenerate}
                 className={`
                   w-full py-5 rounded-full font-black text-xl tracking-[0.1em] uppercase transition-all duration-500
                   ${selectedStyle && !(rateLimitedUntil && Date.now() < rateLimitedUntil)
                     ? 'bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95' 
                     : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'}
                 `}
               >
                 {selectedStyle ? `TRY ON ${selectedStyle.name}` : 'SELECT A STYLE'}
               </button>
             </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="relative w-40 h-40 mb-12">
               <div className="absolute inset-0 border-[1px] border-white/10 rounded-full"></div>
               <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
               <div className="absolute inset-4 border-r-2 border-white/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
               <div className="absolute inset-8 border-b-2 border-white/20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tighter">CRAFTING YOUR LOOK</h3>
            <div className="space-y-2">
              <p className="text-neutral-500 text-sm uppercase tracking-[0.3em] animate-pulse">Analyzing Facial Geometry</p>
              <p className="text-neutral-700 text-[10px] uppercase tracking-[0.2em]">Integrating Hardware Shadows</p>
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && resultImage && selectedStyle && (
          <div className="w-full flex flex-col items-center animate-fade-in max-w-4xl">
             <div className="relative w-full aspect-[4/5] md:aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)] border border-white/10 group">
                <img src={resultImage} alt="Try On Result" className="w-full h-full object-cover" />
                
                {/* Overlay Details */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                   <div className="bg-black/60 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold tracking-widest uppercase">{selectedStyle.name} Fitted</span>
                   </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl max-w-[200px]">
                    <p className="text-white text-xs font-bold mb-1 uppercase tracking-tight">AI Render Engine</p>
                    <p className="text-neutral-400 text-[9px] leading-tight">Physics-accurate lighting and reflection mapping generated in real-time.</p>
                  </div>
                  <button 
                    onClick={() => window.open(resultImage, '_blank')}
                    className="bg-white text-black p-4 rounded-2xl hover:bg-neutral-200 transition-all active:scale-95 shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </div>
             </div>

             <div className="mt-12 flex flex-wrap justify-center gap-4 w-full">
               <button 
                 onClick={() => setStep('select')} 
                 className="flex-1 min-w-[160px] px-8 py-5 rounded-2xl border border-neutral-800 hover:bg-neutral-900 transition-all text-white text-xs font-bold uppercase tracking-widest active:scale-95"
               >
                 Change Style
               </button>
               <button 
                 onClick={() => setStep('camera')} 
                 className="flex-1 min-w-[160px] px-8 py-5 rounded-2xl border border-neutral-800 hover:bg-neutral-900 transition-all text-white text-xs font-bold uppercase tracking-widest active:scale-95"
               >
                 New Photo
               </button>
               <button 
                 onClick={resetApp} 
                 className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white text-black hover:bg-neutral-200 transition-all font-black text-xs uppercase tracking-[0.2em] active:scale-95 shadow-xl"
               >
                 Finish Experience
               </button>
             </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 text-neutral-600 text-[9px] uppercase tracking-[0.2em]">
        <p>&copy; {new Date().getFullYear()} Lumina Specs Design Lab.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Collection</a>
        </div>
      </footer>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;