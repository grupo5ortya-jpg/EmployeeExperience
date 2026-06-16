
const { DataTypes } = require('sequelize');
const { TASK_TYPE } = require('../utils/constants/models.constants.js');
const { SKILL } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('TaskType',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: 'unique_name_subtype',
			},
			sub_type: {
				type: DataTypes.STRING(100),
				allowNull: true,
				unique: 'unique_name_subtype',
			},
			is_protected: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			}
		},
		{
			sequelize,
			modelName: 'TaskType',
			tableName: 'task_types',
			timestamps: false,
			uniqueKeys: {
				unique_name_subtype: {
					fields: ['name', 'sub_type'],
				},
			},
			hooks: {
				afterCreate: async (taskType, options) => {
					const { Skill } = sequelize.models;

					let skillType;
					let levels;

					if (
						taskType.sub_type === TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD
					) {
						skillType = SKILL.TYPES_HARD;
						levels = SKILL.DEFAULT_HARD_LEVELS;
					}
					else if (
						taskType.sub_type === TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_SOFT
					) {
						skillType = SKILL.TYPES_SOFT;
						levels = SKILL.DEFAULT_SOFT_LEVELS;
					}
					else {
						return;
					}

					await Skill.findOrCreate({
						where: {
							name: taskType.name,
						},
						defaults: {
							type: skillType,
							levels,
						},
						transaction: options.transaction,
					});
				},
				afterUpdate: async (taskType, options) => {
					const { Skill } = sequelize.models;

					const isHard = taskType.sub_type === TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD;
					const isSoft = taskType.sub_type === TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_SOFT;

					if (!isHard && !isSoft) {
						return;
					}

					if (taskType.changed('name')) {
						const previousName = taskType.previous('name');

						await Skill.update(
							{
								name: taskType.name,
							},
							{
								where: {
									name: previousName,
								},
								transaction: options.transaction,
							}
						);
					}
				},
			},
			schema: process.env.DB_SCHEMA || 'public',
		}
	);
};
