const { GoogleGenAI } = require('@google/genai');

// Le pasamos explícitamente un objeto con la estructura que la librería espera,
// asegurándonos de que 'options' no sea undefined y mapeando tu API Key.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    project: undefined,
    location: undefined
});

async function generarTexto(prompt) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ Advertencia: process.env.GEMINI_API_KEY no está definida. Revisa tu archivo .env");
        }

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
 * Asks Gemini to recommend the best 2-3 mentors for a new employee.
 *
 * @param {{ name: string, department: string|null, position: string|null }} newEmployee
 * @param {Array} candidates - real DB candidates from buildMentorCandidates
 * @returns {Promise<Array<{ employeeId, name, reason }>>}
 */
async function suggestMentors(newEmployee, candidates) {
    const candidateLines = candidates.map((c) => {
        const hireYear = c.hireDate ? new Date(c.hireDate).getFullYear() : null;
        const seniority = hireYear ? `Ingresó en ${hireYear}` : 'Antigüedad desconocida';
        const sameDept = c.department === newEmployee.department ? ' ✓ mismo departamento' : '';
        return `- ID: ${c.employeeId}
  Nombre: ${c.name}
  Departamento: ${c.department ?? '—'}${sameDept} | Cargo: ${c.position ?? '—'}
  ${seniority} | Encuestas completadas: ${c.completedSurveys}`;
    }).join('\n\n');

    const prompt = `Eres un sistema de recursos humanos especializado en programas de mentoring.

Nuevo empleado que necesita un mentor:
- Nombre: ${newEmployee.name}
- Departamento: ${newEmployee.department ?? 'desconocido'}
- Cargo: ${newEmployee.position ?? 'desconocido'}

Candidatos disponibles para ser mentor:
${candidateLines}

Criterios de selección (en orden de prioridad):
1. Mismo departamento — permite mentoring técnico específico al rol
2. Antigüedad — candidatos con más años en la empresa tienen mayor contexto organizacional
3. Encuestas completadas — indica mayor engagement con los procesos de la empresa
4. Compatibilidad de cargo — cargo complementario al del nuevo empleado

Seleccioná los mejores 2 o 3 mentores y explicá brevemente por qué cada uno es adecuado.

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, con este formato exacto:
[
  {
    "employeeId": "id-del-candidato",
    "name": "Nombre Apellido",
    "reason": "Explicación concisa en español de por qué es el mentor ideal para este empleado."
  }
]`;

    const raw = await generarTexto(prompt);

    // Strip markdown code fences if Gemini wraps the response
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(jsonStr);
}

async function testGeminiConnection() {
    return await generarTexto('Respond with exactly: "Gemini connection OK"');
}

module.exports = { generarTexto, suggestMentors, testGeminiConnection };