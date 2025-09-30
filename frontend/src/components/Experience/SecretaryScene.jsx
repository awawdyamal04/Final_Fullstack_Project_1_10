import React, { useEffect, useRef, useState } from "react";
import "./SecretaryScene.css";

const SecretaryScene = ({
  darkImageSrc = "/assets/secretary-dark.png",
  lightImageSrc = "/assets/secretary-light.png",
  blinkImageSrc = "/assets/secretary-blink.png",
  ringAudioSrc = "/assets/ring.wav",
  switchImage = "/assets/switch.png",
  mouthOpenImageSrc = "/assets/secretary-mouth-open.png",
  mouthClosedImageSrc = "/assets/secretary-mouth-closed.png",
  title = "The Secretary",
  subtitle = "Flip the switch to begin",
  startBlinkDelayMs = 2000,
  blinkIntervalMs = 600,
  talkDelayMs = 4000,
  mouthIntervalMs = 180,
  speechText = "what are you doing here?!!!!",
  onSpeechEnd,
  onSpeechStart,
}) => {
  const [isOn, setIsOn] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showBlink, setShowBlink] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [talkPhase, setTalkPhase] = useState(0); // 0: mouth closed, 1: mouth open, 2: light
  const [typedText, setTypedText] = useState("");
  const audioRef = useRef(null);

  // Prepare audio
  useEffect(() => {
    if (audioRef.current) audioRef.current.load();
  }, []);

  const handleToggle = async () => {
    if (hasStarted) return; // single start
    setHasStarted(true);
    setIsOn(true);
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (_) {}
  };

  // After turning on, wait delay then begin blink loop and schedule talk start
  useEffect(() => {
    let delayTimer;
    let blinkTimer;
    let talkStartTimer;
    if (isOn) {
      delayTimer = setTimeout(() => {
        blinkTimer = setInterval(() => {
          setShowBlink((prev) => !prev);
        }, blinkIntervalMs);
        // schedule talking after additional delay
        talkStartTimer = setTimeout(() => {
          setIsTalking(true);
          if (typeof onSpeechStart === "function") onSpeechStart();
        }, talkDelayMs);
      }, startBlinkDelayMs);
    }
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (blinkTimer) clearInterval(blinkTimer);
      if (talkStartTimer) clearTimeout(talkStartTimer);
    };
  }, [isOn, startBlinkDelayMs, blinkIntervalMs, talkDelayMs]);

  // Talking: stop blinking, cycle closed->open->light, type text, keep cycling until unmount/route change
  useEffect(() => {
    if (!isTalking) return;
    setShowBlink(false);
    let mouthTimer;
    let typeTimer;
    let index = 0;
    mouthTimer = setInterval(() => setTalkPhase((prev) => (prev + 1) % 3), mouthIntervalMs);
    typeTimer = setInterval(() => {
      index += 1;
      setTypedText(speechText.slice(0, index));
      if (index >= speechText.length) {
        clearInterval(typeTimer);
        if (typeof onSpeechEnd === "function") onSpeechEnd();
      }
    }, 60);
    return () => {
      if (mouthTimer) clearInterval(mouthTimer);
      if (typeTimer) clearInterval(typeTimer);
    };
  }, [isTalking, mouthIntervalMs, speechText, onSpeechEnd]);

  return (
    <section className="secretary-scene" aria-label="Secretary Scene">
      <audio ref={audioRef} src={ringAudioSrc} preload="auto" />
      {/* Preload images to avoid flashes */}
      <link rel="preload" as="image" href={lightImageSrc} />
      <link rel="preload" as="image" href={blinkImageSrc} />

      <div className="scene-stage">
        {/* Start with dark image only; when on, show light/blink */}
        <img
          src={darkImageSrc}
          alt="Secretary in the dark"
          className={`scene-image scene-image--dark ${isOn ? "hidden" : "visible"}`}
          draggable={false}
        />

        <img
          src={lightImageSrc}
          alt="Secretary (light)"
          className={`scene-image scene-image--light ${isOn && (!isTalking ? !showBlink : talkPhase === 2) ? "visible" : "hidden"}`}
          draggable={false}
        />

        <img
          src={blinkImageSrc}
          alt="Secretary (blink)"
          className={`scene-image scene-image--blink ${isOn && !isTalking && showBlink ? "visible" : "hidden"}`}
          draggable={false}
        />

        {/* Talking mouth overlays (only during talking) */}
        <img
          src={mouthClosedImageSrc}
          alt="Secretary mouth closed"
          className={`scene-image ${isOn && isTalking && talkPhase === 0 ? "visible" : "hidden"}`}
          draggable={false}
        />
        <img
          src={mouthOpenImageSrc}
          alt="Secretary mouth open"
          className={`scene-image ${isOn && isTalking && talkPhase === 1 ? "visible" : "hidden"}`}
          draggable={false}
        />

        {/* Switch */}
        <div className="scene-hud">
          <div className="scene-copy">
            <h2 className="scene-title">{title}</h2>
            <p className="scene-subtitle">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={`image-switch ${isOn ? "on" : "off"}`}
            aria-pressed={isOn}
            aria-label={isOn ? "Switch is on" : "Switch is off"}
          >
            <img src={switchImage} alt="Switch" className="switch-image" draggable={false} />
          </button>
        </div>
        {/* Speech text overlay */}
        {isTalking && (
          <div className="speech-overlay">
            <p className="speech-text">{typedText}</p>
          </div>
        )}

        <div className="scene-hud">
          <div className="scene-copy">
            <h2 className="scene-title">{title}</h2>
            <p className="scene-subtitle">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={`image-switch ${isOn ? "on" : "off"}`}
            aria-pressed={isOn}
            aria-label={isOn ? "Switch is on" : "Switch is off"}
          >
            <img src={switchImage} alt="Switch" className="switch-image" draggable={false} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SecretaryScene;


