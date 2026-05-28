const { Router } = require('express');
const { getAlerts, getUnreadCount, markAsRead } = require('../controllers/alertController');

const router = Router();

router.get('/',          getAlerts);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read',   markAsRead);

module.exports = router;
