const { GoogleGenAI } = require('@google/genai');

// Le pasamos explícitamente un objeto con la estructura que la librería espera,
// asegurándonos de que 'options' no sea undefined y mapeando tu API Key.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    project: undefined,
    location: undefined
});

// generarTexto() es el único punto por el que pasan las 4 funciones que llaman a Gemini
// (suggestMentors, analyzePulseSurvey, analyzeGapAnalysis, generateCareerPlan) — varias se
// invocan de forma síncrona dentro de un request HTTP (gap-analysis, mentor-suggestions,
// career-simulator). Sin timeout, un colgazo del proveedor deja ese request esperando para
// siempre. 30s da margen para prompts grandes (gap-analysis con muchos comentarios, career-plan
// con varias skills) sin dejar al usuario esperando indefinidamente ni agotar recursos del
// servidor (worker de Node + conexión a BD si hay una transacción abierta).
const GEMINI_TIMEOUT_MS = 30_000;

// Strip markdown code fences if Gemini wraps the response, then parse the JSON
function parseGeminiJson(raw) {
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(jsonStr);
}

async function generarTexto(prompt) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ Advertencia: process.env.GEMINI_API_KEY no está definida. Revisa tu archivo .env");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { abortSignal: controller.signal },
        });
        return response.text;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`Gemini Service: timeout esperando respuesta (>${GEMINI_TIMEOUT_MS}ms)`);
            const timeoutError = new Error('El servicio de IA no respondió a tiempo. Intentá de nuevo en unos minutos.');
            timeoutError.statusCode = 504;
            throw timeoutError;
        }
        console.error("Error en Gemini Service:", error);
        throw error;
    } finally {
        clearTimeout(timeoutId);
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
        const performance = c.feedbackAverage != null ? `\n  Promedio de feedback 360° recibido: ${c.feedbackAverage}/5` : '';
        return `- ID: ${c.employeeId}
  Nombre: ${c.name}
  Departamento: ${c.department ?? '—'}${sameDept} | Cargo: ${c.position ?? '—'}
  ${seniority} | Encuestas completadas: ${c.completedSurveys}${performance}`;
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
5. Desempeño (feedback 360°) — candidatos con mejor promedio de feedback recibido son mentores más confiables, cuando el dato está disponible

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
    return parseGeminiJson(raw);
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
    return parseGeminiJson(raw);
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
    return parseGeminiJson(raw);
}

/**
 * Generates a personalized career development plan based on the skill gap
 * between an employee's current skills and the requirements of a target position.
 *
 * @param {{ employeeName: string, currentPosition: string|null, targetPosition: string, targetDepartment: string|null, gapSnapshot: object }} payload
 * @returns {Promise<{ summary: string, actions: Array, estimatedMonths: number }>}
 */
async function generateCareerPlan({ employeeName, currentPosition, targetPosition, targetDepartment, gapSnapshot }) {
    const { covered = [], gaps = [], missing = [] } = gapSnapshot;

    const coveredLines = covered.length
        ? covered.map((s) => `  ✓ ${s.skillName} (${s.skillType}) — nivel actual: ${s.currentLevelName}, requerido: ${s.requiredLevelName}`).join('\n')
        : '  (ninguna skill ya cumple el nivel requerido)';

    const gapLines = gaps.length
        ? gaps.map((s) => `  ⚠ ${s.skillName} (${s.skillType}) — nivel actual: ${s.currentLevelName}, requerido: ${s.requiredLevelName}`).join('\n')
        : '  (ninguna)';

    const missingLines = missing.length
        ? missing.map((s) => `  ✗ ${s.skillName} (${s.skillType}) — nivel requerido: ${s.requiredLevelName} (el empleado no la tiene)`).join('\n')
        : '  (ninguna)';

    const prompt = `Sos un especialista en desarrollo de carrera y planificación de talento.

Empleado: ${employeeName}
Cargo actual: ${currentPosition ?? 'no especificado'}
Puesto objetivo: ${targetPosition}${targetDepartment ? ` (departamento: ${targetDepartment})` : ''}

ANÁLISIS DE BRECHA DE SKILLS:

Skills que ya cumplen el nivel requerido:
${coveredLines}

Skills por debajo del nivel requerido:
${gapLines}

Skills faltantes (el empleado no las tiene):
${missingLines}

Generá un plan de desarrollo personalizado y accionable para que ${employeeName} alcance el puesto de ${targetPosition}.

El plan debe incluir:
1. Un resumen en 2-3 oraciones sobre la situación actual y el camino propuesto.
2. Entre 3 y 6 acciones concretas priorizadas. Cada acción puede ser de tipo:
   - "course": un curso o capacitación para desarrollar una skill específica (incluí el skillId y skillName de la skill a desarrollar cuando aplique)
   - "experience": una experiencia práctica, proyecto o responsabilidad a asumir
   - "soft_skill": un hábito, comportamiento o habilidad blanda a desarrollar
3. Una estimación realista de meses para alcanzar el puesto objetivo.

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional:
{
  "summary": "Resumen en español...",
  "actions": [
    {
      "type": "course",
      "title": "Nombre corto de la acción",
      "description": "Descripción concreta de qué hacer y por qué ayuda",
      "skillId": "uuid-de-la-skill-o-null",
      "skillName": "nombre-de-la-skill-o-null",
      "priority": "high"
    }
  ],
  "estimatedMonths": 6
}

Criterios:
- Prioridad "high": skills faltantes o con brecha grande (>2 niveles)
- Prioridad "medium": skills con brecha moderada (1-2 niveles) o experiencias clave
- Prioridad "low": soft skills y mejoras complementarias
- Para acciones tipo "course": usá el skillId y skillName exactos del gap análisis cuando corresponda; para cursos generales sin skill específica usá null
- Estimación de meses: realista considerando la cantidad y profundidad de brechas (mínimo 2, máximo 36)
- Tono: profesional, constructivo, orientado al crecimiento`;

    const raw = await generarTexto(prompt);
    return parseGeminiJson(raw);
}

module.exports = { generarTexto, suggestMentors, testGeminiConnection, analyzePulseSurvey, analyzeGapAnalysis, generateCareerPlan };