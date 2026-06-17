
const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
	sequelize.define('CareerPlan', {
		id: {
			type:         DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey:   true,
		},
		employee_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		job_opening_id: {
			type:      DataTypes.UUID,
			allowNull: false,
		},
		gap_snapshot: {
			type:         DataTypes.JSONB,
			allowNull:    false,
			defaultValue: {},
		},
		plan: {
			type:         DataTypes.JSONB,
			allowNull:    false,
			defaultValue: {},
		},
		generated_at: {
			type:         DataTypes.DATE,
			allowNull:    false,
			defaultValue: DataTypes.NOW,
		},
	}, {
		sequelize,
		modelName: 'CareerPlan',
		tableName: 'career_plans',
		timestamps: true,
		schema:     process.env.DB_SCHEMA || 'public',
	});
};
