
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const Team = sequelize.define('Team',
		{
			leader_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true
			},
			collaborator_id: {
				type: DataTypes.UUID,
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
		}
	);

	Team.removeAttribute('id');

	return Team;
};