
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
 * Busca informações de um jogo usando IA + Google Search.
 */
export const searchGameData = async (query: string): Promise<ExtractedGameData | null> => {
  // Criamos a instância aqui para garantir que ela pegue a chave injetada pelo Vite
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API_KEY não encontrada no ambiente.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = query.startsWith('http') 
      ? `Analise este link: "${query}". Extraia título oficial, preços originais e atuais do Xbox, e a URL de uma imagem de capa vertical (poster).`
      : `Pesquise sobre o jogo: "${query}". Retorne título oficial, descrição curta em PT-BR, preços médios e URL de imagem de capa vertical oficial.`;

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
    console.error("Erro na pesquisa por IA:", error);
    return null;
  }
};

export const generateGameDescription = async (title: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Descrição não disponível.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva uma descrição épica e vendedora para o jogo "${title}" no Xbox.`,
      config: {
        maxOutputTokens: 300,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return response.text || "Descrição não disponível.";
  } catch (error) {
    return "Falha ao gerar descrição.";
  }
};
