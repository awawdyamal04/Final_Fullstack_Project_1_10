import { addUser, fetchUsers, loginUser } from "../services/userServices.js";

// for password hashing
//import bcrypt from "bcrypt";


export async function getUsers(req, res) {
  const users = await fetchUsers();
  res.json(users);
}

export async function signup(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const user = await addUser(firstName, lastName, email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to signup" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await loginUser(email, password);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Normalize response to what frontend expects
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  } 
}