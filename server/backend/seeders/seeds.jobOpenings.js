module.exports = async function (sequelize) {
    const JobOpening = sequelize.models.JobOpening;
    const Department = sequelize.models.Department;

    const engineering = await Department.findOne({
        where: { name: 'Desarrollo' },
    });

    const sales = await Department.findOne({
        where: { name: 'Ventas' },
    });

    await JobOpening.bulkCreate([
        {
            title: 'Backend Developer',
            description: 'Node.js backend services and APIs',
            status: 'open',
            departmentId: engineering.id,
        },
        {
            title: 'Frontend Developer',
            description: 'React UI development',
            status: 'open',
            departmentId: engineering.id,
        },
        {
            title: 'HR Analyst',
            description: 'HR processes and analytics',
            status: 'open',
            departmentId: sales.id,
        },
        {
            title: 'DevOps Engineer',
            description: 'CI/CD, Docker and cloud infra',
            status: 'open',
            departmentId: engineering.id,
        },
    ]);
};