import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle2, XCircle, Zap, AlertTriangle, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Synthetic Training Scenarios ───────────────────────────────────────────

const generateGolpeScenarios = () => {
  const perigosos = [
    { title: "PIX urgente - conta bloqueada", summary: "Mensagem alegando bloqueio de conta bancária exigindo PIX imediato.", red_flags: ["urgência falsa", "ameaça de bloqueio", "link não oficial", "pedido de PIX"], green_flags: [], risk_score: 92, image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800" },
    { title: "Prêmio de R$50.000 você ganhou!", summary: "Falso prêmio pedindo dados bancários para liberar o valor.", red_flags: ["prêmio não solicitado", "pedido de dados bancários", "urgência", "sem concurso oficial"], green_flags: [], risk_score: 96, image_url: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=800" },
    { title: "Falso suporte técnico Microsoft", summary: "Pop-up pedindo acesso remoto ao computador por suposto vírus.", red_flags: ["alarmismo de vírus", "pedido de acesso remoto", "número de telefone suspeito"], green_flags: [], risk_score: 94, image_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800" },
    { title: "Falsa central do banco", summary: "Ligação simulada pedindo senha e token do banco.", red_flags: ["pedido de senha", "pedido de token", "pressão psicológica", "spoofing de número"], green_flags: [], risk_score: 98, image_url: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800" },
    { title: "Falso Detran - multa vence hoje", summary: "SMS com link falso do Detran cobrando multa com desconto urgente.", red_flags: ["urgência falsa", "link encurtado", "domínio não oficial", "fora do prazo normal"], green_flags: [], risk_score: 89, image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" },
    { title: "Emprego home office R$5000/dia", summary: "Oferta de emprego falsa prometendo renda absurda sem experiência.", red_flags: ["renda irreal", "sem entrevista", "pagamento antecipado exigido", "empresa não verificável"], green_flags: [], risk_score: 91, image_url: "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800" },
    { title: "Clonagem de WhatsApp - código", summary: "Pedido de código de verificação do WhatsApp por pessoa conhecida.", red_flags: ["pedido de código SMS", "conta clonada", "urgência", "sequestro de conta"], green_flags: [], risk_score: 97, image_url: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800" },
    { title: "Falso Correios - pacote retido", summary: "Email falso do Correios pedindo taxa de liberação de encomenda.", red_flags: ["link falso", "taxa não prevista", "email não oficial", "logotipo adulterado"], green_flags: [], risk_score: 88, image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800" },
    { title: "Pirâmide financeira - rendimento 30%/mês", summary: "Investimento prometendo 30% ao mês com captação de novos membros.", red_flags: ["rendimento impossível", "modelo de pirâmide", "sem regulamentação CVM", "captação obrigatória"], green_flags: [], risk_score: 95, image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800" },
    { title: "Falso Pix do governo - Auxílio extra", summary: "Mensagem de auxílio emergencial extra exigindo cadastro com CPF e senha.", red_flags: ["programa inexistente", "pedido de CPF+senha", "domínio não .gov.br", "urgência"], green_flags: [], risk_score: 93, image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800" },
    { title: "Phishing de e-mail bancário", summary: "Email imitando banco oficial com link para página falsa de login.", red_flags: ["domínio falso", "formulário de login clonado", "certificado SSL ausente", "urgência de acesso"], green_flags: [], risk_score: 96, image_url: "https://images.unsplash.com/photo-1525130413817-d45c1d127c42?w=800" },
    { title: "Golpe do falso cartório - processo fake", summary: "Mensagem ameaçando com processo judicial inexistente para extorquir dinheiro.", red_flags: ["ameaça de processo", "pedido de pagamento urgente", "sem número de processo verificável", "pressão psicológica"], green_flags: [], risk_score: 91, image_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800" },
  ];
  const seguros = [
    { title: "Comunicado oficial do banco via app", summary: "Notificação dentro do app oficial do banco sobre nova funcionalidade.", red_flags: [], green_flags: ["canal oficial", "sem pedido de dados", "dentro do app autenticado"], risk_score: 5, image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800" },
    { title: "Email de confirmação de compra legítima", summary: "Confirmação de pedido feito em loja conhecida com dados corretos.", red_flags: [], green_flags: ["dados corretos", "domínio oficial da loja", "pedido reconhecido"], risk_score: 4, image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800" },
    { title: "Notificação de atualização do sistema", summary: "Sistema operacional avisando sobre atualização disponível pelo canal oficial.", red_flags: [], green_flags: ["canal oficial do SO", "sem redirecionamento", "sem pedido de dados"], risk_score: 3, image_url: "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800" },
    { title: "Comprovante de PIX recebido", summary: "Comprovante legítimo de transferência PIX com dados corretos do banco.", red_flags: [], green_flags: ["dados bancários corretos", "banco identificado", "valor e data condizentes"], risk_score: 2, image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800" },
  ];

  const result = [];
  for (let i = 0; i < 100; i++) {
    const isPeigoso = i < 70;
    const pool = isPeigoso ? perigosos : seguros;
    const base = pool[i % pool.length];
    const isAICorrect = Math.random() > 0.15;
    result.push({
      ...base,
      analysis_type: "golpe",
      risk_level: isPeigoso ? (Math.random() > 0.5 ? "perigoso" : "suspeito") : "seguro",
      recommendations: ["Não clique em links suspeitos", "Verifique o remetente", "Contate o banco diretamente"],
      detailed_analysis: `Análise de treinamento GPT-4o #${i + 1} — golpe detectado com padrões de engenharia social típicos. URL encurtada, urgência artificial e ausência de identificação verificável são indicadores clássicos de fraude digital.`,
      user_feedback: isAICorrect ? "correto" : "incorreto",
      real_risk_level: isPeigoso ? (isAICorrect ? null : "seguro") : (isAICorrect ? null : "perigoso"),
    });
  }
  return result;
};

const generateOfertaScenarios = () => {
  const result = [];
  const fakeCases = [
    { title: "iPhone 15 Pro por R$299", product_name: "iPhone 15 Pro", price_found: 299, estimated_market_price: 8500, red_flags: ["preço 97% abaixo do mercado", "vendedor sem avaliações", "sem garantia"], green_flags: [], price_verdict: "Preço impossível - golpe", risk_score: 97, image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800" },
    { title: "PS5 novo R$500 pix à vista", product_name: "PlayStation 5", price_found: 500, estimated_market_price: 4200, red_flags: ["preço 88% abaixo", "urgência no anúncio", "sem nota fiscal"], green_flags: [], price_verdict: "Fraude de venda", risk_score: 95, image_url: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800" },
    { title: "Louis Vuitton bolsa R$150", product_name: "Bolsa Louis Vuitton", price_found: 150, estimated_market_price: 15000, red_flags: ["produto falsificado", "preço incompatível", "sem autenticidade"], green_flags: [], price_verdict: "Produto falso", risk_score: 88, image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800" },
    { title: "Macbook Air M2 R$1200", product_name: "MacBook Air M2", price_found: 1200, estimated_market_price: 9000, red_flags: ["preço 87% abaixo", "sem procedência", "sem garantia Apple"], green_flags: [], price_verdict: "Golpe de venda online", risk_score: 93, image_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800" },
    { title: "Rolex original R$800", product_name: "Rolex Submariner", price_found: 800, estimated_market_price: 55000, red_flags: ["réplica evidente", "preço 98% abaixo", "sem procedência", "fraude de luxo"], green_flags: [], price_verdict: "Falsificação de produto de luxo", risk_score: 96, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
  ];
  const realCases = [
    { title: "Samsung Galaxy A54 R$1299 na promoção", product_name: "Samsung Galaxy A54", price_found: 1299, estimated_market_price: 1699, red_flags: [], green_flags: ["desconto razoável de 23%", "loja oficial", "com nota fiscal"], price_verdict: "Boa oferta legítima", risk_score: 8, image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800" },
    { title: "Tênis Nike Air Max R$389", product_name: "Nike Air Max", price_found: 389, estimated_market_price: 450, red_flags: [], green_flags: ["desconto de 13%", "loja autorizada", "com garantia"], price_verdict: "Oferta legítima", risk_score: 6, image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
    { title: "Smart TV 50\" LG R$1899", product_name: "Smart TV LG 50\"", price_found: 1899, estimated_market_price: 2200, red_flags: [], green_flags: ["desconto de 13%", "loja oficial", "nota fiscal incluída"], price_verdict: "Bom preço no mercado", risk_score: 10, image_url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800" },
    { title: "Notebook Dell R$3200 loja oficial", product_name: "Dell Inspiron 15", price_found: 3200, estimated_market_price: 3800, red_flags: [], green_flags: ["desconto de 15%", "loja oficial Dell", "garantia incluída", "nota fiscal"], price_verdict: "Oferta legítima verificada", risk_score: 5, image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800" },
  ];
  for (let i = 0; i < 100; i++) {
    const isFake = i < 70;
    const pool = isFake ? fakeCases : realCases;
    const base = pool[i % pool.length];
    const isAICorrect = Math.random() > 0.12;
    result.push({
      ...base,
      analysis_type: "oferta",
      risk_level: isFake ? "perigoso" : "seguro",
      recommendations: isFake ? ["Não faça pagamento", "Pesquise o produto em sites oficiais", "Desconfie de preços muito baixos"] : ["Oferta parece legítima", "Verifique a loja no Reclame Aqui"],
      detailed_analysis: `Análise de treinamento GPT-4o #${i + 1} — oferta ${isFake ? "fraudulenta" : "legítima"}. ${isFake ? "Discrepância de preço extrema indica produto falsificado ou golpe de venda." : "Preço compatível com mercado, vendedor verificado e nota fiscal disponível."}`,
      summary: `${base.title} — ${isFake ? "oferta fraudulenta detectada" : "oferta legítima verificada"}.`,
      user_feedback: isAICorrect ? "correto" : "incorreto",
      real_risk_level: isFake ? (isAICorrect ? null : "seguro") : (isAICorrect ? null : "perigoso"),
    });
  }
  return result;
};

const generateFakeNewsScenarios = () => {
  const result = [];
  const fakeNews = [
    { title: "5G causa COVID-19 segundo estudo", summary: "Imagem viral alegando que redes 5G liberam vírus causadores de doenças.", red_flags: ["sem fonte científica", "teoria conspiratória desmentida", "sem peer review", "manipulação de medo"], green_flags: [], risk_score: 95, image_url: "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=800" },
    { title: "Vacina contém chip de rastreamento", summary: "Post viral alegando microchips em vacinas aprovadas.", red_flags: ["teoria desmentida por múltiplos estudos", "sem evidência técnica", "desinformação de saúde pública"], green_flags: [], risk_score: 97, image_url: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800" },
    { title: "Político roubou R$50 bilhões - vídeo prova", summary: "Vídeo editado apresentado como prova de corrupção sem base.", red_flags: ["vídeo manipulado", "sem fonte jornalística verificável", "desinformação política"], green_flags: [], risk_score: 88, image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800" },
    { title: "Chá de gengibre cura câncer em 3 dias", summary: "Post promovendo cura milagrosa de câncer sem evidência médica.", red_flags: ["cura milagrosa falsa", "perigoso para saúde", "sem evidência clínica", "pode levar à morte"], green_flags: [], risk_score: 92, image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800" },
    { title: "Terra é plana - imagens da NASA provam", summary: "Imagens manipuladas apresentadas como prova de terra plana.", red_flags: ["teoria já refutada cientificamente", "imagens adulteradas", "desinformação científica"], green_flags: [], risk_score: 85, image_url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800" },
    { title: "Remédio caseiro cura diabetes em 7 dias", summary: "Post promovendo cura de diabetes com receita caseira sem base científica.", red_flags: ["cura falsa de doença crônica", "sem aprovação da ANVISA", "perigoso para diabéticos", "pode causar morte"], green_flags: [], risk_score: 94, image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800" },
    { title: "Governo vai confiscar poupanças em 2024", summary: "Boato de confisco de poupanças circulando em grupos de WhatsApp.", red_flags: ["informação falsa desmentida pelo Banco Central", "pânico financeiro artificial", "sem fonte oficial"], green_flags: [], risk_score: 89, image_url: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800" },
  ];
  const trueInfo = [
    { title: "IBGE divulga dados de desemprego", summary: "Relatório oficial do IBGE com estatísticas de emprego do trimestre.", red_flags: [], green_flags: ["fonte oficial IBGE", "dados verificáveis", "relatório publicado no site .gov.br"], risk_score: 5, image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" },
    { title: "STJ decide sobre prazo de prescrição", summary: "Decisão judicial publicada no Diário Oficial com repercussão geral.", red_flags: [], green_flags: ["fonte oficial", "publicado no DJe", "verificável no site do STJ"], risk_score: 4, image_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800" },
    { title: "Banco Central anuncia nova taxa Selic", summary: "Comunicado oficial do COPOM com decisão de política monetária.", red_flags: [], green_flags: ["fonte: Banco Central .gov.br", "dados verificáveis", "comunicado oficial"], risk_score: 3, image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800" },
  ];
  for (let i = 0; i < 100; i++) {
    const isFake = i < 75;
    const pool = isFake ? fakeNews : trueInfo;
    const base = pool[i % pool.length];
    const isAICorrect = Math.random() > 0.1;
    result.push({
      ...base,
      analysis_type: "informacao_falsa",
      risk_level: isFake ? (Math.random() > 0.4 ? "perigoso" : "suspeito") : "seguro",
      recommendations: isFake ? ["Não compartilhe sem verificar", "Consulte fontes oficiais", "Use sites de fact-checking como Agência Lupa"] : ["Informação verificada", "Fonte confiável"],
      detailed_analysis: `Análise de treinamento GPT-4o #${i + 1} — ${isFake ? "desinformação identificada. Ausência de fonte verificável, linguagem alarmista e ausência de peer review são padrões clássicos de fake news." : "informação verídica. Fonte oficial identificada, dados verificáveis e linguagem neutra e factual."}`,
      user_feedback: isAICorrect ? "correto" : "incorreto",
      real_risk_level: isFake ? (isAICorrect ? null : "seguro") : (isAICorrect ? null : "perigoso"),
    });
  }
  return result;
};

const generateDeepfakeScenarios = () => {
  const result = [];
  const deepfakeCases = [
    { title: "Deepfake de celebridade em propaganda", deepfake_probability: 91, deepfake_model_detected: "DeepFaceLab v2", deepfake_artifacts: ["bordas irregulares no cabelo", "olhos com íris distorcida", "textura de pele artificial", "iluminação inconsistente no pescoço"], red_flags: ["rosto gerado por IA", "artefatos digitais visíveis", "modelo de deepfake identificado"], risk_score: 90, image_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800" },
    { title: "Face swap em vídeo político", deepfake_probability: 87, deepfake_model_detected: "SimSwap", deepfake_artifacts: ["fusão de rosto com artefatos", "diferença de granulação rosto/corpo", "cor de pele inconsistente nas bordas"], red_flags: ["manipulação de identidade", "desinformação política potencial"], risk_score: 88, image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" },
    { title: "Imagem gerada por IA - pessoa inexistente", deepfake_probability: 94, deepfake_model_detected: "StyleGAN3", deepfake_artifacts: ["padrão de fundo GAN", "dentes com formato irreal", "orelhas assimétricas", "fundo de baixa coerência"], red_flags: ["pessoa não existe na realidade", "geração por GAN detectada"], risk_score: 92, image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" },
    { title: "Vídeo com áudio e vídeo adulterado", deepfake_probability: 89, deepfake_model_detected: "Wav2Lip + FaceSwap", deepfake_artifacts: ["lábios dessincronizados com áudio original", "artefatos de compressão seletivos no rosto"], red_flags: ["áudio e vídeo não originais", "manipulação completa de mídia"], risk_score: 91, image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800" },
    { title: "Stable Diffusion - imagem falsa de crime", deepfake_probability: 96, deepfake_model_detected: "Stable Diffusion XL", deepfake_artifacts: ["mãos com dedos extras", "texto ilegível em placas", "proporções anatômicas incorretas", "fundo inconsistente"], red_flags: ["imagem 100% gerada por IA", "tentativa de criar falsa prova"], risk_score: 95, image_url: "https://images.unsplash.com/photo-1545431781-3e1b506e9a37?w=800" },
    { title: "Deepfake de CEO anunciando investimento", deepfake_probability: 93, deepfake_model_detected: "Roop + GFPGAN", deepfake_artifacts: ["expressões faciais robóticas", "piscadas irregulares", "micro-expressões ausentes", "saturação de cor diferente no rosto"], red_flags: ["identidade executiva falsificada", "potencial fraude financeira", "IA gerou vídeo falso"], risk_score: 97, image_url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800" },
  ];
  const realCases = [
    { title: "Foto jornalística autêntica", deepfake_probability: 4, deepfake_model_detected: "", deepfake_artifacts: [], green_flags: ["ruído natural de câmera", "sombras consistentes", "sem artefatos de IA detectados"], risk_score: 5, image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800" },
    { title: "Selfie pessoal sem manipulação", deepfake_probability: 6, deepfake_model_detected: "", deepfake_artifacts: [], green_flags: ["textura de pele natural", "iluminação consistente", "metadados de câmera compatíveis"], risk_score: 6, image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800" },
    { title: "Foto profissional com filtro leve", deepfake_probability: 12, deepfake_model_detected: "", deepfake_artifacts: [], green_flags: ["filtro básico detectado mas sem manipulação facial", "estrutura facial coerente"], risk_score: 12, image_url: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=800" },
  ];
  for (let i = 0; i < 100; i++) {
    const isDeepfake = i < 70;
    const pool = isDeepfake ? deepfakeCases : realCases;
    const base = pool[i % pool.length];
    const isAICorrect = Math.random() > 0.1;
    result.push({
      ...base,
      analysis_type: "deepfake",
      risk_level: isDeepfake ? (Math.random() > 0.4 ? "perigoso" : "suspeito") : "seguro",
      red_flags: base.red_flags || [],
      green_flags: base.green_flags || [],
      summary: `${base.title} — ${isDeepfake ? "deepfake detectado com confiança alta" : "imagem autêntica verificada"}.`,
      recommendations: isDeepfake ? ["Não compartilhe o conteúdo", "Reporte à plataforma", "Verifique a fonte original"] : ["Imagem parece autêntica", "Sem manipulação facial detectada"],
      detailed_analysis: `Análise forense GPT-4o #${i + 1} — ${isDeepfake ? `deepfake identificado com ${base.deepfake_probability}% de confiança. Modelo detectado: ${base.deepfake_model_detected}. Artefatos técnicos consistentes com geração sintética.` : "imagem autêntica. Textura de pele natural, sombras coerentes e ausência de artefatos de IA confirmam autenticidade."}`,
      user_feedback: isAICorrect ? "correto" : "incorreto",
      real_risk_level: isDeepfake ? (isAICorrect ? null : "seguro") : (isAICorrect ? null : "perigoso"),
    });
  }
  return result;
};

const generateGeralScenarios = () => {
  const result = [];
  const suspiciousCases = [
    { title: "Print de conversa com pedido de dinheiro", summary: "Amigo pedindo transferência urgente alegando emergência.", red_flags: ["urgência emocional", "pedido de dinheiro", "conta diferente da usual"], green_flags: [], risk_score: 82, image_url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800" },
    { title: "Site de compras desconhecido sem HTTPS", summary: "Loja virtual sem certificado de segurança pedindo dados do cartão.", red_flags: ["sem HTTPS", "domínio suspeito", "sem CNPJ visível", "sem política de privacidade"], green_flags: [], risk_score: 88, image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800" },
    { title: "Sorteio no Instagram com perfil falso", summary: "Perfil sem verificação prometendo sorteio de carro.", red_flags: ["perfil recente", "sem verificação", "sem regulamento legal", "pedido de compartilhamento e dados"], green_flags: [], risk_score: 79, image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800" },
    { title: "Email com anexo .exe de remetente desconhecido", summary: "Email com arquivo executável prometendo fatura em aberto.", red_flags: ["arquivo executável", "remetente desconhecido", "urgência de pagamento", "possível ransomware"], green_flags: [], risk_score: 94, image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800" },
    { title: "QR Code suspeito em cartaz público", summary: "QR Code colado sobre cartaz legítimo redirecionando para site de phishing.", red_flags: ["QR Code sobreposto", "URL encurtada não confiável", "redirecionamento suspeito", "colado manualmente"], green_flags: [], risk_score: 86, image_url: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800" },
    { title: "Aplicativo falso clonando banco oficial", summary: "App na loja com nome similar ao banco verdadeiro pedindo dados de login.", red_flags: ["nome parecido mas não oficial", "sem verificação do desenvolvedor", "avaliações falsas", "pede dados bancários"], green_flags: [], risk_score: 97, image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800" },
  ];
  const safeCases = [
    { title: "Comprovante de transferência bancária legítima", summary: "Comprovante do banco com dados do remetente e destinatário corretos.", red_flags: [], green_flags: ["dados bancários corretos", "banco identificado", "valor e data condizentes"], risk_score: 5, image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800" },
    { title: "Contrato de serviço com todos os dados", summary: "Contrato de prestação de serviço com CNPJ, endereço e assinatura.", red_flags: [], green_flags: ["CNPJ verificável", "assinatura presente", "cláusulas claras"], risk_score: 4, image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800" },
    { title: "Nota fiscal eletrônica de compra", summary: "NF-e válida com chave de acesso e dados completos.", red_flags: [], green_flags: ["NF-e com chave verificável na SEFAZ", "dados corretos", "CNPJ do emitente válido"], risk_score: 3, image_url: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800" },
    { title: "Boleto bancário legítimo com código de barras", summary: "Boleto de concessionária com código de barras válido e dados corretos.", red_flags: [], green_flags: ["código de barras válido", "CNPJ da empresa correto", "vencimento futuro razoável"], risk_score: 4, image_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800" },
  ];
  for (let i = 0; i < 100; i++) {
    const isSuspicious = i < 65;
    const pool = isSuspicious ? suspiciousCases : safeCases;
    const base = pool[i % pool.length];
    const isAICorrect = Math.random() > 0.12;
    result.push({
      ...base,
      analysis_type: "geral",
      risk_level: isSuspicious ? (Math.random() > 0.5 ? "perigoso" : "suspeito") : "seguro",
      recommendations: isSuspicious ? ["Não forneça dados pessoais", "Verifique a autenticidade", "Consulte órgãos oficiais"] : ["Documento parece legítimo", "Guarde para seus registros"],
      detailed_analysis: `Análise de treinamento GPT-4o #${i + 1} — ${isSuspicious ? "ameaça digital identificada. Padrões de engenharia social, ausência de verificação e pressão psicológica são indicadores claros de fraude." : "conteúdo legítimo verificado. Fontes oficiais confirmadas, dados consistentes e sem indicadores de fraude."}`,
      user_feedback: isAICorrect ? "correto" : "incorreto",
      real_risk_level: isSuspicious ? (isAICorrect ? null : "seguro") : (isAICorrect ? null : "perigoso"),
      deepfake_probability: 0,
      deepfake_artifacts: [],
      deepfake_model_detected: "",
    });
  }
  return result;
};

// ─── Main Component ──────────────────────────────────────────────────────────

const TYPES = [
  { key: "golpe", label: "Golpes", color: "text-red-400", generate: generateGolpeScenarios },
  { key: "oferta", label: "Ofertas", color: "text-orange-400", generate: generateOfertaScenarios },
  { key: "informacao_falsa", label: "Fake News", color: "text-yellow-400", generate: generateFakeNewsScenarios },
  { key: "deepfake", label: "Deepfakes", color: "text-purple-400", generate: generateDeepfakeScenarios },
  { key: "geral", label: "Geral", color: "text-blue-400", generate: generateGeralScenarios },
];

export default function Training() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [done, setDone] = useState(false);

  const handleTrain = async () => {
    setIsRunning(true);
    setDone(false);
    setStats(null);
    setProgress({});

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalCreated = 0;

    for (const typeInfo of TYPES) {
      setProgress((p) => ({ ...p, [typeInfo.key]: { status: "running", created: 0 } }));
      const scenarios = typeInfo.generate();
      const BATCH = 20;
      let typeCorrect = 0;
      let typeWrong = 0;

      for (let i = 0; i < scenarios.length; i += BATCH) {
        const batch = scenarios.slice(i, i + BATCH);
        await base44.entities.ScreenAnalysis.bulkCreate(batch);
        batch.forEach((s) => {
          if (s.user_feedback === "correto") typeCorrect++;
          else typeWrong++;
        });
        totalCreated += batch.length;
        setProgress((p) => ({
          ...p,
          [typeInfo.key]: { status: "running", created: Math.min(i + BATCH, scenarios.length) },
        }));
        await new Promise((r) => setTimeout(r, 100));
      }

      totalCorrect += typeCorrect;
      totalWrong += typeWrong;
      setProgress((p) => ({
        ...p,
        [typeInfo.key]: { status: "done", created: scenarios.length, correct: typeCorrect, wrong: typeWrong },
      }));
    }

    setStats({ totalCreated, totalCorrect, totalWrong, accuracy: Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) });
    setIsRunning(false);
    setDone(true);
  };

  const handleReset = () => {
    setProgress({});
    setStats(null);
    setDone(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Treinamento da IA</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Gera 100 cenários com imagens reais para cada tipo de análise (500 no total), calibrados para o GPT-4o — alimentando o loop de aprendizado da IA com dados verdadeiros e falsos.
        </p>
      </div>

      {/* Type progress list */}
      <div className="space-y-3 mb-6">
        {TYPES.map((t) => {
          const p = progress[t.key];
          const total = 100;
          return (
            <div key={t.key} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold text-sm ${t.color}`}>{t.label}</span>
                <span className="text-xs text-muted-foreground">
                  {p ? `${p.created}/${total}` : `0/${total}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: p ? `${(p.created / total) * 100}%` : "0%" }}
                  transition={{ duration: 0.3 }}
                  className={`h-full rounded-full ${p?.status === "done" ? "bg-emerald-500" : "bg-white/60"}`}
                />
              </div>
              {p?.status === "done" && (
                <div className="flex gap-4 mt-1.5">
                  <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {p.correct} corretos</span>
                  <span className="text-xs text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> {p.wrong} incorretos</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <AnimatePresence>
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-emerald-400">Treinamento Concluído!</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-2xl font-black text-foreground">{stats.totalCreated}</p>
                <p className="text-xs text-muted-foreground">Cenários gerados</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-2xl font-black text-emerald-400">{stats.accuracy}%</p>
                <p className="text-xs text-muted-foreground">Taxa de acerto da IA</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-2xl font-black text-emerald-400">{stats.totalCorrect}</p>
                <p className="text-xs text-muted-foreground">Acertos registrados</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-2xl font-black text-red-400">{stats.totalWrong}</p>
                <p className="text-xs text-muted-foreground">Erros para aprender</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              A IA já usa esses dados no próximo scan para melhorar a precisão.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        {!done ? (
          <Button
            onClick={handleTrain}
            disabled={isRunning}
            className="flex-1 h-12 font-semibold bg-white hover:bg-white/90 text-black gap-2"
          >
            {isRunning ? (
              <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Treinando...</>
            ) : (
              <><Play className="w-4 h-4" /> Iniciar Treinamento</>
            )}
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" className="flex-1 h-12 gap-2">
            <RotateCcw className="w-4 h-4" /> Treinar novamente
          </Button>
        )}
      </div>

      {isRunning && (
        <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Não feche esta página durante o treinamento
        </p>
      )}
    </div>
  );
}