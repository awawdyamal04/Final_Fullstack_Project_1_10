import express from 'express';
import { getUserHistory, saveHistory, updateHistory, deleteHistory, getHistory } from '../controllers/historyController.js';
import { detectGuest } from '../middleware/auth.js';
const router = express.Router();

router.get('/', detectGuest, getHistory);
router.get('/:userID', detectGuest, getUserHistory);
router.post('/', detectGuest, saveHistory);
router.put('/:historyID', detectGuest, updateHistory);
router.delete('/:historyID', detectGuest, deleteHistory);

export default router;