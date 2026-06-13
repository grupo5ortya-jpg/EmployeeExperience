const { TaskType } = require('../connection/sequelize');
const { TASK_TYPE } = require('./constants/models.constants.js');

// "Curso" es la TaskType usada como catálogo de Learning; se reusa siempre la misma
// (incluye cursos internos y certificaciones externas, ver Task.is_external)
async function getCourseTaskType() {
	const [taskType] = await TaskType.findOrCreate({
		where: { sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_COURSE },
		defaults: { name: 'Aprendizaje - curso', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_COURSE },
	});
	return taskType;
}

module.exports = { getCourseTaskType };
