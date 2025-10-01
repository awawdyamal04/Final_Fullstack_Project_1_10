import React, { useState, useEffect } from "react";
import "./UserSettings.css";

const UserSettings = ({ user, onClose, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
    
    // Check if user has authentication token
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      // Silently handle missing token - don't show error message
    }
  }, [user]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("One lowercase letter");

    if (/\d/.test(password)) score += 1;
    else feedback.push("One number");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push("One special character");

    // Additional strength factors
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score += 1;

    // Determine strength level
    let strengthText, strengthColor;
    if (score <= 2) {
      strengthText = "Weak";
      strengthColor = "#ef4444"; // Red
    } else if (score <= 4) {
      strengthText = "Fair";
      strengthColor = "#f59e0b"; // Orange
    } else if (score <= 6) {
      strengthText = "Good";
      strengthColor = "#10b981"; // Green
    } else {
      strengthText = "Strong";
      strengthColor = "#059669"; // Dark green
    }

    return {
      score,
      text: strengthText,
      color: strengthColor,
      feedback
    };
  };

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const strength = calculatePasswordStrength(password);
    
    setPasswordValidation(validation);
    setPasswordStrength(strength);
    
    return Object.values(validation).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate password when new password changes
    if (name === 'newPassword') {
      validatePassword(value);
    }
    
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate password if changing password
      if (formData.newPassword) {
        if (!validatePassword(formData.newPassword)) {
          setError("Password does not meet security requirements");
          setIsLoading(false);
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match");
          setIsLoading(false);
          return;
        }
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("UserSettings - Token:", token ? "Present" : "Missing");
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log("UserSettings - Response:", data);

      if (response.status === 401 || response.status === 403) {
        setError("Authentication failed. Please log in again.");
        // Clear tokens and redirect to login
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        setTimeout(() => {
          window.location.href = "#login";
        }, 2000);
        return;
      }

      if (data.success) {
        setSuccess("Profile updated successfully!");
        
        // Update user data in parent component
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }

        // Update localStorage/sessionStorage
        const userData = {
          userId: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          profilePicture: data.user.profilePicture
        };

        if (localStorage.getItem("user")) {
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
        }

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        setShowPasswordSection(false);

        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setError("");
    setSuccess("");
    setShowPasswordSection(false);
    onClose();
  };

  return (
    <div className="user-settings-overlay">
      <div className="user-settings-modal">
        <div className="user-settings-header">
          <h2>User Settings</h2>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-settings-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="password-section-header">
              <h3>Password</h3>
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordSection && (
              <>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    minLength="8"
                  />
                  {formData.newPassword && (
                    <div className="password-requirements">
                      {/* Password Strength Indicator */}
                      <div className="password-strength">
                        <div className="strength-label">
                          Password Strength: 
                          <span 
                            className="strength-text" 
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="strength-bar">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${(passwordStrength.score / 8) * 100}%`,
                              backgroundColor: passwordStrength.color 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <h4>Password Requirements:</h4>
                      <div className={`requirement ${passwordValidation.length ? 'valid' : 'invalid'}`}>
                        {passwordValidation.length ? '✓' : '✗'} At least 8 characters
                      </div>
                      <div className={`requirement ${passwordValidation.uppercase ? 'valid' : 'invalid'}`}>
                        {passwordValidation.uppercase ? '✓' : '✗'} One uppercase letter
                      </div>
                      <div className={`requirement ${passwordValidation.lowercase ? 'valid' : 'invalid'}`}>
                        {passwordValidation.lowercase ? '✓' : '✗'} One lowercase letter
                      </div>
                      <div className={`requirement ${passwordValidation.number ? 'valid' : 'invalid'}`}>
                        {passwordValidation.number ? '✓' : '✗'} One number
                      </div>
                      <div className={`requirement ${passwordValidation.special ? 'valid' : 'invalid'}`}>
                        {passwordValidation.special ? '✓' : '✗'} One special character
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    minLength="6"
                  />
                </div>
              </>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
            <button 
              type="submit" 
              className={`save-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
