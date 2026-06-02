export const mapJobOpeningPayload = (form, skills) => ({
    title: form.title,
    description: form.description,
    departmentId: form.departmentId || null,
    status: form.status || 'open',
    skills: skills.map(s => ({
        skill_id: s.skill_id,
        required_level: Number(s.required_level),
    })),
})