import React, { useEffect, useRef } from "react";

export default function Logo3D({ src }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    rotY: 0, rotX: 0.15,
    targetY: 0, targetX: 0.15,
    isHovered: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const s = stateRef.current;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      s.rotY += (s.targetY - s.rotY) * 0.06;
      s.rotX += (s.targetX - s.rotX) * 0.06;

      const cx = size / 2;
      const cy = size / 2;

      // Tamanho do card — quadrado, ocupa 72% do canvas
      const cardSize = size * 0.72;
      const borderRadius = cardSize * 0.18; // cantos bem arredondados tipo app
      const borderWidth = 5; // borda mais grossa

      const tiltX = s.rotX * 16;
      const tiltY = s.rotY * 16;

      // Sombra projetada
      ctx.save();
      ctx.translate(cx, cy + cardSize * 0.08);
      ctx.scale(1, 0.22);
      const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cardSize * 0.55);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.45)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, cardSize * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Aplicar perspectiva
      ctx.save();
      ctx.translate(cx, cy);
      ctx.transform(
        1, Math.sin(tiltX * 0.014),
        -Math.sin(tiltY * 0.014), 1,
        0, 0
      );

      const x = -cardSize / 2;
      const y = -cardSize / 2;

      // ── Imagem (dentro do card com clip) ──────────────
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        roundRect(ctx, x, y, cardSize, cardSize, borderRadius);
        ctx.clip();

        // Calcular proporção correta (object-fit: cover)
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.max(cardSize / iw, cardSize / ih);
        const drawW = iw * scale;
        const drawH = ih * scale;
        const drawX = x + (cardSize - drawW) / 2;
        const drawY = y + (cardSize - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else {
        // Placeholder enquanto carrega
        roundRect(ctx, x, y, cardSize, cardSize, borderRadius);
        ctx.fillStyle = "rgba(30,30,30,0.95)";
        ctx.fill();
      }

      // ── Borda grossa tipo app ─────────────────────────
      ctx.save();
      roundRect(ctx, x, y, cardSize, cardSize, borderRadius);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = borderWidth;
      ctx.stroke();
      // Borda interna sutil para dar profundidade
      roundRect(ctx, x + borderWidth, y + borderWidth, cardSize - borderWidth * 2, cardSize - borderWidth * 2, borderRadius - borderWidth * 0.5);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── Shine (reflexo de luz) ─────────────────────────
      ctx.save();
      roundRect(ctx, x, y, cardSize, cardSize, borderRadius);
      ctx.clip();
      const shineX = (tiltY / 16) * cardSize * 0.5;
      const shineY = (tiltX / 16) * cardSize * 0.5;
      const shine = ctx.createLinearGradient(
        x + shineX, y + shineY,
        x + cardSize + shineX, y + cardSize + shineY
      );
      shine.addColorStop(0, "rgba(255,255,255,0)");
      shine.addColorStop(0.35, "rgba(255,255,255,0.04)");
      shine.addColorStop(0.5, "rgba(255,255,255,0.10)");
      shine.addColorStop(0.65, "rgba(255,255,255,0.04)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.fillRect(x, y, cardSize, cardSize);
      ctx.restore();

      ctx.restore(); // fim da perspectiva

      // ── Partículas flutuantes ─────────────────────────
      const t = Date.now() / 1000;
      const particles = [
        { x: cx - cardSize * 0.62, y: cy - cardSize * 0.38, d: 0 },
        { x: cx + cardSize * 0.65, y: cy - cardSize * 0.22, d: 1.2 },
        { x: cx - cardSize * 0.5, y: cy + cardSize * 0.52, d: 0.6 },
        { x: cx + cardSize * 0.58, y: cy + cardSize * 0.45, d: 1.8 },
        { x: cx + cardSize * 0.1, y: cy - cardSize * 0.62, d: 0.9 },
      ];
      particles.forEach((p) => {
        const py = p.y + Math.sin(t * 0.8 + p.d) * 5;
        const alpha = 0.25 + Math.sin(t * 0.6 + p.d) * 0.18;
        ctx.beginPath();
        ctx.arc(p.x, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      // Idle float (quando não está com hover)
      if (!s.isHovered) {
        s.targetY = Math.sin(t * 0.45) * 0.38;
        s.targetX = 0.15 + Math.cos(t * 0.28) * 0.12;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    img.onload = () => { animRef.current = requestAnimationFrame(draw); };
    if (img.complete && img.naturalWidth > 0) animRef.current = requestAnimationFrame(draw);
    else if (!img.onload) animRef.current = requestAnimationFrame(draw);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      s.targetY = mx * 1.1;
      s.targetX = -my * 0.75 + 0.1;
      s.isHovered = true;
    };
    const onLeave = () => { s.isHovered = false; };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", cursor: "pointer" }}
    />
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
