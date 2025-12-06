import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Palette, Download, Share2, Aperture, Loader2 } from 'lucide-react';
import { CapturedImage, ProcessingState } from '../types';
import { analyzeImageScene, editImageWithGemini } from '../services/geminiService';

interface EditorProps {
  image: CapturedImage;
  onBack: () => void;
  onSave: (editedImage: CapturedImage) => void;
}

const QUICK_ACTIONS = [
  { id: 'bokeh', label: 'AI Bokeh', prompt: 'Apply a strong DSLR background blur (bokeh) effect to the background, keeping the main subject sharp and in focus. Professional photography style.' },
  { id: 'hdr', label: 'HDR Boost', prompt: 'Enhance this image with high dynamic range (HDR) photography style, improving contrast, vibrance, and detail while keeping it realistic.' },
  { id: 'vintage', label: 'Vintage', prompt: 'Apply a vintage 1980s film camera look with grain and warm color grading.' },
  { id: 'neon', label: 'Neon Cyber', prompt: 'Transform this image into a cyberpunk style with neon lights, high contrast, and cool blue/pink tones.' },
];

export const Editor: React.FC<EditorProps> = ({ image, onBack, onSave }) => {
  const [currentImageSrc, setCurrentImageSrc] = useState(image.dataUrl);
  const [description, setDescription] = useState<string>('Analyzing scene...');
  const [processing, setProcessing] = useState<ProcessingState>({ isProcessing: false, statusMessage: '' });
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'dslr' | 'color'>('dslr');

  useEffect(() => {
    // Auto-analyze scene on load
    const analyze = async () => {
      if (image.aiDescription) {
        setDescription(image.aiDescription);
        return;
      }
      try {
        const desc = await analyzeImageScene(image.dataUrl);
        setDescription(desc);
      } catch (e) {
        setDescription("Scene analysis unavailable.");
      }
    };
    analyze();
  }, [image]);

  const handleAIEdit = async (prompt: string, loadingMsg: string) => {
    if (processing.isProcessing) return;
    setProcessing({ isProcessing: true, statusMessage: loadingMsg });
    
    try {
      const newImageDataUrl = await editImageWithGemini(currentImageSrc, prompt);
      setCurrentImageSrc(newImageDataUrl);
      // We don't automatically save to gallery, user must click save.
    } catch (error) {
      alert("AI Processing Failed. Please try again.");
    } finally {
      setProcessing({ isProcessing: false, statusMessage: '' });
    }
  };

  const handleSave = () => {
    const newImage: CapturedImage = {
      ...image,
      id: crypto.randomUUID(),
      dataUrl: currentImageSrc,
      timestamp: Date.now(),
      isEdited: true,
      originalId: image.id
    };
    onSave(newImage);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImageSrc;
    link.download = `ai-dslr-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col text-white">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-zinc-900">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg tracking-wide">AI Studio</h2>
        <button onClick={handleSave} className="text-yellow-500 font-bold text-sm px-3 py-1 rounded hover:bg-yellow-500/10">
          SAVE
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden group">
        <img 
          src={currentImageSrc} 
          alt="Editing" 
          className="max-h-full max-w-full object-contain shadow-2xl"
        />
        
        {processing.isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <Loader2 className="animate-spin text-yellow-500 mb-4" size={48} />
            <p className="text-yellow-500 font-mono animate-pulse">{processing.statusMessage}</p>
          </div>
        )}

        {/* Scene Info Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-start gap-2">
                <Aperture size={16} className="text-yellow-500 mt-1 shrink-0" />
                <p className="text-xs text-white/90 leading-relaxed">{description}</p>
            </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="bg-zinc-900 border-t border-white/10 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setActiveTab('dslr')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'dslr' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}
          >
            <Wand2 size={16} /> DSLR FX
          </button>
          <button 
             onClick={() => setActiveTab('color')}
             className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'color' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}
          >
            <Palette size={16} /> COLOR CHANGE
          </button>
        </div>

        {/* Content */}
        <div className="h-48 p-4">
          {activeTab === 'dslr' && (
            <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleAIEdit(action.prompt, `Applying ${action.label}...`)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="text-white font-medium text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'color' && (
            <div className="flex flex-col gap-3 h-full">
              <p className="text-xs text-gray-400 mb-1">Describe what colors to change (e.g., "Change the red car to blue" or "Make the sky purple")</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g. Turn red shirt to blue..."
                  className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                />
                <button 
                  onClick={() => handleAIEdit(customPrompt, 'Changing colors...')}
                  disabled={!customPrompt.trim()}
                  className="bg-yellow-600 disabled:opacity-50 text-white px-4 rounded-lg font-bold text-sm"
                >
                  GO
                </button>
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                 <button onClick={() => setCustomPrompt('Change all red objects to blue')} className="whitespace-nowrap bg-zinc-800 px-3 py-1 rounded-full text-xs hover:bg-zinc-700">Red → Blue</button>
                 <button onClick={() => setCustomPrompt('Make the background black and white, keep subject in color')} className="whitespace-nowrap bg-zinc-800 px-3 py-1 rounded-full text-xs hover:bg-zinc-700">B&W Background</button>
                 <button onClick={() => setCustomPrompt('Change the sky to a sunset orange')} className="whitespace-nowrap bg-zinc-800 px-3 py-1 rounded-full text-xs hover:bg-zinc-700">Sunset Sky</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
       {/* Footer Actions */}
       <div className="h-14 bg-zinc-950 flex items-center justify-between px-6 border-t border-white/10">
          <button onClick={downloadImage} className="text-white/60 hover:text-white flex flex-col items-center text-[10px] gap-1">
             <Download size={20} /> Download
          </button>
          <div className="text-xs text-gray-500 font-mono">Gemini 2.5 AI Powered</div>
          <button className="text-white/60 hover:text-white flex flex-col items-center text-[10px] gap-1">
             <Share2 size={20} /> Share
          </button>
       </div>
    </div>
  );
};