// Debe coincidir exactamente con PERSON.DOCUMENT_TYPES en
// server/backend/utils/constants/models.constants.js — única fuente de verdad real es el ENUM
// de la columna persons.document_type. El "value" de cada opción es el valor que persiste en BD;
// el "label" es solo para mostrar al usuario.
export const DOCUMENT_TYPE_OPTIONS = [
	{ value: 'DNI', label: 'DNI' },
	{ value: 'LC', label: 'Libreta Cívica' },
	{ value: 'LE', label: 'Libreta de Enrolamiento' },
	{ value: 'CI', label: 'Cédula de Identidad' },
	{ value: 'PASAPORTE EXTRANJERO', label: 'Pasaporte extranjero' },
	{ value: 'OTRO', label: 'Otro' },
];
