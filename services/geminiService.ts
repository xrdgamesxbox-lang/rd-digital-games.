
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
 */
export const searchGameData = async (query: string, retries = 2): Promise<ExtractedGameData | null> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "") {
    console.error("Gemini API: Chave não configurada.");
    return null;
  }

  try {
    // Fix: Using the correct initialization pattern
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = query.startsWith('http') 
      ? `Aja como um especialista em Xbox. Analise o link: "${query}". Extraia: título oficial, preço original, preço atual (promoção) e uma URL de imagem da capa (vertical).`
      : `Pesquise sobre o jogo: "${query}". Retorne: título oficial, descrição rica, preços médios e uma URL de imagem de capa vertical (poster).`;

    // Fix: Removed googleSearch tool as the guideline mentions its output may not be JSON, 
    // and this function requires structured JSON output via responseSchema.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
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
    
    // Fix: Accessing .text directly (not .text()) as per guidelines
    return JSON.parse(response.text || '{}') as ExtractedGameData;
  } catch (error: any) {
    if (error.message?.includes('429') && retries > 0) {
      await sleep(2000);
      return searchGameData(query, retries - 1);
    }
    if (error.message?.includes('429')) throw new Error("LIMITE_EXCEDIDO");
    console.error("Erro na pesquisa Gemini:", error);
    return null;
  }
};

/**
 * Gera uma descrição rica, organizada e com compatibilidade de console.
 */
export const generateGameDescription = async (title: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Descrição automática indisponível.";

  try {
    // Fix: Using the correct initialization pattern
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Aja como um redator profissional de e-commerce da loja "RD Digital Games".
      Escreva uma descrição para o jogo "${title}" seguindo RIGOROSAMENTE estas regras de organização:

      1. INTRODUÇÃO: Um parágrafo curto e impactante com emojis.
      
      2. ESPAÇAMENTO: Use SEMPRE duas quebras de linha entre cada seção para o texto não ficar junto.
      
      3. DESTAQUES: Use uma lista com o símbolo "✅" para citar 3 benefícios do jogo.
      
      4. COMPATIBILIDADE: No final do texto, adicione EXATAMENTE o bloco abaixo:
      
      Funciona em:
      - Xbox One
      - Xbox Series X
      - Xbox Series S

      Importante: Use um tom de voz épico e profissional. Não junte os parágrafos.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 800,
        temperature: 0.8,
      },
    });
    
    // Fix: Accessing .text directly (not .text()) as per guidelines
    return response.text || "Descrição indisponível.";
  } catch (error: any) {
    if (error.message?.includes('429')) return "⚠️ Limite de cota atingido. Aguarde 1 minuto.";
    return "Falha ao gerar descrição.";
  }
};
