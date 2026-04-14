import React, { useCallback, useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, type Language } from '../translations';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  lang: Language;
}

export function ImageUploader({ onImageSelected, lang }: ImageUploaderProps) {
  const t = translations[lang];
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t.alertNotImage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // result is a data URL: data:image/jpeg;base64,...
      const [prefix, base64] = result.split(',');
      const mimeType = prefix.split(':')[1].split(';')[0];
      onImageSelected(base64, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-colors duration-300 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-blue-100 p-4 rounded-full mb-6">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-950 mb-2">
            {t.uploadTitle}
          </h3>
          <p className="text-blue-600/70 mb-8 max-w-sm">
            {t.uploadSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
            >
              <ImageIcon className="w-5 h-5" />
              {t.chooseImage}
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.capture = "environment";
                  fileInputRef.current.click();
                  // Reset capture after a short delay so normal upload still works next time
                  setTimeout(() => {
                    if (fileInputRef.current) fileInputRef.current.capture = "";
                  }, 1000);
                }
              }}
              className="flex items-center justify-center gap-2 bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              {t.takePhoto}
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*"
          className="hidden"
        />
      </motion.div>
    </div>
  );
}
