import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper para executar chamada com retry em caso de 503 / alta demanda
async function callWithRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error) || error?.message || '';
    const isTransient = errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorStr.includes('high demand');
    if (retries > 0 && isTransient) {
      console.warn(`Gemini 503 detectado. Tentando novamente em ${delayMs}ms... (restam ${retries} tentativas)`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callWithRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw error;
  }
}

// Fallback determinístico de sessão aquática para quando a API estiver 503/indisponível
function getDeterministicAquaticWorkout(params: any, duration: number) {
  const isDeep = String(params.depthType).toLowerCase().includes('funda');
  const warmupMins = Math.round(duration * 0.2); // ~20%
  const coolDownMins = Math.round(duration * 0.2); // ~20%
  const mainMins = duration - warmupMins - coolDownMins;

  const eq = params.equipments && params.equipments.length > 0 ? params.equipments[0] : 'Nenhum (resistência da água)';

  return {
    sessionTitle: `Hidro Personal Individualizado - ${params.clientName}`,
    sessionGoal: params.mainObjective || 'Condicionamento hidrodinâmico e mobilidade articular',
    changeJustification: `Sessão estruturada pedagogicamente para ${params.experienceLevel}, adaptada ao empuxo da piscina (${isDeep ? 'Profunda' : 'Rasa'}) com foco em segurança motora e controle da PSE.`,
    generalSafetyGuidance: 'Mantenha estabilidade de tronco. Em caso de desconforto ou dor atípica, interromper o movimento imediatamente.',
    warmupDurationMinutes: warmupMins,
    mainDurationMinutes: mainMins,
    coolDownDurationMinutes: coolDownMins,
    totalDurationMinutes: duration,
    exercises: [
      {
        phase: 'aquecimento',
        name: isDeep ? 'Deslocamento Flutuado com Balanço Braquial' : 'Marcha Aquática com Balanço de Braços',
        durationMinutes: warmupMins,
        executionInstructions: 'Movimentos contínuos no plano sagital, explorando a viscosidade da água em ritmo suave e cadenciado.',
        targetPSE: 'Borg 2-3 (Leve)',
        progression: 'Aumentar a amplitude da passada e da ação braquial.',
        regression: 'Reduzir a velocidade do deslocamento.',
        safetyAlert: 'Manter abdômen ativo para evitar oscilações lombares excessivas.',
        equipment: 'Nenhum (resistência da água)',
      },
      {
        phase: 'principal',
        name: isDeep ? 'Propulsão Vertical com Flexão de Joelhos e Rotação Escapular' : 'Abdução/Adução de Membros e Empuxo Peitoral',
        durationMinutes: Math.floor(mainMins / 2),
        executionInstructions: 'Ação vigorosa contra a resistência da água, alternando grupos musculares agonistas e antagonistas.',
        targetPSE: 'Borg 5-6 (Moderado para Forte)',
        progression: 'Aumentar a velocidade da fase concêntrica.',
        regression: 'Aumentar os intervalos entre as séries de 30 segundos.',
        safetyAlert: 'Ombros sempre submersos para evitar sobrecarga nas articulações glenoumerais.',
        equipment: eq,
      },
      {
        phase: 'principal',
        name: isDeep ? 'Bicicleta Aquática Flutuada com Ação de Core' : 'Polichinelo Aquático com Deslocamento Hidrodinâmico',
        durationMinutes: Math.ceil(mainMins / 2),
        executionInstructions: 'Movimentos cíclicos contínuos com foco em resistência cardiorrespiratória e estabilização de pelve.',
        targetPSE: 'Borg 6-7 (Forte)',
        progression: 'Aumentar a frequência de passadas/pedaladas.',
        regression: 'Apoiar temporariamente na borda para estabilizar.',
        safetyAlert: 'Manter a cabeça neutra e olhar voltado para o horizonte.',
        equipment: eq,
      },
      {
        phase: 'volta_a_calma',
        name: 'Alongamento em Flutuação Assistida e Relaxamento Respiratório',
        durationMinutes: coolDownMins,
        executionInstructions: 'Soltura articular, movimentos suaves em formato de oito com as mãos e respiração profunda ritmada.',
        targetPSE: 'Borg 1-2 (Muito Leve)',
        progression: 'Aumentar o tempo de flutuação relaxada.',
        regression: 'Manter contato plantar firme com o solo ou borda.',
        safetyAlert: 'Cuidado ao sair da piscina para evitar hipotensão ortostática súbita.',
        equipment: 'Nenhum (resistência da água)',
      },
    ],
  };
}

