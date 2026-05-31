const { JobOpening, Skill, JobOpeningSkill, Department } = require('../connection/sequelize');

module.exports = {

    async getAll(req, res) {
        try {
            const data = await JobOpening.findAll({
                include: [
                    { model: Department, as: 'department' },
                    {
                        model: Skill,
                        as: 'skills',
                        through: { attributes: ['requiredLevel'] },
                    },
                ],
            });

            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;

            const data = await JobOpening.findByPk(id, {
                include: [
                    { model: Department, as: 'department' },
                    {
                        model: Skill,
                        as: 'skills',
                        through: { attributes: ['requiredLevel'] },
                    },
                ],
            });

            if (!data) return res.status(404).json({ message: 'Not found' });

            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async create(req, res) {
        try {
            const { title, description, departmentId, skills } = req.body;

            const job = await JobOpening.create({
                title,
                description,
                departmentId,
            });

            if (skills && skills.length) {
                const records = skills.map((s) => ({
                    jobOpeningId: job.id,
                    skillId: s.skillId,
                    requiredLevel: s.requiredLevel,
                }));

                await JobOpeningSkill.bulkCreate(records);
            }

            const result = await JobOpening.findByPk(job.id, {
                include: [
                    {
                        model: Skill,
                        as: 'skills',
                        through: { attributes: ['requiredLevel'] },
                    },
                ],
            });

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;

            const job = await JobOpening.findByPk(id);
            if (!job) return res.status(404).json({ message: 'Not found' });

            await job.update(req.body);

            res.json(job);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async remove(req, res) {
        try {
            const { id } = req.params;

            const job = await JobOpening.findByPk(id);
            if (!job) return res.status(404).json({ message: 'Not found' });

            await job.destroy();

            res.json({ message: 'Deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}