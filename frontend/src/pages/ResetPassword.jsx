import { useState } from "react";
import "./ResetPassword.css";

const ResetPassword = ({ token }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "", color: "" };

    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[\W_]/.test(pass)) score++;

    if (score <= 1) return { label: "Weak", color: "weak" };
    if (score === 2) return { label: "Medium", color: "medium" };
    return { label: "Strong", color: "strong" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await response.json();
      if (data.success) {
        showToast("Password reset successful! Please log in.", "success");
        setTimeout(() => {
          window.location.hash = "#login";
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h2>Reset Password</h2>
        {error && <div className="error-message">{error}</div>}
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && (
              <div className="strength-bar">
                <div
                  className={`strength-fill ${strength.color}`}
                  style={{
                    width:
                      strength.label === "Weak"
                        ? "33%"
                        : strength.label === "Medium"
                        ? "66%"
                        : "100%",
                  }}
                ></div>
                <p className="strength-label">{strength.label}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
