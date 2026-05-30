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

/** 2 preguntas por competencia (fuente: DB tabla questions, QuestionType name='Feedback360') */
export function countQuestions(competencyIds = []) {
    return competencyIds.length * 2
}
