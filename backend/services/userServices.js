import { User } from "../models/User.js";

export async function addUser(firstName, lastName, email, password) {
    const user = new User({ firstName, lastName, email, password });
    return await user.save();
}

export async function fetchUsers() {
    return await User.find();
}

export async function loginUser(email, password) {
    return await User.findOne({ email, password });
}
