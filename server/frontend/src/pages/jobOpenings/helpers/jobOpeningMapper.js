export const mapJobOpeningPayload = (form, skills) => ({
    title: form.title,
    description: form.description,
    departmentId: form.departmentId || null,
    status: form.status || 'open',
    skills: skills.map(s => ({
        skillId: s.skillId,
        requiredLevel: Number(s.requiredLevel),
    })),
})