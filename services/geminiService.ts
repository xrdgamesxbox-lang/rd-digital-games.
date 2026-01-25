
import { GoogleGenAI, Type } from "@google/genai";

export interface ExtractedGameData {
  title: string;
  description: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  image_url: string;
}

/**
 * Busca informações de um jogo usando Gemini 3 Flash.
 * A chave é obtida exclusivamente via process.env.API_KEY injetada pelo Vite.
 */
export const searchGameData = async (query: string): Promise<ExtractedGameData | null> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "") {
    console.error("Gemini API: Chave não configurada no ambiente.");
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
  } catch (error) {
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
  } catch (error) {
    return "Falha ao gerar descrição.";
  }
};
