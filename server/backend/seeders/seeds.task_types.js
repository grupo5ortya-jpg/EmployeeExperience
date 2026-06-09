
module.exports = async function (sequelize) {
	const { TaskType } = sequelize.models;
	const { TASK_TYPE } = require('../utils/constants/models.constants.js');
	const count = await TaskType.count();
	if (count > 0) {
		return;
	}

	const taskTypes = [
		{ name: 'Onboarding estándar', sub_type: 'Checklist' },
		{ name: 'Onboarding contabilidad', sub_type: 'Documentación' },
		{ name: 'Onboarding líderes', sub_type: 'Integración' },
		{ name: 'Offboarding estándad', sub_type: 'Checklist' },
		{ name: 'Offboarding prueba', sub_type: 'Entrevista de salida' },
		{ name: 'Aprendizaje - curso', sub_type: 'Curso' },
		{ name: 'SAP FI (Financial Accounting - Finanzas)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP CO (Controlling - Control de Costos)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP MM (Materials Management - Gestión de Materiales)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP SD (Sales and Distribution - Ventas y Distribución)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP PP (Production Planning - Planificación de la Producción)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP HCM (Human Capital Management - Recursos Humanos)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP PM (Plant Maintenance - Mantenimiento de Planta)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP QM (Quality Management - Gestión de Calidad)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP PS (Project System - Sistema de Proyectos)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP WM (Warehouse Management)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP EWM (Extended Warehouse Management)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP CS (Customer Service - Servicio al Cliente)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP SCM (Supply Chain Management - Cadena de Suministro)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP CRM (Customer Relationship Management)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP ABAP', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP BASIS', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP NetWeaver', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP Solution Manager (SolMan)', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP Workflow', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'SAP Enterprise Portal', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'Aprendizaje - certificarse', sub_type: TASK_TYPE.TASK_TYPE_SUB_TYPE_CAPACITATION_HARD },
		{ name: 'Desempeño - feedback 360', sub_type: 'Evaluación 360' },
		{ name: 'Desempeño - reconocimiento', sub_type: 'Reconocimiento' },
		{ name: 'Administrativo - acceso', sub_type: 'Accesos' },
	];

	await TaskType.bulkCreate(taskTypes, { individualHooks: true });
};
