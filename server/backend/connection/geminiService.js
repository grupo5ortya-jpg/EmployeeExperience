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

/**
 * Analyzes a complete pulse survey (closed scores + open comment) to evaluate onboarding risk.
 *
 * @param {{ surveyType: string, closedAnswers: Array<{question:string, score:number}>, openComment: string|null }} payload
 * @returns {Promise<{ sentiment: string, riskLevel: string, topics: string[], summary: string, reasoning: string }>}
 */
async function analyzePulseSurvey({ surveyType, closedAnswers, openComment }) {
    const days = surveyType.replace('_DAYS', '');

    const scoresText = closedAnswers.length > 0
        ? closedAnswers.map((a) => `- "${a.question}": ${a.score}/5`).join('\n')
        : '(sin respuestas cerradas)';

    const avgScore = closedAnswers.length > 0
        ? (closedAnswers.reduce((s, a) => s + a.score, 0) / closedAnswers.length).toFixed(1)
        : null;

    const commentText = openComment
        ? `"${openComment}"`
        : '(el empleado no dejó comentario abierto)';

    const prompt = `Eres un sistema de análisis de riesgos de onboarding de RRHH.

Analizá la encuesta de pulso COMPLETA de un empleado en sus primeros ${days} días en la empresa.

RESPUESTAS CERRADAS (puntuación 1-5, donde 1=muy mal, 5=muy bien):
${scoresText}${avgScore ? `\nPromedio general: ${avgScore}/5` : ''}

COMENTARIO ABIERTO:
${commentText}

Evaluá el riesgo de onboarding considerando AMBAS fuentes de información:
1. Sentimiento general combinando puntajes y comentario
2. Nivel de riesgo: GOOD (bien integrado), MEDIUM (señales de alerta moderadas), NEGATIVE (en riesgo real)
3. Temas clave detectados (integración, apoyo, equipo, comunicación, claridad de rol, carga de trabajo, cultura, etc.)
4. Resumen contextual de la situación del empleado
5. Razonamiento explicando cómo los datos cuantitativos y cualitativos se correlacionan

Criterios de riesgo:
- GOOD: promedio >= 4.0 Y sentimiento positivo o neutral
- MEDIUM: promedio 2.5–3.9, O señales mixtas, O comentario con preocupaciones leves
- NEGATIVE: promedio < 2.5, O múltiples puntajes de 1–2, O comentario claramente negativo

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional:
{
  "sentiment": "positive" | "neutral" | "negative",
  "riskLevel": "GOOD" | "MEDIUM" | "NEGATIVE",
  "topics": ["tema1", "tema2"],
  "summary": "Resumen breve en español de la situación del empleado.",
  "reasoning": "Explicación concisa en español de cómo los datos llevaron a este nivel de riesgo."
}`;

    const raw = await generarTexto(prompt);
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(jsonStr);
}

/**
 * Generates a Feedback 360 gap analysis comparing actual vs expected competency scores.
 *
 * @param {{ employeeName: string, department: string, actualResults: object, expectedResults: object }} payload
 * @returns {Promise<{ strengths: string[], gaps: string[], suggestions: string[], summary: string }>}
 */
