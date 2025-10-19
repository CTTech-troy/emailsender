const express = require('express');
const router = express.Router();
const controller = require('../controllers/mail.Controller');

// POST /api/mail/send
router.post('/send', controller.sendMail);

// GET /api/mail
router.get('/', controller.listEmails);

// GET /api/mail/:id
router.get('/:id', controller.getEmail);

// DELETE /api/mail/:id
router.delete('/:id', controller.deleteEmail);

module.exports = router;
