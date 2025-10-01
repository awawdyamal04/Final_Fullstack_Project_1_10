import React, { useState, useEffect, useRef } from "react";
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

  // 👀 Blink effect state
  const [isBlinking, setIsBlinking] = useState(false);

  // 🔊 Sound state
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Blink loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      if (audioRef.current && !isMuted) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setTimeout(() => setIsBlinking(false), 100); // blink lasts 200ms
    }, 1000); // blink every 4s

    return () => clearInterval(interval);
  }, [isMuted]);

  // Handle Google OAuth callback
  useEffect(() => {
    // For hash-based routing, we need to parse parameters from the hash
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const urlParams = new URLSearchParams(queryString);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const userData = urlParams.get('user');

    if (success === 'true' && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        // Store user data and token
        localStorage.setItem("user", JSON.stringify(user));
        if (user.token) {
          localStorage.setItem("token", user.token);
        }
        // Clear URL parameters and redirect to home
        window.history.replaceState({}, document.title, window.location.pathname + "#login");
        window.location.href = "#home";
      } catch (err) {
        console.error("Failed to parse user data:", err);
        setError("Failed to process Google authentication data");
      }
    } else if (error) {
      setError(decodeURIComponent(error));
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname + "#login");
    }
  }, []);

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          userId: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          rememberMe: formData.rememberMe,
        };

        if (formData.rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
          sessionStorage.setItem("token", data.token);
        }

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
      const formData = new FormData(e.target);
      const email = formData.get('email');

      if (!email) {
        setError("Please enter your email address");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        // Show the reset link in development mode
        if (data.resetLink) {
          alert(`Development Mode: ${data.message}\n\nReset Link: ${data.resetLink}`);
        } else {
          alert(data.message);
        }
        setShowForgotPassword(false);
      } else {
        setError(data.error || "Failed to send reset instructions");
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

  if (showForgotPassword) {
    return (
      <div className="login-page">
        <div className="login-container design-login-container">
          <div className="login-form">
            <div className="login-header">
              <h1>Forgot Password?</h1>
              <p>Enter your email to receive reset instructions</p>
            </div>
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="Enter your email address" required />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
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
                <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(false); }}>Back to Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page design-login-page">
      {/* 👵 Grandma blinking */}
      <div className="login-illustration" aria-hidden="true">
        <img
          src={isBlinking ? "/assets/grandma-close.png" : "/assets/standing-by-the-door.png"}
          alt="Grandma blinking"
        />
      </div>

      {/* 🔊 Blink sound */}
      <audio ref={audioRef} src="/assets/blinky.mp3" preload="auto"></audio>

      {/* 🔇 Mute button */}
      <button className="mute-btn" onClick={handleMuteToggle}>
        {isMuted ? "Unmute 🔈" : "Mute 🔊"}
      </button>

      <div className="login-container design-login-container">
        <div className="login-form design-login-form">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your NL2SQL account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
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
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }} className="forgot-password">Forgot password?</a>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
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

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-button"
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
