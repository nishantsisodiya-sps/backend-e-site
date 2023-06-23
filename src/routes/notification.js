const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const notificationController = require('../controller/notificationController')

// POST /send-notification
router.post('/send-notification', async (req, res) => {
  try {
    const orderDetails = req.body;
    await notificationController.sendNotification_OneByOne(orderDetails)
    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Notification sending error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;
