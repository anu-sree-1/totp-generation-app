import { useEffect, useRef, useState } from "react";
import "./App.css";
import { startTotpTimer, verifyOtp } from "./utils";

const App = () => {
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="App">
      <h1>🔐 TOTP Generator</h1>

      <div className="input-group">
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter your secret key"
        />
        {error && <p style={{ marginTop: "2px", color: "red" }}>{error}</p>}
      </div>

      <button
        onClick={() =>
          startTotpTimer(secret, setError, setOtp, setTimeLeft, timerRef)
        }
      >
        Generate TOTP
      </button>

      <div className="otp-display">{otp || "---"}</div>

      {otp && (
        <p style={{ marginTop: "8px" }}>
          Expires in: <strong>{timeLeft}s</strong>
        </p>
      )}

      <div className="input-group">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP to verify"
        />
        <button onClick={()=>verifyOtp(setIsValid, secret, otp)}>Verify</button>
      </div>

      {isValid !== null && (
        <div className={isValid ? "status valid" : "status invalid"}>
          Valid: {isValid ? "Yes" : "No"}
        </div>
      )}
    </div>
  );
};

export default App;
