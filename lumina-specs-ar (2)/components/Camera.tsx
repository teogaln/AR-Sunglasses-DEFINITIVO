import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const startCamera = async () => {
    try {
      setLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err) {
      setError('Unable to access camera. Please ensure permissions are granted.');
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // We capture exactly what the sensor sees for maximum fidelity
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  // Handle file upload as fallback
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px] bg-black relative rounded-xl overflow-hidden border border-neutral-800">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-neutral-900">
          <p className="text-neutral-400 animate-pulse">Initializing Camera...</p>
        </div>
      )}

      {error ? (
        <div className="text-red-400 p-6 text-center z-20">
          <p className="mb-4">{error}</p>
          <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-neutral-200 transition">
            Upload Photo Instead
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => setLoading(false)}
          />

          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-10">
            <button
              onClick={onCancel}
              className="text-white bg-neutral-900/50 backdrop-blur-md px-6 py-3 rounded-full hover:bg-neutral-800/80 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCapture}
              className="bg-white text-black rounded-full p-1 border-4 border-transparent hover:border-neutral-300 transition-all duration-200 shadow-lg"
              aria-label="Capture Photo"
            >
               <div className="w-16 h-16 bg-white rounded-full border-4 border-black"></div>
            </button>
            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="absolute top-4 right-4 z-10">
             <label className="cursor-pointer bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm hover:bg-black/60 transition flex items-center gap-2 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Upload
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
          </div>
        </>
      )}
    </div>
  );
};

export default Camera;