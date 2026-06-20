import React, { useCallback, useState } from "react";
import { Upload, Image, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageUploader({ onImageSelected, imagePreview, onClear, isAnalyzing }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith("image/")) {
      onImageSelected(file);
    }
  }, [onImageSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!imagePreview ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              } p-8 sm:p-12 text-center`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                disabled={isAnalyzing}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Arraste uma captura de tela aqui
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou clique para selecionar • PNG, JPG, WEBP
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Button variant="outline" size="sm" className="rounded-xl gap-2" type="button" asChild>
                    <span>
                      <Image className="w-4 h-4" />
                      Galeria
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 sm:hidden" type="button" asChild>
                    <span>
                      <Camera className="w-4 h-4" />
                      Câmera
                    </span>
                  </Button>
                </div>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-border bg-card"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-[400px] object-contain bg-black/20"
            />
            {!isAnalyzing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-scan opacity-70" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}