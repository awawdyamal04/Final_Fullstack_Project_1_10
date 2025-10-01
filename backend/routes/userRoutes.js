import express from "express";
import { signup, login, getUsers, forgotPassword, resetPassword, updateUser, getUserProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUser);

export default router;