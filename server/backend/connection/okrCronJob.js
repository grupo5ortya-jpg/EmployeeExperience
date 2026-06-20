const cron = require('node-cron');
const { Op } = require('sequelize');
const { Okr, Employee } = require('./sequelize');
const { OKR, EMPLOYEE } = require('../utils/constants/models.constants.js');
const { recalculateAndNotify } = require('./okrService.js');

// STAGNANT and AT_RISK can emerge purely from elapsed time (no user action), so
// active objectives need periodic re-evaluation — not just on progress updates.
// required:true filtra a responsables ACTIVE — si el responsable pasó a Alumni
// (offboarding), no tiene sentido seguir reevaluando/alertando sobre su OKR
// (mismo bug que se encontró y arregló en onboardingCronJob.js).
async function reevaluateActiveOkrs() {
    const active = await Okr.findAll({
        where:   { status: { [Op.ne]: OKR.STATUS_COMPLETED } },
        include: [{ model: Employee, as: 'responsible', attributes: ['id'], required: true, where: { status: EMPLOYEE.STATUS_ACTIVE } }],
    });

    for (const okr of active) {
        await recalculateAndNotify(okr);
    }

    console.log(`okrCron: ${active.length} objetivos activos reevaluados`);
}

function startOkrCronJob() {
    cron.schedule('0 9 * * *', async () => {
        console.log('okrCron: reevaluando estado de objetivos...');
        try { await reevaluateActiveOkrs(); }
        catch (err) { console.error('okrCron: error during execution:', err); }
    });
    console.log('okrCron: scheduled (daily at 09:00)');
}

module.exports = { startOkrCronJob, reevaluateActiveOkrs };
