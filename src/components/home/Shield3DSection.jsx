import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { BrainCircuit, LockKeyhole, Zap, Globe } from "lucide-react";

/* ---------- 3D: ícone da logo ScanShield (estrela X facetada) ---------- */

/**
 * Cria uma das 4 pontas da estrela como um espeto facetado
 * (pirâmide fina e alongada), igual às pontas afiadas da logo.
 */
function StarSpike({ rotationZ }) {
  const geometry = useMemo(() => {
    const length = 1.7; // comprimento da ponta
    const halfWidth = 0.34; // largura na base (perto do centro)
    const halfDepth = 0.16; // espessura 3D

    const vertices = new Float32Array([
      // ponta (tip)
      length, 0, 0,
      // base: losango em torno da origem
      0, halfWidth, 0,
      0, 0, halfDepth,
      0, -halfWidth, 0,
      0, 0, -halfDepth,
    ]);

    const indices = [
      // 4 faces laterais até a ponta
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 1,
      // fechamento da base
      1, 4, 2,
      2, 4, 3,
    ];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[0, 0, rotationZ]}>
      <meshStandardMaterial
        color="#f5f5f5"
        metalness={0.55}
        roughness={0.25}
        flatShading
        envMapIntensity={1.1}
      />
    </mesh>
  );
}

function LogoStar() {
  const group = useRef();

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.5;
  });

  // 4 pontas em diagonal, formando o "X" da logo
  const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

  return (
    <group ref={group}>
      {angles.map((a) => (
        <StarSpike key={a} rotationZ={a} />
      ))}
      {/* Núcleo central pequeno unindo as pontas */}
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#f5f5f5"
          metalness={0.55}
          roughness={0.25}
          flatShading
          envMapIntensity={1.1}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 4]} intensity={1.2} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} color="#34d399" />

      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <LogoStar />
      </Float>

      <Environment preset="studio" />
    </>
  );
}

/* ---------- Seção ---------- */

const infoItems = [
  {
    icon: BrainCircuit,
    title: "IA em constante evolução",
    desc: "O modelo é atualizado com os golpes mais recentes que circulam no Brasil — quanto mais analisa, mais inteligente fica.",
  },
  {
    icon: LockKeyhole,
    title: "Privacidade em primeiro lugar",
    desc: "Suas imagens e vídeos são processados com criptografia e nunca são compartilhados com terceiros.",
  },
  {
    icon: Zap,
    title: "Resposta em segundos",
    desc: "Da suspeita ao veredito em menos de 10 segundos, com nível de risco e recomendações práticas.",
  },
  {
    icon: Globe,
    title: "Feito para o Brasil",
    desc: "Treinado com padrões de golpes brasileiros: Pix, WhatsApp, boletos falsos, falsas lojas e phishing.",
  },
];

export default function Shield3DSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Grid de fundo sutil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-md mx-auto rounded-3xl bg-card border border-border overflow-hidden">
              {/* Glow atrás do canvas */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(52,211,153,0.08),transparent_60%)]"
              />
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                ScanShield Core
              </div>
              <div className="absolute bottom-4 right-4 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                Render 3D · ao vivo
              </div>

              <Canvas
                camera={{ position: [0, 0.4, 5.6], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
                className="!absolute inset-0"
              >
                <Suspense fallback={null}>
                  <Scene />
                </Suspense>
              </Canvas>
            </div>
          </motion.div>

          {/* Informações */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70 mb-5">
                Por dentro da tecnologia
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-foreground mb-4 text-balance">
                Um escudo que trabalha
                <br />
                <span className="text-emerald-400">o tempo todo por você.</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mb-10 text-pretty leading-relaxed">
                Por trás de cada análise existe um motor de IA dedicado a um único
                objetivo: impedir que você caia em um golpe.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {infoItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-foreground/5 border border-border flex items-center justify-center mb-3.5">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-bold tracking-tight text-foreground text-sm mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
