const { generarTexto } = require('../connection/geminiService.js'); // Ajusta la ruta según dónde guardaste el servicio

async function preguntarAGemini(req, res, next) {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "El campo 'prompt' es requerido." });
        }

        const respuestaIA = await generarTexto(prompt);

        return res.json({
            success: true,
            respuesta: respuestaIA
        });

    } catch (error) {
        // Al usar next(error), Express enviará el fallo directamente
        // al errorHandler que tienes configurado en tu server.js
        next(error);
    }
}

module.exports = {
    preguntarAGemini
};