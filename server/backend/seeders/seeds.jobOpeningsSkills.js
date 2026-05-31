module.exports = async (sequelize) => {
    const { JobOpening, Skill, JobOpeningSkill } = sequelize.models;

    const openings = await JobOpening.findAll();
    const skills = await Skill.findAll();

    await JobOpeningSkill.bulkCreate([
        {
            jobOpeningId: openings[0].id,
            skillId: skills[0].id,
            requiredLevel: 4,
        },
        {
            jobOpeningId: openings[0].id,
            skillId: skills[1].id,
            requiredLevel: 3,
        },
        {
            jobOpeningId: openings[0].id,
            skillId: skills[2].id,
            requiredLevel: 5,
        },
        {
            jobOpeningId: openings[1].id,
            skillId: skills[3].id,
            requiredLevel: 2,
        },
        {
            jobOpeningId: openings[1].id,
            skillId: skills[4].id,
            requiredLevel: 4,
        },
        {
            jobOpeningId: openings[2].id,
            skillId: skills[5].id,
            requiredLevel: 5,
        },
    ]);

    console.log('JobOpeningSkills seeded');
};