// Fallback de mensagens de retenção
function getFallbackRetentionMessage(clientName: string, messageType: string): string {
  const map: Record<string, string> = {
    boas_vindas: `Olá, ${clientName}! Seja muito bem-vindo(a) ao treinamento personalizado na água! Estou muito feliz em acompanhar você na busca por mais qualidade de vida, mobilidade e disposição física na piscina. Nos vemos em breve! — Prof. Henrique Aquafitness | HYDRO PERSONAL 🌊`,
    ausencia: `Oi, ${clientName}! Senti sua falta na nossa última sessão na piscina. Espero que esteja tudo bem com você! Quando tiver um tempinho, me dê um retorno para combinarmos nossa próxima aula. Um abraço! — Prof. Henrique Aquafitness | HYDRO PERSONAL 🏊‍♂️`,
    reposicao: `Olá, ${clientName}! Tudo bem? Como você precisou se ausentar, separei alguns horários disponíveis para realizarmos sua reposição aquática. Qual dia e horário fica melhor para a sua rotina? — Prof. Henrique Aquafitness | HYDRO PERSONAL 💦`,
    renovacao: `Olá, ${clientName}! Passando para avisar com antecedência e carinho que seu pacote de hidroginástica/personal aquático está chegando às últimas sessões. Gostaria de renovar para garantirmos a reserva dos seus horários na piscina? — Prof. Henrique Aquafitness | HYDRO PERSONAL 🌊`,
    parabens_marco: `Parabéns pela sua dedicação constante e evolução nos nossos treinos aquáticos, ${clientName}! A constância é o que transforma o movimento em saúde e leveza. Seguimos firmes na água! — Prof. Henrique Aquafitness | HYDRO PERSONAL 💪🏊‍♂️`,
  };
  return map[messageType] || map.boas_vindas;
}

// Endpoint: Gerar sessão de treino aquático individualizado
app.post('/api/gemini/workout', async (req: Request, res: Response) => {
  const {
    clientName,
    mainObjective,
    experienceLevel,
    targetDurationMinutes,
    depthType,
    equipments,
    restrictionsCare,
    lastEvaluation,
    previousSessionsSummary,
  } = req.body;

  const duration = parseInt(targetDurationMinutes, 10) || 45;
  const hasEquipment = equipments && equipments.length > 0;
  const equipmentNotice = hasEquipment
    ? `Equipamentos disponíveis na borda da piscina: ${equipments.join(', ')}. Use APENAS esses ou peso corporal/resistência da água.`
    : 'NENHUM equipamento disponível. Obrigatório: TODOS os exercícios devem ser executados SEM materiais (usar unicamente resistência hidrodinâmica e peso corporal).';

  const systemInstruction = `Você é um especialista em treinamento físico aquático e hidroginástica personalizada (Aquafitness).
Você atua em conformidade com as diretrizes do Prof. Henrique Aquafitness (HYDRO PERSONAL).
DIRETRIZES FUNDAMENTAIS:
1. Treino seguro, baseado em ciência do movimento na água e percepção subjetiva de esforço (Borg CR10).
2. Não faça diagnósticos médicos nem prometa cura clínica.
3. Se o profissional informou restrições e cuidados ("${restrictionsCare || 'Nenhum'}"), respeite-os rigorosamente (adapte alavancas, velocidades, impacto).
4. Profundidade da piscina: ${depthType || 'Pé no chão (água na altura do peito/axilas)'}.
5. Duração exata da sessão: ${duration} minutos. A soma das durações dos exercícios (aquecimento + parte principal + volta à calma) DEVE somar exatamente ${duration} minutos.
6. ${equipmentNotice}
7. Cada exercício deve conter:
   - name: Nome claro e técnico do movimento aquático.
   - phase: 'aquecimento' | 'principal' | 'volta_a_calma'.
   - durationMinutes: Duração em minutos inteiros (positivo).
   - executionInstructions: Descrição prática da mecânica dentro da água (posição do corpo, plano de movimento, ação dos membros).
   - targetPSE: Escala de Percepção Subjetiva de Esforço (ex: 'Borg 3-4', 'Borg 7-8').
   - progression: Como intensificar (aumento de amplitude, alavanca ou velocidade).
   - regression: Como facilitar se o aluno cansar ou sentir desconforto.
   - safetyAlert: Cuidado postural ou hidrodinâmico (ex: alinhar coluna, evitar hiperlordose na turbulência).
   - equipment: Material utilizado ou 'Nenhum (resistência da água)'.`;

  const userPrompt = `Gere uma sessão completa de hidroginástica/personal aquático para:
- Aluno(a): ${clientName}
- Objetivo: ${mainObjective}
- Nível de Experiência: ${experienceLevel}
- Restrições/Cuidados informados: ${restrictionsCare || 'Nenhum'}
- Duração total: ${duration} minutos
- Materiais disponíveis: ${hasEquipment ? equipments.join(', ') : 'Nenhum'}
- Profundidade: ${depthType || 'Rasa/Pé no chão'}
- Última avaliação do aluno: ${lastEvaluation ? JSON.stringify(lastEvaluation) : 'Primeira sessão ou sem avaliação recente'}
- Histórico recente de sessões: ${previousSessionsSummary || 'Primeiro treino gerado no sistema'}

Retorne em formato JSON estrito conforme o schema. Justifique no campo "changeJustification" a progressão escolhida com base no histórico e objetivo.`;

  try {
    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sessionTitle: { type: Type.STRING },
              sessionGoal: { type: Type.STRING },
              changeJustification: { type: Type.STRING },
              generalSafetyGuidance: { type: Type.STRING },
              warmupDurationMinutes: { type: Type.INTEGER },
              mainDurationMinutes: { type: Type.INTEGER },
              coolDownDurationMinutes: { type: Type.INTEGER },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: {
                      type: Type.STRING,
                      description: 'aquecimento, principal ou volta_a_calma',
                    },
                    name: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    executionInstructions: { type: Type.STRING },
                    targetPSE: { type: Type.STRING },
                    progression: { type: Type.STRING },
                    regression: { type: Type.STRING },
                    safetyAlert: { type: Type.STRING },
                    equipment: { type: Type.STRING },
                  },
                  required: [
                    'phase',
                    'name',
                    'durationMinutes',
                    'executionInstructions',
                    'targetPSE',
                    'progression',
                    'regression',
                    'safetyAlert',
                    'equipment',
                  ],
                },
              },
            },
            required: [
              'sessionTitle',
              'sessionGoal',
              'changeJustification',
              'generalSafetyGuidance',
              'warmupDurationMinutes',
              'mainDurationMinutes',
              'coolDownDurationMinutes',
              'exercises',
            ],
          },
        },
      })
    );

    const rawText = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      console.warn('Falha no parse do Gemini, usando plano determinístico:', parseError);
      parsed = getDeterministicAquaticWorkout(req.body, duration);
    }

    // Normalizar tempo dos exercícios
    let totalExMinutes = parsed.exercises.reduce(
      (acc: number, ex: any) => acc + Math.max(1, parseInt(ex.durationMinutes, 10) || 1),
      0
    );

    // Se houver discrepância de minutos, realizar ajuste proporcional determinístico no código
    if (totalExMinutes !== duration) {
      const diff = duration - totalExMinutes;
      const mainIndices = parsed.exercises
        .map((ex: any, idx: number) => ({ idx, phase: ex.phase, dur: parseInt(ex.durationMinutes, 10) || 1 }))
        .filter((item: any) => item.phase === 'principal');

      const targetIndex = mainIndices.length > 0 ? mainIndices[0].idx : 0;
      parsed.exercises[targetIndex].durationMinutes = Math.max(
        1,
        (parsed.exercises[targetIndex].durationMinutes || 1) + diff
      );
    }

    const warmupTotal = parsed.exercises
      .filter((e: any) => e.phase === 'aquecimento')
      .reduce((s: number, e: any) => s + (parseInt(e.durationMinutes, 10) || 0), 0);
    const mainTotal = parsed.exercises
      .filter((e: any) => e.phase === 'principal')
      .reduce((s: number, e: any) => s + (parseInt(e.durationMinutes, 10) || 0), 0);
    const coolDownTotal = parsed.exercises
      .filter((e: any) => e.phase === 'volta_a_calma')
      .reduce((s: number, e: any) => s + (parseInt(e.durationMinutes, 10) || 0), 0);

    parsed.warmupDurationMinutes = warmupTotal;
    parsed.mainDurationMinutes = mainTotal;
    parsed.coolDownDurationMinutes = coolDownTotal;
    parsed.totalDurationMinutes = warmupTotal + mainTotal + coolDownTotal;

    return res.json({ success: true, workout: parsed });
  } catch (error: any) {
    console.warn('Erro ao chamar Gemini no /api/gemini/workout. Aplicando plano técnico de contingência:', error?.message);
    const fallbackWorkout = getDeterministicAquaticWorkout(req.body, duration);
    return res.json({ success: true, workout: fallbackWorkout, fallbackApplied: true });
  }
});

