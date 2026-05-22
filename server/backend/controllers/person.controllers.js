const { Op } = require('sequelize');
const { Person, Employee, Department } = require('../connection/sequelize');

const PERSON_INCLUDE = [
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id', 'position', 'status', 'hire_date'],
		include: [
			{ model: Department, as: 'department', attributes: ['id', 'name'] },
		],
	},
];

function formatPerson(p) {
	return {
		id:                    p.id,
		firstName:             p.first_name,
		lastName:              p.last_name,
		documentType:          p.document_type,
		documentNumber:        p.document_number,
		birthDate:             p.birth_date              ?? null,
		phone:                 p.phone                   ?? null,
		address:               p.address                 ?? null,
		emergencyContactName:  p.emergency_contact_name  ?? null,
		emergencyContactPhone: p.emergency_contact_phone ?? null,
		employee: p.employee
			? {
				id:         p.employee.id,
				position:   p.employee.position,
				status:     p.employee.status,
				hireDate:   p.employee.hire_date ?? null,
				department: p.employee.department ?? null,
			}
			: null,
	};
}

const getAllPersons = async (req, res, next) => {
	try {
		const { search } = req.query;
		const where = search
			? {
				[Op.or]: [
					{ first_name: { [Op.iLike]: `%${search}%` } },
					{ last_name:  { [Op.iLike]: `%${search}%` } },
				],
			}
			: {};

		const persons = await Person.findAll({ where, include: PERSON_INCLUDE });
		res.json(persons.map(formatPerson));
	} catch (err) {
		next(err);
	}
};

const getPersonById = async (req, res, next) => {
	try {
		const person = await Person.findByPk(req.params.id, { include: PERSON_INCLUDE });
		if (!person) return res.status(404).json({ status: 'fail', message: 'Person not found' });
		res.json(formatPerson(person));
	} catch (err) {
		next(err);
	}
};

const createPerson = async (req, res, next) => {
	try {
		const {
			firstName, lastName, documentType, documentNumber,
			birthDate, phone, address, emergencyContactName, emergencyContactPhone,
		} = req.body;

		const person = await Person.create({
			first_name:              firstName,
			last_name:               lastName,
			document_type:           documentType,
			document_number:         documentNumber,
			birth_date:              birthDate    || null,
			phone:                   phone        || null,
			address:                 address      || null,
			emergency_contact_name:  emergencyContactName  || null,
			emergency_contact_phone: emergencyContactPhone || null,
		});

		const full = await Person.findByPk(person.id, { include: PERSON_INCLUDE });
		res.status(201).json(formatPerson(full));
	} catch (err) {
		next(err);
	}
};

const updatePerson = async (req, res, next) => {
	try {
		const person = await Person.findByPk(req.params.id);
		if (!person) return res.status(404).json({ status: 'fail', message: 'Person not found' });

		const {
			firstName, lastName, documentType, documentNumber,
			birthDate, phone, address, emergencyContactName, emergencyContactPhone,
		} = req.body;

		const updates = {};
		if (firstName      !== undefined) updates.first_name      = firstName;
		if (lastName       !== undefined) updates.last_name       = lastName;
		if (documentType   !== undefined) updates.document_type   = documentType;
		if (documentNumber !== undefined) updates.document_number = documentNumber;
		if (birthDate      !== undefined) updates.birth_date      = birthDate || null;
		if (phone          !== undefined) updates.phone           = phone     || null;
		if (address        !== undefined) updates.address         = address   || null;
		if (emergencyContactName  !== undefined) updates.emergency_contact_name  = emergencyContactName  || null;
		if (emergencyContactPhone !== undefined) updates.emergency_contact_phone = emergencyContactPhone || null;

		await person.update(updates);

		const updated = await Person.findByPk(person.id, { include: PERSON_INCLUDE });
		res.json(formatPerson(updated));
	} catch (err) {
		next(err);
	}
};

const deletePerson = async (req, res, next) => {
	try {
		const person = await Person.findByPk(req.params.id);
		if (!person) return res.status(404).json({ status: 'fail', message: 'Person not found' });
		await person.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllPersons,
	getPersonById,
	createPerson,
	updatePerson,
	deletePerson,
};
