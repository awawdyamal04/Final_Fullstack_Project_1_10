import { Router } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const router = Router();

router.post("/guest", (req, res) => {
  const payload = { sub: `guest:${randomUUID()}`, role: "guest", trial: true };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, role: "guest", trial: true });
});

export default router;
