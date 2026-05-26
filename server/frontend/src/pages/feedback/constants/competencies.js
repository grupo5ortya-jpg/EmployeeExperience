import {
    MessageSquare, Award, Users, Lightbulb,
    Zap, RefreshCw, Target,
} from 'lucide-react'

/* ─── Definición canónica de competencias ─────────────────────────────────
   Fuente única compartida por FeedbackHome, CreateFeedback y FeedbackDetailPage.
   Cada competencia tiene: id, label, description, Icon (Lucide).
────────────────────────────────────────────────────────────────────────── */
export const COMPETENCIES = [
    {
        id:          'communication',
        label:       'Comunicación',
        description: 'Claridad y efectividad al transmitir ideas',
        Icon:        MessageSquare,
    },
    {
        id:          'leadership',
        label:       'Liderazgo',
        description: 'Capacidad de guiar, motivar e inspirar',
        Icon:        Award,
    },
    {
        id:          'teamwork',
        label:       'Trabajo en equipo',
        description: 'Colaboración y aporte al grupo',
        Icon:        Users,
    },
    {
        id:          'problem_solving',
        label:       'Resolución de problemas',
        description: 'Abordaje creativo y efectivo de desafíos',
        Icon:        Lightbulb,
    },
    {
        id:          'proactivity',
        label:       'Proactividad',
        description: 'Iniciativa y anticipación de situaciones',
        Icon:        Zap,
    },
    {
        id:          'adaptability',
        label:       'Adaptabilidad',
        description: 'Flexibilidad ante cambios y presión',
        Icon:        RefreshCw,
    },
    {
        id:          'results',
        label:       'Orientación a resultados',
        description: 'Compromiso y consistencia en los entregables',
        Icon:        Target,
    },
]

/** Lookup O(1): id → { label, description, Icon } */
export const COMPETENCY_MAP = Object.fromEntries(
    COMPETENCIES.map((c) => [c.id, c]),
)

/* ─── Preguntas por competencia (2 por cada una, escala 1–5) ─────────── */
export const QUESTIONS_BY_COMPETENCY = {
    communication: [
        '¿Cómo evaluás las habilidades de comunicación de esta persona?',
        '¿Con qué claridad comparte información con el resto del equipo?',
    ],
    leadership: [
        '¿Cómo valorás la capacidad de liderazgo de esta persona?',
        '¿En qué medida motiva e inspira a sus compañeros de equipo?',
    ],
    teamwork: [
        '¿Qué tan efectivamente colabora esta persona con el equipo?',
        '¿Cómo contribuye al clima de trabajo y la cohesión grupal?',
    ],
    problem_solving: [
        '¿Qué tan efectiva es esta persona al resolver problemas complejos?',
        '¿Con qué creatividad aborda situaciones o desafíos inesperados?',
    ],
    proactivity: [
        '¿Qué tan proactiva es esta persona en sus iniciativas?',
        '¿Con qué frecuencia identifica mejoras sin que se le solicite?',
    ],
    adaptability: [
        '¿Cómo se adapta esta persona ante cambios o nuevas situaciones?',
        '¿Qué tan bien maneja la presión y la incertidumbre en el trabajo?',
    ],
    results: [
        '¿Qué tan comprometida está esta persona con los resultados del equipo?',
        '¿Qué tan consistentemente cumple sus objetivos y entregables?',
    ],
}

/**
 * Devuelve el total de preguntas para un conjunto de IDs de competencias.
 * @param {string[]} competencyIds
 * @returns {number}
 */
export function countQuestions(competencyIds = []) {
    return competencyIds.reduce(
        (acc, id) => acc + (QUESTIONS_BY_COMPETENCY[id]?.length ?? 0),
        0,
    )
}
