
import { GoogleGenAI, Type } from "@google/genai";

// Shim para evitar crash se process não estiver definido no navegador
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { API_KEY: '' } };
}

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
 * Funciona com URLs ou apenas com o título do jogo.
 */
export const searchGameData = async (query: string): Promise<ExtractedGameData | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Prompt aprimorado para busca ativa na internet
    const prompt = query.startsWith('http') 
      ? `Analise este link: "${query}". Extraia título, preços e encontre a URL de uma imagem de capa (poster vertical oficial).`
      : `Pesquise na internet sobre o jogo: "${query}". 
         Sua missão:
         1. Encontrar o título oficial exato.
         2. Criar uma descrição curta (3 frases) em português.
         3. Buscar o preço original e atual médio no Xbox/Steam.
         4. ENCONTRAR UMA URL DE IMAGEM VÁLIDA (Poster vertical/Capa oficial). 
            Priorize links que terminem em .jpg ou .png de CDNs oficiais (Xbox, Steam, Epic).
         Retorne EXCLUSIVAMENTE em JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Ativa a busca no Google para encontrar dados reais e imagens
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
    
    const result = JSON.parse(response.text || '{}');
    
    // Fallback: se a IA não retornar uma URL de imagem válida, tentamos limpar
    if (result.image_url && !result.image_url.startsWith('http')) {
      result.image_url = `https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2069&auto=format&fit=crop`;
    }

    return result as ExtractedGameData;
  } catch (error) {
    console.error("Erro na pesquisa por IA:", error);
    return null;
  }
};

export const generateGameDescription = async (title: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva uma breve e empolgante descrição de marketing em português brasileiro para o jogo "${title}" no Xbox. Foque em recursos de nova geração.`,
      config: {
        maxOutputTokens: 300,
        thinkingConfig: { thinkingBudget: 100 },
        temperature: 0.8,
      },
    });
    return response.text || "Descrição não disponível.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Falha ao gerar descrição automaticamente.";
  }
};
