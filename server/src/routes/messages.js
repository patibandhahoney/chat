const router = require('express').Router();
const controller = require('../controllers/messageController');

router.get('/', controller.history);
router.post('/', controller.send);

module.exports = router;
