const { type } = require("node:os");

module.exports = async function (sequelize) {
    const Skill = sequelize.models.Skill;

    await Skill.bulkCreate([
        // HARD
        { name: 'Node.js', type: 'hard' },
        { name: 'React', type: 'hard' },
        { name: 'PostgreSQL', type: 'hard' },
        { name: 'Docker', type: 'hard' },
        { name: 'Sequelize ORM', type: 'hard' },

        // SOFT
        { name: 'Communication', type: 'soft' },
        { name: 'Teamwork', type: 'soft' },
        { name: 'Problem Solving', type: 'soft' },
        { name: 'Time Management', type: 'soft' },
        { name: 'Adaptability', type: 'soft' },
        { name: 'Leadership', type: 'soft' },
        { name: 'Problem solving', type: 'soft' },
        { name: 'Proactivity', type: 'soft' },
        { name: 'Results oriented', type: 'soft' }

    ]);
};
