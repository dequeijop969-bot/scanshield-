import React, { useCallback, useState, useRef } from "react";
import { Video, Upload, X, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function VideoUploadCard({
  onVideoSelected,
  videoPreview,
  onClear,
  isAnalyzing,
  canUseVideo,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [durationError, setDurationError] = useState("");
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("video/")) return;
      setDurationError("");
      setChecking(true);

      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src);
        if (videoEl.duration > 60) {
          setDurationError("O vídeo precisa ter no máximo 1 minuto.");
          setChecking(false);
          return;
        }
        setChecking(false);
        onVideoSelected(file);
      };
      videoEl.src = URL.createObjectURL(file);
    },
    [onVideoSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (!canUseVideo) return;
      validateAndSet(e.dataTransfer.files[0]);
    },
    [validateAndSet, canUseVideo]
  );

  const handleInputChange = (e) => validateAndSet(e.target.files[0]);

  // Card bloqueado — exibido para quem não tem plano Intermediário ou PRO
  if (!canUseVideo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 sm:p-10 text-center overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.03] to-transparent pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col items-center gap-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-400/20 flex items-center justify-center"
          >
            <Lock className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <p className="text-base font-semibold text-foreground flex items-center justify-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              Análise de vídeo
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Disponível a partir do plano <strong className="text-foreground">Intermediário</strong>.
              Envie vídeos de até 1 minuto para análise.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link to="/Premium">
              <Button className="mt-1 bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-xl px-5">
                Desbloquear
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!videoPreview ? (
          <motion.div key="uploader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              } p-8 sm:p-10 text-center`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleInputChange}
                className="hidden"
                disabled={isAnalyzing || checking}
              />
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={checking ? { rotate: 360 } : { y: [0, -3, 0] }}
                  transition={
                    checking
                      ? { duration: 1, repeat: Infinity, ease: "linear" }
                      : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                  }
                  className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                >
                  {checking ? (
                    <Loader2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Video className="w-6 h-6 text-primary" />
                  )}
                </motion.div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {checking ? "Verificando vídeo..." : "Arraste um vídeo aqui"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    até 1 minuto • MP4, MOV, WEBM
                  </p>
                </div>
                {!checking && (
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 mt-1" type="button" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Selecionar vídeo
                    </span>
                  </Button>
                )}
              </div>
            </label>
            {durationError && (
              <p className="text-sm text-red-400 mt-2 text-center">{durationError}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-border bg-card"
          >
            <video src={videoPreview} controls className="w-full max-h-[400px] bg-black/20" />
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
