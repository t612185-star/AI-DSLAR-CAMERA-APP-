import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera as CameraIcon, Settings2, RefreshCw, Zap, Image as ImageIcon, Sparkles } from 'lucide-react';
import { FilterType } from '../types';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onOpenGallery: () => void;
}

const FILTERS: Record<FilterType, string> = {
  [FilterType.NONE]: '',
  [FilterType.VIVID]: 'saturate(1.5) contrast(1.1)',
  [FilterType.MONO]: 'grayscale(100%) contrast(1.2)',
  [FilterType.WARM]: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)',
  [FilterType.COOL]: 'saturate(1.1) hue-rotate(10deg) brightness(1.1)',
  [FilterType.CYBER]: 'hue-rotate(180deg) saturate(2) contrast(1.2)',
};

export const Camera: React.FC<CameraProps> = ({ onCapture, onOpenGallery }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.NONE);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Unable to access camera. Please ensure permissions are granted.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply current CSS filter to context if desired, or capture raw and process later.
        // For a true "WYSIWYG" experience, we'll try to replicate the CSS filter on the canvas context.
        // However, CSS filters on canvas context are experimental. 
        // We will capture RAW for highest quality AI processing, 
        // but if the user wants the filter burned in, we'd need a library. 
        // Strategy: Capture raw image. We send RAW to AI for best results.
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror if front camera (optional, usually front cams mirror preview)
        if (facingMode === 'environment') {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for back camera
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      {/* Viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
            {cameraError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            style={{ filter: FILTERS[activeFilter] }}
          />
        )}
        
        {/* Overlays / Heads Up Display */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-green-400 border border-green-500/30 flex items-center gap-2">
            <span className="animate-pulse">●</span> REC
            <span className="text-white/60">|</span>
            AI: READY
          </div>
          <button onClick={toggleCamera} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform">
             <RefreshCw size={20} />
          </button>
        </div>

        {/* DSLR Grid (Optional Visual) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-1/3 border-b border-white/50 absolute top-0"></div>
            <div className="w-full h-1/3 border-b border-white/50 absolute top-1/3"></div>
            <div className="h-full w-1/3 border-r border-white/50 absolute left-0"></div>
            <div className="h-full w-1/3 border-r border-white/50 absolute left-1/3"></div>
        </div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="h-48 bg-black/80 backdrop-blur-lg border-t border-white/10 flex flex-col pb-6">
        
        {/* Filter Scroll */}
        <div className="flex overflow-x-auto gap-4 p-4 no-scrollbar items-center">
          {Object.entries(FilterType).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                ${activeFilter === value 
                  ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                  : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Main Actions */}
        <div className="flex justify-around items-center px-8 mt-2">
          <button 
            onClick={onOpenGallery}
            className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
          >
            <ImageIcon size={24} />
          </button>

          <button
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
            aria-label="Capture Photo"
          >
             <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform duration-100" />
          </button>

          <button 
            className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 opacity-50 cursor-not-allowed"
            title="Pro Settings (Coming Soon)"
          >
            <Settings2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};