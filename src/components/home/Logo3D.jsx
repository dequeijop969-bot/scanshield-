import React, { useEffect, useRef } from "react";

export default function Logo3D({ src }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    rotY: 0, rotX: 0.15,
    targetY: 0, targetX: 0.15,
    mouseX: 0, mouseY: 0,
    isHovered: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.offsetWidth;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const s = stateRef.current;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Smooth follow
      s.rotY += (s.targetY - s.rotY) * 0.06;
      s.rotX += (s.targetX - s.rotX) * 0.06;

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.38;

      // Shadow
      ctx.save();
      ctx.translate(cx, cy + r * 0.9);
      ctx.scale(1, 0.25);
      const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.8);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3D card
      ctx.save();
      ctx.translate(cx, cy);

      const tiltX = s.rotX * 18;
      const tiltY = s.rotY * 18;

      // Perspective shear
      ctx.transform(
        1, Math.sin(tiltX * 0.015),
        -Math.sin(tiltY * 0.015), 1,
        0, 0
      );

      // Glow ring
      const glowGrad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.1);
      glowGrad.addColorStop(0, "rgba(255,255,255,0.04)");
      glowGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Card background
      const cardSize = r * 1.55;
      const cardRad = cardSize * 0.12;
      ctx.save();
      ctx.shadowColor = "rgba(255,255,255,0.08)";
      ctx.shadowBlur = 30;
      roundRect(ctx, -cardSize / 2, -cardSize / 2, cardSize, cardSize, cardRad);
      ctx.fillStyle = "rgba(18,18,18,0.92)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Image
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        roundRect(ctx, -cardSize / 2, -cardSize / 2, cardSize, cardSize, cardRad);
        ctx.clip();
        ctx.drawImage(img, -cardSize / 2, -cardSize / 2, cardSize, cardSize);
        ctx.restore();
      }

      // Shine overlay
      ctx.save();
      roundRect(ctx, -cardSize / 2, -cardSize / 2, cardSize, cardSize, cardRad);
      ctx.clip();
      const shineX = (tiltY / 18) * cardSize * 0.5;
      const shineY = (tiltX / 18) * cardSize * 0.5;
      const shine = ctx.createLinearGradient(
        -cardSize / 2 + shineX, -cardSize / 2 + shineY,
        cardSize / 2 + shineX, cardSize / 2 + shineY
      );
      shine.addColorStop(0, "rgba(255,255,255,0)");
      shine.addColorStop(0.4, "rgba(255,255,255,0.06)");
      shine.addColorStop(0.5, "rgba(255,255,255,0.12)");
      shine.addColorStop(0.6, "rgba(255,255,255,0.06)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.fillRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize);
      ctx.restore();

      ctx.restore();

      // Floating particles
      const t = Date.now() / 1000;
      const particles = [
        { x: cx - r * 1.1, y: cy - r * 0.6, delay: 0 },
        { x: cx + r * 1.15, y: cy - r * 0.3, delay: 1.2 },
        { x: cx - r * 0.8, y: cy + r * 0.9, delay: 0.6 },
        { x: cx + r * 0.9, y: cy + r * 0.7, delay: 1.8 },
      ];
      particles.forEach((p) => {
        const py = p.y + Math.sin(t * 0.8 + p.delay) * 6;
        const alpha = 0.3 + Math.sin(t * 0.6 + p.delay) * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      // Idle float
      if (!s.isHovered) {
        s.targetY = Math.sin(t * 0.5) * 0.4;
        s.targetX = 0.15 + Math.cos(t * 0.3) * 0.15;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    img.onload = () => { animRef.current = requestAnimationFrame(draw); };
    if (img.complete) animRef.current = requestAnimationFrame(draw);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      s.targetY = mx * 1.2;
      s.targetX = -my * 0.8 + 0.15;
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