// Endpoint: Gerar mensagem acolhedora de retenção para WhatsApp
app.post('/api/gemini/message', async (req: Request, res: Response) => {
  const { clientName, messageType, contextDetails } = req.body;

  const systemInstruction = `Você é assistente de comunicação do Prof. Henrique Aquafitness (HYDRO PERSONAL).
Escreva mensagens curtas e naturais para WhatsApp para enviar a clientes de personal aquático.
REGRAS ÉTICAS E DE QUALIDADE:
1. Tom acolhedor, profissional, respeitoso e encorajador.
2. NUNCA cite doenças, diagnósticos médicos ou exames.
3. NÃO faça promessas milagrosas nem pressão excessiva de venda.
4. Linguagem brasileira em português natural e empática (com alguns emojis adequados, como 🌊, 🏊‍♂️, 💦, 💪).
5. Assine sempre com: "Prof. Henrique Aquafitness | HYDRO PERSONAL".`;

  const userPrompt = `Gere uma mensagem de WhatsApp para o(a) aluno(a) ${clientName}.
Tipo de mensagem: ${messageType}
Detalhes de contexto: ${JSON.stringify(contextDetails || {})}

Retorne um JSON com a chave "messageText".`;

  try {
    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              messageText: { type: Type.STRING },
            },
            required: ['messageText'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text?.trim() || '{"messageText":""}');
    return res.json({ success: true, messageText: parsed.messageText });
  } catch (error: any) {
    console.warn('Gemini sob alta demanda temporária no /api/gemini/message. Usando template ético:', error?.message);
    const fallbackText = getFallbackRetentionMessage(clientName, messageType);
    return res.json({ success: true, messageText: fallbackText, fallbackApplied: true });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HYDRO PERSONAL server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
