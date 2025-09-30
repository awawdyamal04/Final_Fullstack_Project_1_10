import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "login";

      if (hash.startsWith("reset-password/")) {
        const token = hash.split("/")[1];
        setCurrentPage("reset-password");
        setResetToken(token);
      } else {
        setCurrentPage(hash);
        setResetToken(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "signup":
        return <Signup />;
      case "home":
        return <Home />;
      case "reset-password":
        return <ResetPassword token={resetToken} />;
      case "login":
      default:
        return <Login />;
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;
