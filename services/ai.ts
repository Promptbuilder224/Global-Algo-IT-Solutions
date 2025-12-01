
import { GoogleGenAI } from '@google/genai';
import { logError } from '../utils/errorHandler';

// Initialize the client securely
const getAiClient = () => {
    // In a real app, ensure API_KEY is defined.
    // Assuming process.env.API_KEY is available via Vite env vars (VITE_API_KEY usually, but following prompts convention)
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const aiService = {
    async generateContent(prompt: string, model: string = 'gemini-2.5-flash') {
        try {
            const ai = getAiClient();
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt
            });
            return response.text;
        } catch (error) {
            logError(error, 'AIService:generateContent');
            throw error;
        }
    }
};
