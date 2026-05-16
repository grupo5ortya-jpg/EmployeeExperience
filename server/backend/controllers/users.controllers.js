//const { User } = require("../db");

const { Dirent } = require("node:fs");
const { sequelize } = require('../connection/sequelize');
//const { core_person_create } = require('../../bs/core/src/core_person_fns.sql')//'    ../bs/core/src/core_person_fns.sql');
const getAllUsers = async () => {
    try {
        //sdfdsffdsfsdafsddfsfsd
        //const allUsers = await User.findAll();
        const usuariopp = await sequelize.query(`SELECT core_person_create(
    p_first_name              := 'Juan'::TEXT,
    p_last_name               := 'Pérez'::TEXT,
    p_document_type           := 'DNI'::core_document_type,
    p_document_number         := '30111222'::TEXT,
    p_email                   := 'juan.perez@example.com'::CITEXT,
    p_date_of_birth           := '1990-05-14'::DATE,
    p_phone_number            := '+54 11 5555-1001'::TEXT,
    p_emergency_contact_name  := 'María Pérez'::TEXT,
    p_emergency_contact_phone := '+54 11 5555-2001'::TEXT,
    p_address                 := ROW(
        'Argentina',
        'Buenos Aires',
        'Palermo',
        'Av. Santa Fe',
        '2450',
        '3',
        'B',
        'Depto luminoso',
        'C1425',
        'Bulnes',
        'Coronel Díaz'
    )::address,
    p_profile_picture_url     := 'https://example.com/profiles/juan.jpg'::TEXT
);`)
        // const allUsersWithFunction = await sequelize.query("SELECT * FROM hr_user;");
        return usuariopp
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = { getAllUsers };
/**
 * 	p_first_name               TEXT,
    p_last_name                TEXT,
    p_document_type            core_document_type,
    p_document_number          TEXT,
    p_email                    CITEXT,
    p_date_of_birth            DATE,
    p_phone_number             TEXT,
    p_emergency_contact_name   TEXT,
    p_emergency_contact_phone  TEXT,
    p_address		           address,
    p_profile_picture_url      TEXT )
 */