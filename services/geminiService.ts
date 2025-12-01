import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMarketingStrategy = async (niche: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      Ты ведущий маркетолог агентства Valstand.
      Пользователь ввел свою нишу бизнеса: "${niche}".
      
      Кратко (максимум 150 слов) предложи 3 конкретные, креативные идеи для продвижения этой ниши в современных реалиях (Яндекс, ВК, Telegram).
      Используй списки и форматирование. Тон должен быть профессиональным, вдохновляющим и экспертным.
      В конце добавь призыв записаться на полную консультацию.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Не удалось сгенерировать стратегию. Пожалуйста, попробуйте позже.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Ошибка при генерации стратегии");
  }
};