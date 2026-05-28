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

/**
 * Asks Gemini to suggest the best 2-3 mentors from a list of candidates.
 *
 * @param {{ name: string, department: string|null, position: string|null }} newEmployee
 * @param {Array<{ employeeId, name, department, position, hireDate, completedSurveys }>} candidates
 * @returns {Promise<string>} Raw Gemini response (JSON string)
 */
async function suggestMentors(newEmployee, candidates) {
    const candidateLines = candidates.map((c) => {
        const seniority = c.hireDate
            ? `ingresó el ${c.hireDate}`
            : 'fecha de ingreso desconocida';
        return `- ID: ${c.employeeId} | ${c.name} | Dept: ${c.department ?? '—'} | Cargo: ${c.position ?? '—'} | ${seniority} | Encuestas completadas: ${c.completedSurveys}`;
    }).join('\n');

    const prompt = `Eres un sistema de recursos humanos que recomienda mentores para nuevos empleados.

Nuevo empleado:
- Nombre: ${newEmployee.name}
- Departamento: ${newEmployee.department ?? 'desconocido'}
- Cargo: ${newEmployee.position ?? 'desconocido'}

Candidatos a mentor disponibles:
${candidateLines}

Analizá los candidatos y seleccioná los mejores 2 o 3 mentores teniendo en cuenta:
- Mayor antigüedad (fecha de ingreso más temprana = más experiencia)
- Mayor cantidad de encuestas completadas (señal de compromiso)
- Afinidad de departamento o cargo con el nuevo empleado (priorizar si coincide)
- Diversidad: si es posible, incluir al menos un mentor de otro departamento

Respondé ÚNICAMENTE con JSON válido, sin texto adicional, con este formato exacto:
[
  {
    "employeeId": "uuid-aqui",
    "name": "Nombre Apellido",
    "reason": "Explicación en español de por qué es un buen mentor para este empleado."
  }
]`;

    return await generarTexto(prompt);
}

async function testGeminiConnection() {
    return await generarTexto('Respond with exactly: "Gemini connection OK"');
}

module.exports = { generarTexto, suggestMentors, testGeminiConnection };