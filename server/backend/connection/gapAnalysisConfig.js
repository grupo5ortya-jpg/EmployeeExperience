// Ideal competency profiles per department (scale 1–5).
// Keys are lowercase department names for case-insensitive lookup.
// Extend this object as new departments are onboarded.
const IDEAL_PROFILES = {
	'desarrollo':        { communication: 3.5, leadership: 3.0, teamwork: 4.0, problem_solving: 5.0, proactivity: 4.0, adaptability: 4.0, results: 4.5 },
	'it':                { communication: 3.5, leadership: 3.0, teamwork: 4.0, problem_solving: 5.0, proactivity: 4.0, adaptability: 4.0, results: 4.5 },
	'marketing':         { communication: 4.5, leadership: 3.5, teamwork: 4.5, problem_solving: 3.5, proactivity: 4.5, adaptability: 4.0, results: 4.0 },
	'ventas':            { communication: 5.0, leadership: 3.5, teamwork: 4.0, problem_solving: 3.0, proactivity: 5.0, adaptability: 4.5, results: 5.0 },
	'recursos humanos':  { communication: 5.0, leadership: 4.0, teamwork: 4.5, problem_solving: 3.5, proactivity: 3.5, adaptability: 4.0, results: 3.5 },
	'rrhh':              { communication: 5.0, leadership: 4.0, teamwork: 4.5, problem_solving: 3.5, proactivity: 3.5, adaptability: 4.0, results: 3.5 },
	'finanzas':          { communication: 4.0, leadership: 3.0, teamwork: 3.5, problem_solving: 5.0, proactivity: 3.5, adaptability: 3.0, results: 5.0 },
	'operaciones':       { communication: 4.0, leadership: 3.5, teamwork: 4.5, problem_solving: 4.5, proactivity: 4.0, adaptability: 4.5, results: 5.0 },
};

// Fallback when the department has no configured profile
const DEFAULT_PROFILE = {
	communication: 3.5, leadership: 3.0, teamwork: 3.5,
	problem_solving: 3.5, proactivity: 3.5, adaptability: 3.5, results: 3.5,
};

function getIdealProfile(departmentName) {
	const key = (departmentName ?? '').toLowerCase().trim();
	return IDEAL_PROFILES[key] ?? DEFAULT_PROFILE;
}

module.exports = { IDEAL_PROFILES, getIdealProfile };
