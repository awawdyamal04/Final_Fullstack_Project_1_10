import express from "express";
import { signup, login, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/signup", signup);
router.post("/login", login);

export default router;