async function analyzeGapAnalysis({ employeeName, department, selfResults = {}, peerResults = {}, leaderResults = {}, directReportResults = {}, actualResults, expectedResults, commentsByComp = {} }) {
    const fmt = (obj) => Object.keys(obj).length
        ? Object.entries(obj).map(([k, v]) => `  - ${k}: ${v != null ? Number(v).toFixed(2) : 'N/A'} / 5`).join('\n')
        : '  (sin datos)';

    // Sources summary
    const sourceLines = [];
    if (Object.keys(selfResults).length)         sourceLines.push(`\nAUTO-EVALUACIÓN (cómo se percibe a sí mismo):\n${fmt(selfResults)}`);
    if (Object.keys(peerResults).length)         sourceLines.push(`\nEVALUACIÓN DE PARES:\n${fmt(peerResults)}`);
    if (Object.keys(leaderResults).length)       sourceLines.push(`\nEVALUACIÓN DEL LÍDER DIRECTO:\n${fmt(leaderResults)}`);
    if (Object.keys(directReportResults).length) sourceLines.push(`\nEVALUACIÓN DE REPORTES DIRECTOS:\n${fmt(directReportResults)}`);

    // Self-awareness gap (auto vs pares)
    const gapComps = [...new Set([...Object.keys(selfResults), ...Object.keys(peerResults)])];
    const hasBoth  = Object.keys(selfResults).length > 0 && Object.keys(peerResults).length > 0;
    const gapSection = hasBoth
        ? '\n\nAUTOCONCIENCIA (auto-evaluación vs percepción de pares):\n' +
          gapComps.map(k => {
              const s = selfResults[k], p = peerResults[k];
              if (s == null || p == null) return null;
              const diff = (s - p).toFixed(2);
              const dir  = s > p ? 'se sobreestima' : s < p ? 'se subestima' : 'alineado';
              return `  - ${k}: auto=${Number(s).toFixed(2)}, pares=${Number(p).toFixed(2)}, Δ=${diff} (${dir})`;
          }).filter(Boolean).join('\n')
        : '';

    const hasComments = Object.values(commentsByComp).some(arr => arr.length > 0);
    const commentsSection = hasComments
        ? '\n\nCOMENTARIOS ESCRITOS:\n' +
          Object.entries(commentsByComp)
              .filter(([, texts]) => texts.length > 0)
              .map(([compId, texts]) => `  ${compId}:\n${texts.map(t => `    · "${t}"`).join('\n')}`)
              .join('\n')
        : '';

    const prompt = `Sos un especialista en desarrollo de talento y evaluación de desempeño.

Analizá los resultados de Feedback 360° del empleado ${employeeName} del departamento ${department}.

PROMEDIO GENERAL POR COMPETENCIA (todas las fuentes combinadas):
${fmt(actualResults)}
${sourceLines.join('\n')}
PERFIL ESPERADO PARA EL DEPARTAMENTO ${department.toUpperCase()}:
${fmt(expectedResults)}${gapSection}${commentsSection}

Considerá todas las fuentes para un análisis completo y respondé ÚNICAMENTE con JSON válido:
{
  "strengths": ["fortaleza redactada en términos de competencia y comportamiento observable"],
  "gaps": ["brecha redactada en términos de competencia, sin mencionar qué fuente la detectó"],
  "suggestions": ["acción concreta y aplicable orientada al desarrollo"],
  "summary": "Resumen en 2-3 oraciones sobre el perfil general del empleado y sus oportunidades de crecimiento."
}

Criterios:
- Fortaleza: resultado ≥ esperado, o consistencia positiva entre fuentes
- Brecha: resultado < esperado en >0.3 puntos, o diferencia auto/externa >1 punto
- Autoconciencia: sobreestimación propia vs percepción externa es una brecha relevante

RESTRICCIÓN IMPORTANTE DE ANONIMATO:
En los textos de strengths, gaps, suggestions y summary NO menciones nunca:
· palabras como "líder", "pares", "pares evaluadores", "reporte directo", "evaluadores"
· frases como "tu líder piensa", "tus compañeros perciben", "según tus pares"
· ninguna referencia a qué fuente específica aportó qué puntaje
Hablá siempre en términos de competencias y comportamientos observables, de manera impersonal.
Ejemplos correctos: "Se observa consistencia en...", "Existe una oportunidad de mejora en...", "Las evaluaciones reflejan..."
Tono: constructivo, profesional y orientado al crecimiento`;

    const raw = await generarTexto(prompt);
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(jsonStr);
}

module.exports = { generarTexto, suggestMentors, testGeminiConnection, analyzePulseSurvey, analyzeGapAnalysis };