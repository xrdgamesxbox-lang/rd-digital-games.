
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
    // Se o erro for de limite de cota (429) e ainda houver tentativas
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

export const generateGameDescription = async (title: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Descrição automática indisponível.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva uma descrição empolgante para a loja RD Digital Games sobre o jogo "${title}".`,
      config: {
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    return response.text || "Descrição indisponível.";
  } catch (error: any) {
    if (error.message?.includes('429')) return "Limite de criação de descrições atingido por este minuto. Tente novamente em breve.";
    return "Falha ao gerar descrição.";
  }
};
