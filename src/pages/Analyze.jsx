import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ScanSearch, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import ImageUploader from "@/components/analyze/ImageUploader";
import AnalysisTypeSelector from "@/components/analyze/AnalysisTypeSelector";
import ScanningOverlay from "@/components/analyze/ScanningOverlay";
import LinkAnalyzer from "@/components/analyze/LinkAnalyzer";
import { usePlanLimits } from "@/lib/usePlanLimits";

export default function Analyze() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisType, setAnalysisType] = useState("geral");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const { limits, monthlyAnalyses, loading: limitsLoading, canAnalyze, canUseDeepfake } = usePlanLimits();

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setScanStep((prev) => (prev < 6 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleImageSelected = (selectedFile) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleClear = () => {
    setFile(null);
    setImagePreview(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setScanStep(0);
    console.log("[ScanShield] Iniciando análise. Tipo:", analysisType);

    const [{ file_url }, allAnalyses] = await Promise.all([
      base44.integrations.Core.UploadFile({ file }),
      base44.entities.ScreenAnalysis.list("-created_date", 20),
    ]);

    // Usar apenas análises reais (excluir dados sintéticos de treino sem URL real)
    const realAnalyses = allAnalyses.filter(
      (a) => a.image_url && a.image_url.startsWith("https://")
    );
    const withFeedback = realAnalyses.filter((a) => a.user_feedback);

    const mistakes = withFeedback
      .filter((a) => a.user_feedback === "incorreto")
      .slice(0, 5)
      .map((a) => `- IA disse "${a.risk_level}" mas era "${a.real_risk_level || "?"}"`)
      .join("\n");

    const patterns = withFeedback
      .filter((a) => a.user_feedback === "correto" && a.risk_level !== "seguro")
      .slice(0, 5)
      .map((a) => `- ${a.risk_level}: ${(a.red_flags || []).slice(0, 3).join(", ")}`)
      .join("\n");

    const learningContext =
      withFeedback.length > 0
        ? `\n\nAPRENDIZADOS COM FEEDBACK:\n${mistakes ? `❌ Erros anteriores a evitar:\n${mistakes}\n` : ""}${patterns ? `✅ Padrões confirmados:\n${patterns}\n` : ""}`
        : "";

    const deepfakePrompt = `Você é um dos melhores especialistas forenses do mundo em detecção de deepfakes, face swap e imagens geradas por IA. Analise com MÁXIMA precisão técnica:

🔬 ARTEFATOS TÉCNICOS:
- Bordas inconsistentes ao redor do rosto/cabelo/pescoço
- Textura de pele artificial, poros ausentes, suavização excessiva
- Assimetria não natural nos olhos, íris com padrão irregular
- Dentes com contornos estranhos, orelhas/pescoço com cor diferente
- Sombras no rosto incompatíveis com iluminação do fundo

🎭 FAMOSOS — DIFERENCIAÇÃO CRÍTICA:
- Busque na internet aparições verificadas dessa pessoa para comparar traços
- Deepfake de famoso: proporções faciais alteradas, ausência de marcas únicas naturais (sardas, manchas, cicatrizes), qualidade plástica
- Imagem REAL de famoso: traços consistentes com aparições verificadas, imperfeições naturais presentes, contexto coerente
- Indique claramente: "Deepfake do/da [nome]" OU "Imagem real e autêntica do/da [nome]"

👤 PESSOAS GERADAS POR IA (inexistentes):
- Simetria facial excessivamente perfeita (rostos reais são assimétricos)
- Cabelo com padrões repetitivos ou irreais
- Textura de pele plástica uniforme, sem poros ou variação natural
- Olhos com brilho artificial, íris com padrão procedural
- Fundo com distorções geométricas sutis
- Modelos típicos: ThisPersonDoesNotExist, StyleGAN, Stable Diffusion, Midjourney

🤖 MODELOS DE DEEPFAKE CONHECIDOS:
- DeepFaceLab/FaceSwap: fusão visível nas bordas do rosto, diferença de granulação
- SimSwap/Roop: pescoço/orelhas com tonalidade diferente do rosto
- Stable Diffusion/Midjourney: perfeição plástica, iluminação uniforme demais

No summary seja EXPLÍCITO: é DEEPFAKE DE FAMOSO, PESSOA GERADA POR IA, ou IMAGEM REAL AUTÊNTICA.`;

    const typePrompts = {
      geral: `Faça uma análise COMPLETA, TÉCNICA e AVANÇADA da imagem. Seja extremamente detalhado.

🔍 ANÁLISE OBRIGATÓRIA:
1. **Identidade e contexto**: O que é essa imagem? App, site, mensagem, anúncio? Quem está tentando comunicar o quê?
2. **Sinais de fraude**: Urgência artificial, pressão psicológica, promessas irreais, erros ortográficos propositais, domínios suspeitos, imitação de marcas.
3. **Engenharia social**: Que técnica de manipulação está sendo usada? FOMO, medo, autoridade falsa, reciprocidade?
4. **Verificação de dados**: Os dados apresentados fazem sentido? Preços, percentuais, alegações são plausíveis?
5. **Análise visual**: Qualidade da imagem, logos alterados, inconsistências visuais, fontes incomuns.
6. **Perfil do alvo**: Quem é a vítima pretendida? Idosos, jovens, investidores?
7. **Veredicto final**: Seja DIRETO e ASSERTIVO sobre o risco real.

No detailed_analysis, escreva pelo menos 5 parágrafos técnicos em markdown com subtítulos.`,

      golpe: `Você é um investigador de crimes digitais especializado em fraudes e golpes online. Analise esta imagem com MÁXIMA profundidade técnica.

🎯 INVESTIGAÇÃO OBRIGATÓRIA:
1. **Tipo de golpe identificado**: Phishing, scam, fraude financeira, golpe do WhatsApp, pirâmide, etc. Seja ESPECÍFICO.
2. **Técnicas de engenharia social**: Urgência, escassez, autoridade, medo de perder, prova social falsa — identifique CADA técnica usada.
3. **Indicadores técnicos de fraude**: Domínio suspeito, URL encurtada, certificado SSL ausente, sender spoofing, cabeçalho de email falso, número de telefone inválido.
4. **Anatomia do golpe**: Passo a passo de como o golpista age após o clique/contato.
5. **Impacto financeiro estimado**: Qual o prejuízo típico desse tipo de golpe?
6. **Grupo alvo**: A quem esse golpe é direcionado especificamente?
7. **Como se proteger**: Ações IMEDIATAS que a vítima deve tomar.
8. **Denúncia**: Para quais órgãos denunciar (PROCON, Safernet, delegacia de crimes digitais, Banco Central).

No detailed_analysis, escreva análise forense detalhada em markdown com pelo menos 6 parágrafos técnicos.`,

      oferta: `Você é um especialista em proteção do consumidor e análise de mercado. Analise esta oferta com MÁXIMA profundidade.

💰 ANÁLISE OBRIGATÓRIA:
1. **Produto identificado**: Nome exato, marca, modelo, especificações técnicas visíveis.
2. **Análise de preço**: Compare com preço médio de mercado (Mercado Livre, Amazon, Americanas). Justifique sua estimativa.
3. **Perfil do vendedor**: Reputação, tempo de mercado, avaliações, garantias oferecidas. Sinais de confiabilidade ou suspeita.
4. **Análise da oferta**: A oferta é real? Tem prazo? Tem estoque limitado? É uma isca (bait and switch)?
5. **Riscos de compra**: Produto falsificado, nunca entregue, defeituoso, sem suporte pós-venda?
6. **Análise contratual**: Política de devolução, garantia, SAC. O vendedor cumpre a lei do consumidor?
7. **Veredicto de compra**: Comprar ou evitar? Com quais precauções?
8. **Alternativas seguras**: Onde comprar o mesmo produto com segurança.

No detailed_analysis, escreva análise comercial detalhada em markdown com pelo menos 5 parágrafos.`,

      informacao_falsa: `Você é um fact-checker profissional com acesso a conhecimento enciclopédico. Analise esta informação com MÁXIMA rigorosidade.

📰 VERIFICAÇÃO OBRIGATÓRIA:
1. **Alegação principal**: O que exatamente está sendo afirmado? Transcreva e categorize.
2. **Verificação factual**: A alegação é verdadeira, falsa ou parcialmente verdadeira? Cite fatos e dados que contradizem ou confirmam.
3. **Origem da desinformação**: É fake news política, saúde, financeira, científica? Quem tem interesse em disseminar isso?
4. **Técnicas de manipulação**: Uso de dados verdadeiros fora de contexto, título enganoso vs. conteúdo, imagens descontextualizadas, citações falsas?
5. **Análise de fontes**: As fontes citadas existem? São confiáveis? As citações são precisas?
6. **Dano potencial**: Qual o impacto real se as pessoas acreditarem nisso? (Saúde pública, financeiro, político)
7. **Versão correta**: Qual é a verdade sobre o tema abordado?
8. **Como identificar no futuro**: Ensinamentos para o leitor reconhecer esse tipo de desinformação.

No detailed_analysis, escreva análise jornalística detalhada em markdown com pelo menos 6 parágrafos.`,

      deepfake: deepfakePrompt,
    };

    const isDeepfake = analysisType === "deepfake";

    console.log("[ScanShield] Upload concluído:", file_url, "| Enviando para LLM...");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o ScanShield, um sistema de segurança digital brasileiro especializado em proteção contra golpes, fraudes, deepfakes e desinformação. Seu objetivo é analisar imagens enviadas por usuários brasileiros e emitir laudos técnicos claros, detalhados e acessíveis. Você foi treinado para identificar ameaças digitais com precisão forense e sempre responder em português do Brasil. ${typePrompts[analysisType]}${learningContext}

⚠️ REGRAS CRÍTICAS DE QUALIDADE:
- NUNCA seja vago ou genérico. Cada campo deve ser ESPECÍFICO para o que está na imagem.
- red_flags: liste TODOS os sinais de alerta encontrados — seja exaustivo, mínimo 5 se houver suspeita.
- green_flags: liste pontos positivos REAIS — não invente se não houver.
- recommendations: 4-6 recomendações PRÁTICAS e ACIONÁVEIS (não genéricas).
- detailed_analysis: análise TÉCNICA e APROFUNDADA em markdown — MÍNIMO 500 palavras, com subtítulos (## ), listas e destaques (**negrito**). Esta é a parte mais importante.
- summary: 3-4 frases diretas e informativas sobre o que foi encontrado.
- title: título descritivo e específico (não apenas "Análise concluída").
- risk_score: calibre com precisão — 0-20 seguro, 21-40 atenção, 41-70 suspeito, 71-100 perigoso.

CAMPOS JSON OBRIGATÓRIOS:
- risk_level: "seguro" | "atencao" | "suspeito" | "perigoso"
- risk_score: 0 a 100
- title: título específico sobre o conteúdo analisado
- summary: resumo direto e informativo (3-4 frases)
- red_flags: array com TODOS os alertas encontrados
- green_flags: array com pontos positivos reais
- recommendations: 4-6 ações práticas e específicas
- detailed_analysis: análise técnica completa em markdown (mínimo 500 palavras)
${isDeepfake ? "- deepfake_probability: 0-100\n- deepfake_model_detected: modelo suspeito ou 'Não identificado'\n- deepfake_artifacts: array com artefatos técnicos detectados\n- NÃO preencha seller_info, product_name, price_found, estimated_market_price, price_verdict" : "- Se houver produto: preencha product_name, price_found (número), estimated_market_price (número), price_verdict\n- seller_info: informações detalhadas do vendedor se visíveis"}`,
      add_context_from_internet: false,
      model: "gemini_3_flash",
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          analysis_type: { type: "string", enum: ["oferta", "golpe", "informacao_falsa", "geral", "deepfake"] },
          risk_level: { type: "string", enum: ["seguro", "atencao", "suspeito", "perigoso"] },
          risk_score: { type: "number" },
          title: { type: "string" },
          summary: { type: "string" },
          product_name: { type: "string" },
          price_found: { type: "number" },
          estimated_market_price: { type: "number" },
          price_verdict: { type: "string" },
          seller_info: { type: "string" },
          red_flags: { type: "array", items: { type: "string" } },
          green_flags: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          detailed_analysis: { type: "string" },
          deepfake_probability: { type: "number" },
          deepfake_model_detected: { type: "string" },
          deepfake_artifacts: { type: "array", items: { type: "string" } },
        },
        required: ["risk_level", "risk_score", "title", "summary", "red_flags", "green_flags", "recommendations", "detailed_analysis"],
      },
    });

    console.log("[ScanShield] Resultado LLM:", JSON.stringify(result));
    const saved = await base44.entities.ScreenAnalysis.create({
      image_url: file_url,
      analysis_type: isDeepfake ? "deepfake" : (result.analysis_type || analysisType),
      risk_level: result.risk_level || "atencao",
      risk_score: result.risk_score ?? 50,
      title: result.title || "Análise concluída",
      summary: result.summary || "A IA analisou a imagem e gerou um relatório.",
      product_name: result.product_name || "",
      price_found: result.price_found || 0,
      estimated_market_price: result.estimated_market_price || 0,
      price_verdict: result.price_verdict || "",
      seller_info: result.seller_info || "",
      red_flags: result.red_flags || [],
      green_flags: result.green_flags || [],
      recommendations: result.recommendations || [],
      detailed_analysis: result.detailed_analysis || "",
      deepfake_probability: result.deepfake_probability || 0,
      deepfake_model_detected: result.deepfake_model_detected || "",
      deepfake_artifacts: result.deepfake_artifacts || [],
    });

    setIsAnalyzing(false);
    navigate(createPageUrl(`AnalysisDetail?id=${saved.id}`));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Analisar Captura de Tela
        </h1>
        <p className="text-muted-foreground">
          Envie uma screenshot e a IA irá analisar em busca de golpes e informações falsas
        </p>
        {!limitsLoading && (
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <ScanSearch className="w-3 h-3" />
            {monthlyAnalyses}/{limits.analyses} análises usadas este mês
          </div>
        )}
      </div>

      {!limitsLoading && !canAnalyze ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Limite de análises atingido</h2>
          <p className="text-muted-foreground max-w-sm">
            Você usou todas as {limits.analyses} análises do seu plano este mês. Faça upgrade para continuar protegido.
          </p>
          <Link to="/Premium">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-6">
              Ver planos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ImageUploader
            onImageSelected={handleImageSelected}
            imagePreview={imagePreview}
            onClear={handleClear}
            isAnalyzing={isAnalyzing}
          />

          {imagePreview && !isAnalyzing && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Tipo de Análise</h3>
                <AnalysisTypeSelector
                  selected={analysisType}
                  onSelect={setAnalysisType}
                  disabled={isAnalyzing}
                  canUseDeepfake={canUseDeepfake}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl bg-white hover:bg-white/90 text-black gap-2.5 glow-white"
              >
                <ScanSearch className="w-5 h-5" />
                Iniciar Análise
              </Button>
            </>
          )}

          {isAnalyzing && <ScanningOverlay currentStep={scanStep} analysisType={analysisType} />}
        </div>
      )}

      {/* Divisor */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground font-medium">ou verifique um link</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <LinkAnalyzer />
    </div>
  );
}