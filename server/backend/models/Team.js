const { DataTypes, Model } = require('sequelize');
const sequelize = require('../connection/sequelize');

class Team extends Model {}

Team.init({
	leader_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true
	},
	collaborator_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true
	},
	joined_at: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
}, {
	sequelize,
	modelName: 'Team',
	tableName: 'teams',
	timestamps: false,
	paranoid: true,
	schema: process.env.DB_SCHEMA || 'public',
	validate: {
		differentUsers() {
			if (this.leader_id === this.collaborator_id) {
				throw new Error('leader_id and collaborator_id must be different');
			}
		},
	},
});


Team.removeAttribute('id');


module.exports = Team;