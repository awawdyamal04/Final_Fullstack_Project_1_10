import { User } from "../models/User.js";

export async function findOrCreateGoogleUser(profile) {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return user;
    }

    // Check if user exists with this email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Update existing user with Google ID
      user.googleId = profile.id;
      user.profilePicture = profile.photos[0]?.value;
      await user.save();
      return user;
    }

    // Create new user
    const newUser = new User({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      googleId: profile.id,
      profilePicture: profile.photos[0]?.value,
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error("Error in findOrCreateGoogleUser:", error);
    throw error;
  }
}
