const { Op } = require('sequelize');
const { Alert } = require('./sequelize');
const { OKR } = require('../utils/constants/models.constants.js');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (from, to) => Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);

const progressPercent = (okr) => {
    if (!okr.target_value || okr.target_value <= 0) return 0;
    return Math.min(100, Math.round((okr.current_value / okr.target_value) * 100));
};

// expectedProgressPercent = (daysElapsed / totalDays) * 100, clamped to [0, 100].
// Requires a due date — without one there's no timeline to compare against.
const expectedProgressPercent = (okr) => {
    if (!okr.due_date) return null;

    const start     = new Date(okr.createdAt);
    const due       = new Date(okr.due_date);
    const totalDays = daysBetween(start, due);
    if (totalDays <= 0) return 100;

    const elapsedDays = daysBetween(start, new Date());
    const ratio       = Math.min(1, Math.max(0, elapsedDays / totalDays));
    return Math.round(ratio * 100);
};

const daysRemaining = (okr) => {
    if (!okr.due_date) return null;
    return daysBetween(new Date(), new Date(okr.due_date));
};

const daysSinceLastUpdate = (okr) => {
    const reference = okr.last_progress_update_at ?? okr.createdAt;
    return daysBetween(new Date(reference), new Date());
};

// Evaluation order follows the spec's precedence: a completed objective is always
// COMPLETED regardless of recency/pace; otherwise stagnation (no updates) takes
// priority over pace-based risk; everything else is ON_TRACK.
const evaluateStatus = (okr) => {
    if (okr.current_value >= okr.target_value) return OKR.STATUS_COMPLETED;

    if (daysSinceLastUpdate(okr) >= OKR.STAGNANT_DAYS) return OKR.STATUS_STAGNANT;

    const expected = expectedProgressPercent(okr);
    if (expected != null && progressPercent(okr) < expected - OKR.RISK_THRESHOLD_PERCENT) {
        return OKR.STATUS_AT_RISK;
    }

    return OKR.STATUS_ON_TRACK;
};

// Dedup: skip creating a new alert if one of the same type already exists for this
// objective — mirrors the existing OKR_COMPLETED/OKR_BEHIND_SCHEDULE convention.
const hasExistingAlert = async (employeeId, type, okrId) => {
    const existing = await Alert.findOne({
        where: {
            employee_id: employeeId,
            type,
            topics: { [Op.contains]: [okrId] },
        },
    });
    return Boolean(existing);
};

const notifyStagnant = async (okr) => {
    if (await hasExistingAlert(okr.responsible_employee_id, 'OKR_STAGNANT', okr.id)) return;

    Alert.create({
        employee_id: okr.responsible_employee_id,
        type:        'OKR_STAGNANT',
        message:     `El objetivo "${okr.title}" no recibió actualizaciones de progreso en los últimos ${OKR.STAGNANT_DAYS} días.`,
        status:      'UNREAD',
        topics:      [okr.id],
    }).catch(console.error);
};

const notifyAtRisk = async (okr) => {
    if (await hasExistingAlert(okr.responsible_employee_id, 'OKR_BEHIND_SCHEDULE', okr.id)) return;

    Alert.create({
        employee_id: okr.responsible_employee_id,
        type:        'OKR_BEHIND_SCHEDULE',
        message:     `El objetivo "${okr.title}" está por debajo del progreso esperado para el período actual.`,
        status:      'UNREAD',
        topics:      [okr.id],
    }).catch(console.error);
};

const notifyCompleted = async (okr) => {
    if (await hasExistingAlert(okr.responsible_employee_id, 'OKR_COMPLETED', okr.id)) return;

    Alert.create({
        employee_id: okr.responsible_employee_id,
        type:        'OKR_COMPLETED',
        message:     `El objetivo "${okr.title}" alcanzó su meta y fue marcado como completado.`,
        status:      'UNREAD',
        topics:      [okr.id],
    }).catch(console.error);
};

// Recalculates status from current values/dates, persists it, and fires the
// matching alert (deduped). Single entry point used by both the progress-update
// flow and the periodic re-evaluation cron — keeps the rules in one place.
const recalculateAndNotify = async (okr) => {
    okr.status = evaluateStatus(okr);
    await okr.save();

    if (okr.status === OKR.STATUS_COMPLETED) await notifyCompleted(okr);
    else if (okr.status === OKR.STATUS_STAGNANT) await notifyStagnant(okr);
    else if (okr.status === OKR.STATUS_AT_RISK) await notifyAtRisk(okr);

    return okr;
};

module.exports = {
    progressPercent,
    expectedProgressPercent,
    daysRemaining,
    daysSinceLastUpdate,
    evaluateStatus,
    recalculateAndNotify,
};
