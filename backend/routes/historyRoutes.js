import express from 'express';
import { getUserHistory, saveHistory, updateHistory, deleteHistory } from '../controllers/historyController.js';
const router = express.Router();

router.get('/:userID', getUserHistory);
router.post('/', saveHistory);
router.put('/:historyID', updateHistory);
router.delete('/:historyID', deleteHistory);

export default router;