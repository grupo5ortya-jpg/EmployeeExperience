const { Skill } = require('../connection/sequelize');

module.exports = {

    async getAll(req, res) {
        try {
            const data = await Skill.findAll();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async create(req, res) {
        try {
            const skill = await Skill.create(req.body);
            res.status(201).json(skill);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};