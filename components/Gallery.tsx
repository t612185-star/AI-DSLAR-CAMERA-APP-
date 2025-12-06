import React from 'react';
import { ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { CapturedImage } from '../types';

interface GalleryProps {
  images: CapturedImage[];
  onBack: () => void;
  onSelectImage: (image: CapturedImage) => void;
  onDeleteImage: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onBack, onSelectImage, onDeleteImage }) => {
  return (
    <div className="h-full w-full bg-black flex flex-col text-white">
      <div className="h-16 flex items-center px-4 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full mr-4">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-xl">Gallery ({images.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
            <p>No photos yet.</p>
            <button onClick={onBack} className="text-yellow-500 underline">Start Capturing</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square group overflow-hidden bg-zinc-900 rounded-sm">
                <img 
                  src={img.dataUrl} 
                  alt="Captured" 
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => onSelectImage(img)}
                />
                {img.isEdited && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full shadow-lg" title="Edited with AI" />
                )}
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 pointer-events-none">
                     <Edit2 className="text-white pointer-events-auto cursor-pointer" size={20} onClick={() => onSelectImage(img)} />
                     <Trash2 className="text-red-500 pointer-events-auto cursor-pointer" size={20} onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};