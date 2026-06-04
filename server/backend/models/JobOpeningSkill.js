
const { DataTypes } = require('sequelize');
const { JOB_OPENING_SKILL_ERR } = require('../utils/constants/messages.constants.js').ERRORS.MODEL;


module.exports = (sequelize) => {
	sequelize.define('JobOpeningSkill',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			job_opening_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			skill_id: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			required_level: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
		},
		{
			sequelize,
			modelName: 'JobOpeningSkill',
			tableName: 'job_opening_skills',
			timestamps: true,
			paranoid: true,
			schema: process.env.DB_SCHEMA || 'public',
			hooks: {
				beforeValidate: async (jobOpeningSkill, options) => {
					const Skill = sequelize.models.Skill;
					if (!Skill) return;

					if (!jobOpeningSkill.skill_id) {
						throw new Error(JOB_OPENING_SKILL_ERR.SKILL_ID_REQUIRED_FOR_LEVEL_VALIDATION);
					}

					const skill = await Skill.findByPk(jobOpeningSkill.skill_id, {
						transaction: options.transaction,
					});
					if (!skill) {
						throw new Error(JOB_OPENING_SKILL_ERR.SKILL_NOT_FOUND);
					}

					const levels = Array.isArray(skill.levels) ? skill.levels : [];
					const validOrders = levels
						.map(level => level && typeof level.order === 'number' ? level.order : null)
						.filter(order => order !== null);

					const requiredLevel = Number(jobOpeningSkill.required_level);

					if (!Number.isInteger(requiredLevel)) {
						throw new Error(JOB_OPENING_SKILL_ERR.REQUIRED_LEVEL_MUST_BE_INTEGER);
					}

					if (!validOrders.includes(requiredLevel)) {
						throw new Error(JOB_OPENING_SKILL_ERR.REQUIRED_LEVEL_NOT_IN_SKILL_LEVELS);
					}
				},
			},
		}
	);
};
