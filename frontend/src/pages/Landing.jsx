import React from "react";
import SecretaryScene from "../components/Experience/SecretaryScene";
import "./home.css";

const Landing = () => {
  const goToLogin = () => { window.location.hash = "login"; };
  const goToSignup = () => { window.location.hash = "signup"; };

  return (
    <div className="home-page" style={{ background: "#261c0d", minHeight: "100vh" }}>
      {/* Header */}
      <header className="home-header" style={{ background: "#261c0d" }}>
        <div className="header-content" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div className="logo" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <h1 style={{ color: "#FFD700", margin: "0" }}>NL2SQL</h1>
            <span style={{ color: "#ff4d4d", fontSize: "12px", marginTop: "-4px" }}>Natural Language to SQL</span>
          </div>
          <div className="user-info" style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <button onClick={goToLogin} className="logout-btn" style={{ background: "#8b0000" }}>
              Log in
            </button>
            <button
              onClick={goToSignup}
              className="logout-btn"
              style={{ background: "#8b0000" }}
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="home-main">
        <div className="main-container">
          {/* Secretary Scene, scaled smaller and centered */}
          <div
            className="experience-section"
            style={{ 
              marginBottom: 24, 
              display: "flex", 
              justifyContent: "center" 
            }}
          >
            <div style={{ maxWidth: "1200px", width: "100%" }}>
              <SecretaryScene
                title="Angry Secretary"
                subtitle="Flip the switch to begin"
                darkImageSrc="/assets/secretary-dark.png"
                lightImageSrc="/assets/secretary-light.png"
                blinkImageSrc="/assets/secretary-blink.png"
                switchImage="/assets/switch.png"
                ringAudioSrc="/assets/ring.wav"
                startBlinkDelayMs={2000}
                blinkIntervalMs={700}
                mouthOpenImageSrc="/assets/secretary-mouth-open.png"
                mouthClosedImageSrc="/assets/secretary-mouth-closed.png"
                talkDelayMs={4000}
                speechText="what are you doing here?!!!!"
                onSpeechStart={() => {
                  setTimeout(() => {
                    const ctas = document.querySelector(".landing-ctas");
                    if (ctas) ctas.style.display = "flex";
                  }, 2000);
                }}
              />
            </div>
          </div>

          {/* CTA buttons */}
          <div
            className="landing-ctas"
            style={{ display: "none", justifyContent: "center", gap: 12 }}
          >
            <button
              className="logout-btn"
              style={{ background: "#8b0000" }}
              onClick={() => (window.location.hash = "home")}
            >
              not your business (enter as a guest)
            </button>
            <button
              className="logout-btn"
              style={{ background: "#8b0000" }}
              onClick={() => (window.location.hash = "login")}
            >
              please let me log in / sign up
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
