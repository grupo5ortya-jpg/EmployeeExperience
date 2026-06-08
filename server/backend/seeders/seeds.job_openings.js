module.exports = async function (sequelize) {
    const JobOpening = sequelize.models.JobOpening;
    const Department = sequelize.models.Department;

    const count = await JobOpening.count();
    if (count > 0) return;

    const accounting = await Department.findOne({ where: { name: 'Contabilidad' } });
    const sales = await Department.findOne({ where: { name: 'Ventas' } });
    const marketing = await Department.findOne({ where: { name: 'Marketing' } });
    const engineering = await Department.findOne({ where: { name: 'Desarrollo' } });

    await JobOpening.bulkCreate([
        // Contabilidad
        {
            title: 'Analista Contable',
            description: 'Gestión de balances, conciliaciones y reportes financieros',
            status: 'open',
            department_id: accounting.id,
        },
        {
            title: 'Analista SAP FI/CO',
            description: 'Implementación y soporte del módulo financiero SAP FI/CO',
            status: 'open',
            department_id: accounting.id,
        },
        {
            title: 'Tesorero',
            description: 'Gestión de pagos, cobranzas y flujo de caja',
            status: 'open',
            department_id: accounting.id,
        },
        {
            title: 'Auditor Interno',
            description: 'Control y revisión de procesos contables y financieros',
            status: 'closed',
            department_id: accounting.id,
        },

        // Ventas
        {
            title: 'Ejecutivo de Ventas',
            description: 'Gestión de cartera de clientes y cierre de negocios',
            status: 'open',
            department_id: sales.id,
        },
        {
            title: 'Analista SAP SD',
            description: 'Soporte y configuración del módulo de ventas y distribución SAP SD',
            status: 'open',
            department_id: sales.id,
        },
        {
            title: 'Account Manager',
            description: 'Relación y fidelización de cuentas clave',
            status: 'open',
            department_id: sales.id,
        },
        {
            title: 'Representante Comercial',
            description: 'Prospección y desarrollo de nuevos negocios',
            status: 'closed',
            department_id: sales.id,
        },

        // Marketing
        {
            title: 'Analista de Marketing Digital',
            description: 'Gestión de campañas digitales y análisis de métricas',
            status: 'open',
            department_id: marketing.id,
        },
        {
            title: 'Diseñador Gráfico',
            description: 'Diseño de piezas visuales para campañas y redes sociales',
            status: 'open',
            department_id: marketing.id,
        },
        {
            title: 'Community Manager',
            description: 'Gestión de redes sociales y comunidad online',
            status: 'open',
            department_id: marketing.id,
        },
        {
            title: 'Consultor SAP CRM',
            description: 'Soporte y configuración del módulo de relación con clientes SAP CRM',
            status: 'closed',
            department_id: marketing.id,
        },

        // Desarrollo
        {
            title: 'Backend Developer',
            description: 'Node.js backend services and APIs',
            status: 'open',
            department_id: engineering.id,
        },
        {
            title: 'Frontend Developer',
            description: 'React UI development',
            status: 'open',
            department_id: engineering.id,
        },
        {
            title: 'DevOps Engineer',
            description: 'CI/CD, Docker and cloud infra',
            status: 'open',
            department_id: engineering.id,
        },
        {
            title: 'Consultor SAP ABAP',
            description: 'Desarrollo y mantenimiento de módulos a medida en SAP ABAP',
            status: 'open',
            department_id: engineering.id,
        },
    ]);
};
