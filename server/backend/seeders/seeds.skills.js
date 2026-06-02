
module.exports = async function (sequelize) {
	const Skill = sequelize.models.Skill;

	const count = await Skill.count();
	if (count > 0) return;

	await Skill.bulkCreate([
		// HARD
		{ name: 'Node.js', type: 'hard', levels: [ { "name": "Intern", "order": 1 }, { "name": "Junior", "order": 2 }, { "name": "SemiSenior", "order": 3 }, { "name": "Senior", "order": 4 }, { "name": "Expert", "order": 5 } ] },
		{ name: 'React', type: 'hard', levels: [ { "name": "Intern", "order": 1 }, { "name": "Junior", "order": 2 }, { "name": "SemiSenior", "order": 3 }, { "name": "Senior", "order": 4 }, { "name": "Expert", "order": 5 } ] },
		{ name: 'PostgreSQL', type: 'hard', levels: [ { "name": "Intern", "order": 1 }, { "name": "Junior", "order": 2 }, { "name": "SemiSenior", "order": 3 }, { "name": "Senior", "order": 4 }, { "name": "Expert", "order": 5 } ] },
		{ name: 'Docker', type: 'hard', levels: [ { "name": "Intern", "order": 1 }, { "name": "Junior", "order": 2 }, { "name": "SemiSenior", "order": 3 }, { "name": "Senior", "order": 4 }, { "name": "Expert", "order": 5 } ] },
		{ name: 'Sequelize ORM', type: 'hard', levels: [ { "name": "Intern", "order": 1 }, { "name": "Junior", "order": 2 }, { "name": "SemiSenior", "order": 3 }, { "name": "Senior", "order": 4 }, { "name": "Expert", "order": 5 } ] },

		// SOFT
		{ name: 'Communication', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Teamwork', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Problem Solving', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Time Management', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Adaptability', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Leadership', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Problem solving', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Proactivity', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'Results oriented', type: 'soft', levels: [ { "name": "Basic", "order": 1 }, { "name": "Intermediate", "order": 2 }, { "name": "Advanced", "order": 3 }, { "name": "Expert", "order": 4 } ] },
		{ name: 'English', type: 'soft', levels: [ { "name": "A1", "order": 1 }, { "name": "A2", "order": 2 }, { "name": "B1", "order": 3 }, { "name": "B2", "order": 4 }, { "name": "C1", "order": 5 }, { "name": "C2", "order": 6 } ] },

	]);
};
