import React, { useState, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

  // Handle Google OAuth redirect response
  useEffect(() => {
    // Handle hash-based routing parameters
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryString = hash.split('?')[1];
      const urlParams = new URLSearchParams(queryString);
      const success = urlParams.get('success');
      const userData = urlParams.get('user');
      const errorParam = urlParams.get('error');

      if (success === 'true' && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          
          // Store user session
          sessionStorage.setItem("user", JSON.stringify(user));
          
          // Clear URL parameters and redirect to home
          window.location.href = "#home";
        } catch (err) {
          setError("Failed to process Google authentication");
        }
      } else if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, []);

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
    setIsLoading(true);
    setError("");

    try {
      const email = e.target.email.value;
      
      if (!email) {
        setError("Please enter your email address");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Password reset instructions have been sent to your email!");
        setShowForgotPassword(false);
      } else {
        setError(data.error || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = "http://localhost:3000/api/auth/google";
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

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className={`login-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
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
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="password-toggle-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      // Eye with slash (hide password)
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    ) : (
                      // Eye (show password)
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    )}
                  </svg>
                </button>
              </div>
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

          {/* Google OAuth Button */}
          <div className="divider">
            <span>OR</span>
          </div>
          
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Guest Login Section */}
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