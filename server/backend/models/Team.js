
const { DataTypes } = require('sequelize');
const { TEAM_ERR } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	const validateTeamMembers = async (team, options) => {
		const { Employee, User, Role, Team } = sequelize.models;
		const transaction = options.transaction;

		if (!Employee || !User || !Role || !Team) return;

		if (!team.leader_id || !team.collaborator_id) {
			throw new Error(TEAM_ERR.LEADER_AND_COLLABORATOR_REQUIRED);
		}

		if (team.leader_id === team.collaborator_id) {
			throw new Error(TEAM_ERR.LEADER_AND_COLLABORATOR_MUST_BE_DIFFERENT);
		}

		const [leader, collaborator] = await Promise.all([
			Employee.findByPk(team.leader_id, { transaction }),
			Employee.findByPk(team.collaborator_id, { transaction }),
		]);

		if (!leader) {
			throw new Error(TEAM_ERR.LEADER_NOT_FOUND);
		}

		if (!collaborator) {
			throw new Error(TEAM_ERR.COLLABORATOR_NOT_FOUND);
		}

		if (team.isNewRecord || team.changed('leader_id')) {
			const user = await User.findOne({ where: { employee_id: team.leader_id }, transaction });
			if (!user) {
				throw new Error(TEAM_ERR.LEADER_MUST_HAVE_LEADER_ROLE);
			}

			const role = await Role.findByPk(user.role_id, { transaction });
			if (!role || role.name !== 'Líder') {
				throw new Error(TEAM_ERR.LEADER_MUST_HAVE_LEADER_ROLE);
			}
		}

		if (team.isNewRecord || team.changed('collaborator_id')) {
			const existingMembership = await Team.findOne({
				where: {
					[sequelize.Sequelize.Op.or]: [
						{ leader_id: team.collaborator_id },
						{ collaborator_id: team.collaborator_id },
					],
				},
				transaction,
			});

			if (existingMembership) {
				throw new Error(TEAM_ERR.COLLABORATOR_ALREADY_ASSIGNED);
			}
		}
	};

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
			hooks: {
				beforeSave: validateTeamMembers,
			},
			validate: {
				differentUsers() {
					if (this.leader_id === this.collaborator_id) {
						throw new Error(TEAM_ERR.LEADER_AND_COLLABORATOR_MUST_BE_DIFFERENT);
					}
				},
			},
		}
	);

	Team.removeAttribute('id');

	return Team;
};
