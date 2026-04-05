/**
 * AccessRepair - API Routes
 */
const express = require('express');
const { handleScan, handleHistory, handleGetScan, handleChat } = require('../controllers/scanController');

const router = express.Router();

// POST /api/scan - Run accessibility scan on a URL
router.post('/scan', handleScan);

// GET /api/history - Get scan history
router.get('/history', handleHistory);

// GET /api/scan/:id - Get a specific scan result
router.get('/scan/:id', handleGetScan);

// POST /api/chat - AI chat assistant
router.post('/chat', handleChat);

module.exports = router;
