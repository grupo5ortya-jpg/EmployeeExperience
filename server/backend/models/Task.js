
const { DataTypes } = require('sequelize');
const { TASK } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('Task',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			task_type_id: {
				type: DataTypes.UUID,
				allowNull: false
			},
			estimated_duration: {
				type: DataTypes.INTEGER,
				allowNull: true,
				validate: {
					min: TASK.ESTIMATED_DURATION.MIN,
				},
				comment: TASK.ESTIMATED_DURATION.COMMENT,
			},
			// Campos de catálogo de Learning (sub_type 'Curso'): duration es texto libre (ej. "12 horas"),
			// distinto de estimated_duration (días, usado para due_date de onboarding)
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			duration: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			modality: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			link: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			skill_id: {
				type: DataTypes.UUID,
				allowNull: true,
			},
			// Certificaciones externas subidas por el empleado (no forman parte del catálogo de cursos)
			is_external: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			institution: {
				type: DataTypes.STRING(150),
				allowNull: true,
			}
		},
		{
			sequelize,
			modelName: 'Task',
			tableName: 'tasks',
			timestamps: false,
			paranoid: true,
			uniqueKeys: {
				unique_name_type: {
					fields: ['name', 'task_type_id'],
				},
			},
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
