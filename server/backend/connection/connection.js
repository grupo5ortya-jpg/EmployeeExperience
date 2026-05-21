
const path = require('path');
const fs = require('fs');
const { core_conn_execute_query_from_file } = require('./utiles.js');


function core_conn_parse_info_conf_list(info_conf_content, key) {
	const lines = info_conf_content.split(/\r?\n/);
	let collecting = false;
	let raw_value = '';

	for (const line of lines) {
		const trimmed = line.trim();
		if (!collecting) {
			if (trimmed.startsWith(`${key}=`)) {
				raw_value = trimmed.slice(trimmed.indexOf('=') + 1).trim();
				collecting = true;
				if (!raw_value.endsWith('\\')) break;
			}
		} else {
			if (trimmed === '' || trimmed.includes('=')) break;
			raw_value += ' ' + trimmed;
			if (!raw_value.endsWith('\\')) break;
		}
	}

	return raw_value
		.replace(/\\$/gm, '')
		.split(',')
		.map(item => item.replace(/^\\+/, '').trim())
		.filter(Boolean);
}


function core_conn_parse_info_conf_value(info_conf_content, key) {
	const lines = info_conf_content.split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.startsWith(`${key}=`)) {
			return trimmed.slice(trimmed.indexOf('=') + 1).trim();
		}
	}
	return '';
}


async function core_conn_initialize_database_from_bs(sequelize) {
	try {
		// Leer el archivo info.conf para obtener el orden de módulos y schema
		const info_conf_path = path.join(__dirname, '..', '..', 'bs', 'info.conf');
		const info_conf_content = fs.readFileSync(info_conf_path, 'utf8');
		const modules_line = info_conf_content.split(/\r?\n/).find(line => line.startsWith('modules='));
		const modules = modules_line.split('=')[1].split(',').map(m => m.trim());
		const schemaFromEnv = process.env.DB_SCHEMA ? process.env.DB_SCHEMA.trim() : '';
		const schemaFromConfig = core_conn_parse_info_conf_value(info_conf_content, 'schema');
		const schema = schemaFromEnv || schemaFromConfig || 'public';

		if (schema && schema !== 'public') {
			await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
		}

		// Verificar si la base de datos está vacía
		const [results] = await sequelize.query(`
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = :schema_name
			) AS exists;
		`, {
			replacements: {
				schema_name: schema || 'public'
			}
		});

		const should_run_impl_files  = !results[0].exists;

		// Procesar cada módulo en orden
		for (const module of modules) {
			const module_dir = path.join(__dirname, '..', '..', 'bs', module);
			const module_info_conf = path.join(module_dir, 'info.conf');
			const module_info_content = fs.existsSync(module_info_conf)
				? fs.readFileSync(module_info_conf, 'utf8')
				: '';

			const impl_files = core_conn_parse_info_conf_list(module_info_content, 'files_impl');
			const fns_files = core_conn_parse_info_conf_list(module_info_content, 'files_fns');

			if (should_run_impl_files ) {
				if (impl_files.length > 0) {
					for (const relative_path of impl_files) {
						const file_path = path.join(module_dir, relative_path);
						await core_conn_execute_query_from_file(sequelize, file_path, schema);
					}
				} else {
					const src_path = path.join(module_dir, 'src');
					const files = fs.readdirSync(src_path).filter(f => f.endsWith('_impl.sql'));
					files.sort();
					for (const file of files) {
						await core_conn_execute_query_from_file(sequelize, path.join(src_path, file), schema);
					}
				}
			}

			if (fns_files.length > 0) {
				for (const relative_path of fns_files) {
					const file_path = path.join(module_dir, relative_path);
					await core_conn_execute_query_from_file(sequelize, file_path, schema);
				}
			} else {
				const src_path = path.join(module_dir, 'src');
				const files = fs.readdirSync(src_path).filter(f => f.endsWith('_fns.sql'));
				files.sort();
				for (const file of files) {
					await core_conn_execute_query_from_file(sequelize, path.join(src_path, file), schema);
				}
			}
		}

		// Sincronización y asociaciones se hacen en index.js después de registrar los modelos.
		return true;
	} catch (error) {
		console.error('Error initializing database:', error);
		throw error;
	}
}


module.exports = {
	core_conn_initialize_database_from_bs
};
