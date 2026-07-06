import React, { useCallback, useState, useRef } from "react";
import { Video, Upload, X, Lock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { hasFreeVideoTrial, consumeFreeVideoTrial } from "@/lib/usePlanLimits";

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
  const [freeTrialUsed, setFreeTrialUsed] = useState(!hasFreeVideoTrial());
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("video/")) return;
      setDurationError("");

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 100) {
        setDurationError(`Vídeo muito grande (${sizeMB.toFixed(0)}MB). O limite é 100MB.`);
        return;
      }

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
      videoEl.onerror = () => {
        setDurationError("Não foi possível ler o vídeo. Tente outro arquivo.");
        setChecking(false);
      };
      videoEl.src = URL.createObjectURL(file);
    },
    [onVideoSelected]
  );

  const handleUseFreeTrial = (file) => {
    consumeFreeVideoTrial();
    setFreeTrialUsed(true);
    validateAndSet(file);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndSet(e.dataTransfer.files[0]);
    },
    [validateAndSet]
  );

  const handleInputChange = (e) => validateAndSet(e.target.files[0]);
  const handleFreeTrialInput = (e) => handleUseFreeTrial(e.target.files[0]);

  // ─── Card BLOQUEADO sem trial ────────────────────────────────────────────────
  if (!canUseVideo && freeTrialUsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 sm:p-10 text-center overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.04] to-transparent pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative flex flex-col items-center gap-3">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-400/20 flex items-center justify-center"
          >
            <Lock className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <div>
            <p className="text-base font-semibold text-foreground flex items-center justify-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              Análise de vídeo
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Disponível a partir do plano <strong className="text-foreground">Intermediário</strong>.
              Seu teste gratuito já foi utilizado.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
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

  // ─── Card BLOQUEADO com trial disponível ─────────────────────────────────────
  if (!canUseVideo && !freeTrialUsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mt-4 rounded-2xl border-2 border-dashed border-yellow-400/40 bg-card/50"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/[0.05] to-transparent pointer-events-none"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        />

        {/* Badge teste gratuito */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <motion.span
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-yellow-400/20"
          >
            <Sparkles className="w-3 h-3" />
            1 teste gratuito disponível!
          </motion.span>
        </div>

        <div className="relative flex flex-col items-center gap-4 p-8 sm:p-10 pt-10 text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-400/30 flex items-center justify-center"
          >
            <Video className="w-6 h-6 text-yellow-400" />
          </motion.div>

          <div>
            <p className="text-base font-semibold text-foreground">Análise de vídeo</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Experimente gratuitamente <strong className="text-yellow-400">1 vez</strong>.
              Para análises ilimitadas, assine o plano Intermediário.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="video/*"
                onChange={handleFreeTrialInput}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-sm"
              >
                <Upload className="w-4 h-4" />
                Testar gratuitamente
              </motion.div>
            </label>
            <Link to="/Premium" className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-xl border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10">
                Assinar plano
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Card LIBERADO ────────────────────────────────────────────────────────────
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
                  transition={checking
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                  }
                  className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                >
                  {checking
                    ? <Loader2 className="w-6 h-6 text-primary" />
                    : <Video className="w-6 h-6 text-primary" />
                  }
                </motion.div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {checking ? "Verificando vídeo..." : "Arraste um vídeo aqui"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    até 1 minuto • máx 100MB • MP4, MOV, WEBM
                  </p>
                </div>
                {!checking && (
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 mt-1" type="button" asChild>
                    <span><Upload className="w-4 h-4" />Selecionar vídeo</span>
                  </Button>
                )}
              </div>
            </label>
            {durationError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 mt-2 text-center"
              >
                {durationError}
              </motion.p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
