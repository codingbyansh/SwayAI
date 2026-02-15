import React, { useState, useRef } from 'react';
import { Image as ImageIcon, MessageSquare, X, UploadCloud } from 'lucide-react';
import { InputMode } from '../types';

interface InputSectionProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  imageInput: string | null;
  setImageInput: (image: string | null) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  mode,
  setMode,
  textInput,
  setTextInput,
  imageInput,
  setImageInput
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Please upload an image under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageInput(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setMode(InputMode.TEXT)}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
            mode === InputMode.TEXT
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={16} className="mr-2" />
          Paste Text
        </button>
        <button
          onClick={() => setMode(InputMode.IMAGE)}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
            mode === InputMode.IMAGE
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon size={16} className="mr-2" />
          Upload Chat
        </button>
      </div>

      {/* Input Area */}
      <div className="relative min-h-[160px]">
        {mode === InputMode.TEXT ? (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste the last message you received here..."
            className="w-full h-40 p-4 rounded-2xl border-2 border-gray-100 bg-white resize-none focus:outline-none focus:border-sway-300 focus:ring-0 transition-colors placeholder-gray-400 text-gray-700 text-lg"
          />
        ) : (
          <div
            className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden bg-white ${
              dragActive ? 'border-sway-500 bg-sway-50' : 'border-gray-200 hover:border-sway-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !imageInput && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {imageInput ? (
              <div className="w-full h-full relative group">
                <img 
                  src={imageInput} 
                  alt="Uploaded chat" 
                  className="w-full h-full object-cover opacity-90" 
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageInput(null);
                    if(fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-sway-50 text-sway-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-medium text-gray-700">Tap to upload screenshot</p>
                <p className="text-xs text-gray-400 mt-1">or drag and drop here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;