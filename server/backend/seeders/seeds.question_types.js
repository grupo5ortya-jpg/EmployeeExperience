
module.exports = async function (sequelize) {
	const { QuestionType } = sequelize.models;

	const count = await QuestionType.count();
	if (count > 0) {
		return;
	}

	const questionTypes = [
		{ name: 'Onboarding',  sub_type: 'Bienvenida'    },
		{ name: 'Pulso',       sub_type: 'Clima'          },
		{ name: 'Pulso',       sub_type: '30'             },
		{ name: 'Pulso',       sub_type: '60'             },
		{ name: 'Pulso',       sub_type: '90'             },
		{ name: 'Offboarding', sub_type: 'Salida'         },
		{ name: 'Alumni',      sub_type: 'Reencuentro'    },
		// Feedback 360° — one QuestionType per competency (sub_type = competency id)
		{ name: 'Feedback360', sub_type: 'communication'  },
		{ name: 'Feedback360', sub_type: 'leadership'     },
		{ name: 'Feedback360', sub_type: 'teamwork'       },
		{ name: 'Feedback360', sub_type: 'problem_solving'},
		{ name: 'Feedback360', sub_type: 'proactivity'    },
		{ name: 'Feedback360', sub_type: 'adaptability'   },
		{ name: 'Feedback360', sub_type: 'results'        },
	];

	await QuestionType.bulkCreate(questionTypes, { individualHooks: true });
};
