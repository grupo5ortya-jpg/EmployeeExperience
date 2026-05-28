const { GoogleGenAI } = require('@google/genai');

// Recuerda configurar GEMINI_API_KEY en tu archivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generarTexto(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error en Gemini Service:", error);
        throw error;
    }
}

module.exports = { generarTexto };