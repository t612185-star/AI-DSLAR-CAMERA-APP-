import React, { useState } from 'react';
import { Camera } from './components/Camera';
import { Editor } from './components/Editor';
import { Gallery } from './components/Gallery';
import { AppMode, CapturedImage } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.CAMERA);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);

  const handleCapture = (dataUrl: string) => {
    const newImage: CapturedImage = {
      id: crypto.randomUUID(),
      dataUrl,
      timestamp: Date.now()
    };
    setImages(prev => [newImage, ...prev]);
    setSelectedImage(newImage);
    setMode(AppMode.EDITOR); // Immediate edit after capture
  };

  const handleSaveEdit = (editedImage: CapturedImage) => {
    setImages(prev => [editedImage, ...prev]);
    setMode(AppMode.GALLERY);
    // Optional: could keep them in editor or go to gallery
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="w-full h-[100dvh] bg-black text-white max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {mode === AppMode.CAMERA && (
        <Camera 
          onCapture={handleCapture} 
          onOpenGallery={() => setMode(AppMode.GALLERY)} 
        />
      )}

      {mode === AppMode.EDITOR && selectedImage && (
        <Editor 
          image={selectedImage}
          onBack={() => setMode(AppMode.CAMERA)} // Or gallery if it came from there
          onSave={handleSaveEdit}
        />
      )}

      {mode === AppMode.GALLERY && (
        <Gallery 
          images={images}
          onBack={() => setMode(AppMode.CAMERA)}
          onSelectImage={(img) => {
            setSelectedImage(img);
            setMode(AppMode.EDITOR);
          }}
          onDeleteImage={deleteImage}
        />
      )}
    </div>
  );
}

export default App;