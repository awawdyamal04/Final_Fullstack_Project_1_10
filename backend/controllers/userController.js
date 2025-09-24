import { addUser, fetchUsers, loginUser } from "../services/userServices.js";
import { transporter } from "../config/mailer.js";

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
    //console.log(req.body);
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

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Email is required" 
      });
    }

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        error: "Email service is not configured. Please contact support."
      });
    }

    // Check if user exists (you might want to add this to userServices)
    // For now, we'll send the email regardless for security reasons
    
    const mailOptions = {
      from: '"nl2sql Support" <nl2sqlnl2sql@gmail.com>',
      to: email,
      subject: 'Password Reset Request - NL2SQL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">NL2SQL</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0;">Hello!</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              We received a request to reset your password for your NL2SQL account. 
              If you made this request, please follow the instructions below.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e1e5e9;">
              <h3 style="color: #333; margin-top: 0;">To reset your password:</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Go to the login page</li>
                <li>Click on "Forgot password?"</li>
                <li>Enter your email address</li>
                <li>Follow the instructions sent to your email</li>
              </ol>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              If you didn't request a password reset, you can safely ignore this email. 
              Your password will remain unchanged.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/#login" 
                 style="background: linear-gradient(135deg, #667eea, #764ba2); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        display: inline-block;">
                Go to Login Page
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This email was sent from NL2SQL Support. 
              If you have any questions, please contact us.
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 NL2SQL. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email address."
    });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    console.error("Full error stack:", error.stack);
    
    // More specific error messages
    let errorMessage = "Failed to send password reset email. Please try again later.";
    
    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please check email configuration.";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Network connection failed. Please check your internet connection.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Connection timeout. Please try again later.";
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}