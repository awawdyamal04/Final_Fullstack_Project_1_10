import express from "express";
import { signup, login, getUsers, forgotPassword, resetPassword } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;