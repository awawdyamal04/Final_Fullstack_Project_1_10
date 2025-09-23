import React, { useState } from "react";
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }
      
      // remove the guest status before logging in
      if (localStorage.getItem("auth")) localStorage.removeItem("auth");
      if (localStorage.getItem("X_GUEST")) localStorage.removeItem("X_GUEST");

      // Call backend login API
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      //data is an object with user and success it came from userController.js

      if (data.success) {
        // Store user session
        const userData = {
          userId: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          rememberMe: formData.rememberMe,
        };

        if (formData.rememberMe) {
          // Store in localStorage for persistent login
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          // Store in sessionStorage for session-only login
          sessionStorage.setItem("user", JSON.stringify(userData));
        }

        // Redirect to home page
        window.location.href = "#home";
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send a reset email
    alert("Password reset instructions have been sent to your email!");
    setShowForgotPassword(false);
  };

  const handleGuest = () => {
    // סימון מצב אורח באחסון מקומי
    localStorage.setItem("auth", JSON.stringify({ isGuest: true }));
    // אופציונלי: דגל גלובלי לזיהוי ב-axios
    localStorage.setItem("X_GUEST", "1");
    window.location.href = "#home"; // דף הבית/האפליקציה
  };

  if (showForgotPassword) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-form">
            <div className="login-header">
              <h1>Forgot Password?</h1>
              <p>Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Send Reset Instructions
              </button>
            </form>

            <div className="login-footer">
              <p>
                Remember your password?{" "}
                <a href="#" onClick={() => setShowForgotPassword(false)}>
                  Back to Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your NL2SQL account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              <a
                href="#"
                onClick={handleForgotPassword}
                className="forgot-password"
              >
                Forgot password?
              </a>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className={`login-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="guest-section">
            <div className="divider">
              <span>or</span>
            </div>
            <button
              type="button"
              className="guest-button"
              onClick={handleGuest}
              disabled={isLoading}
            >
              Enter as Guest
            </button>
            <p className="hint">
              🧪 Try mode: queries are not saved to history.
            </p>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account? <a href="#signup">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;