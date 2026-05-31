export const SKILL_LEVEL_LABEL = {
    1: 'Beginner',
    2: 'Junior',
    3: 'Semi Senior',
    4: 'Senior',
    5: 'Expert',
}

export const SKILL_LEVEL_STYLE = {
    1: 'bg-slate-100 text-slate-600',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-sky-100 text-sky-700',
    4: 'bg-violet-100 text-violet-700',
    5: 'bg-amber-100 text-amber-700',
}

export const getSkillLevelLabel = (level) =>
    SKILL_LEVEL_LABEL[level] ?? '-'

export const getSkillLevelStyle = (level) =>
    SKILL_LEVEL_STYLE[level] ?? 'bg-slate-100 text-slate-500'