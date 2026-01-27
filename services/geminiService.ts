
import { GoogleGenAI, Type } from "@google/genai";

export interface ExtractedGameData {
  title: string;
  description: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  image_url: string;
  error?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Busca informações de um jogo usando Gemini.
 * Inclui tratamento para erro 429 (Limite de requisições).
 */
export const searchGameData = async (query: string, retries = 2): Promise<ExtractedGameData | null> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "") {
    console.error("Gemini API: Chave não configurada.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = query.startsWith('http') 
      ? `Aja como um especialista em Xbox. Analise o link: "${query}". Extraia: título oficial, preço original, preço atual (promoção) e uma URL de imagem da capa (vertical).`
      : `Pesquise sobre o jogo: "${query}". Retorne: título oficial, descrição de 3 frases em PT-BR, preços médios e uma URL de imagem de capa vertical (poster).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            original_price: { type: Type.NUMBER },
            current_price: { type: Type.NUMBER },
            discount_percentage: { type: Type.INTEGER },
            image_url: { type: Type.STRING }
          },
          required: ["title", "description", "original_price", "current_price", "discount_percentage", "image_url"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}') as ExtractedGameData;
  } catch (error: any) {
    if (error.message?.includes('429') && retries > 0) {
      console.warn(`Limite de cota atingido. Tentando novamente em 2 segundos... (${retries} restantes)`);
      await sleep(2000);
      return searchGameData(query, retries - 1);
    }

    if (error.message?.includes('429')) {
      throw new Error("LIMITE_EXCEDIDO");
    }

    console.error("Erro na pesquisa Gemini:", error);
    return null;
  }
};

/**
 * Gera uma descrição rica e organizada para o jogo.
 */
export const generateGameDescription = async (title: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Descrição automática indisponível.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Novo prompt estruturado para melhor organização e inclusão de consoles
    const prompt = `
      Aja como um redator profissional de e-commerce especializado em Xbox. 
      Escreva uma descrição empolgante, persuasiva e bem organizada para o jogo "${title}".
      
      Siga exatamente este formato:
      1. Comece com um parágrafo curto de introdução com emojis.
      2. Liste 3 a 4 principais destaques do jogo em bullet points (•).
      3. No final, adicione OBRIGATORIAMENTE uma seção chamada "Funciona em:" listando:
         - Xbox One
         - Xbox Series X|S
      
      Mantenha o tom de voz épico e profissional da RD Digital Games.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 600,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    
    return response.text || "Descrição indisponível no momento.";
  } catch (error: any) {
    if (error.message?.includes('429')) {
      return "⚠️ Limite de cota atingido. Por favor, aguarde 1 minuto para gerar novas descrições via IA.";
    }
    console.error("Erro ao gerar descrição:", error);
    return "Falha ao gerar descrição. Tente preencher manualmente.";
  }
};
