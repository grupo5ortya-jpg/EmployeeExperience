
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define(
		'JobOpeningSkill',
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
						throw new Error('skill_id es requerido para validar required_level');
					}

					const skill = await Skill.findByPk(jobOpeningSkill.skill_id, {
						transaction: options.transaction,
					});
					if (!skill) {
						throw new Error('Skill no encontrada para skill_id proporcionado');
					}

					const levels = Array.isArray(skill.levels) ? skill.levels : [];
					const validOrders = levels
						.map(level => level && typeof level.order === 'number' ? level.order : null)
						.filter(order => order !== null);

					const requiredLevel = Number(jobOpeningSkill.required_level);

					if (!Number.isInteger(requiredLevel)) {
						throw new Error('required_level debe ser un número entero');
					}

					if (!validOrders.includes(requiredLevel)) {
						throw new Error(
							`required_level debe existir en los niveles de la skill (${skill.name}). Valores válidos: ${validOrders.join(', ')}`
						);
					}
				},
			},
		}
	);
};
