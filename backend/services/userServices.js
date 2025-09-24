import { User } from "../models/User.js";
import bcrypt from "bcrypt";

export async function addUser(firstName, lastName, email, password) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    return await user.save();
}

export async function fetchUsers() {
    return await User.find();
}

export async function loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
        return null; // User not found or no password (Google OAuth user)
    }
    
    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        // If bcrypt comparison fails, check if it's a legacy plain text password
        // This handles existing users who have plain text passwords
        if (user.password === password) {
            // Update the password to hashed version for future logins
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate(user._id, { password: hashedPassword });
            return user;
        }
        return null;
    }
    
    return user;
}
