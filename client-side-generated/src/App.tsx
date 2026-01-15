import { stringToBytes } from "@otplib/core";
import { getRemainingTime } from "@otplib/totp";
import {
  NobleCryptoPlugin,
  ScureBase32Plugin,
  createGuardrails,
  generate,
  verify,
} from "otplib";
import { useEffect, useRef, useState } from "react";
import "./App.css";

const base32 = new ScureBase32Plugin();

const totpOptions = {
  crypto: new NobleCryptoPlugin(),
  base32,
  guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
};

const App = () => {
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function isValidBase32(str: string) {
    try {
      base32.decode(str);
      return true;
    } catch {
      return false;
    }
  }

  const validateSecret = (str: string) => {
    const base32Regex = /^[A-Z2-7]+$/;
    const trimmed = str.trim();

    if (!base32Regex.test(trimmed)) {
      setError("Key value has illegal character");
      throw new Error("Key value has illegal character");
    }

    if (trimmed.length < 16) {
      setError("Key too short (min 16 chars)");
      throw new Error("Key too short (min 16 chars)");
    }

    if (trimmed.length > 64) {
      setError("Key too long (max 64 chars)");
      throw new Error("Key too long (max 64 chars)");
    }

    setError("");
  };

  const getSecretBase32 = () =>
    isValidBase32(secret) ? secret : base32.encode(stringToBytes(secret));

  const generateToken = async () => {
    const token = await generate({
      ...totpOptions,
      secret: getSecretBase32(),
    });
    setOtp(token);
  };

  const startTotpTimer = async () => {
    validateSecret(secret);

    await generateToken();
    setTimeLeft(getRemainingTime());

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      const remaining = getRemainingTime();
      setTimeLeft(remaining);

      if (remaining === 30) {
        await generateToken(); // auto-regenerate every 30s
      }
    }, 1000);
  };

  const verifyOtp = async () => {
    const result = await verify({
      ...totpOptions,
      secret: getSecretBase32(),
      token: otp,
    });
    setIsValid(result.valid);
  };

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

      <button onClick={startTotpTimer}>Generate TOTP</button>

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
        <button onClick={verifyOtp}>Verify</button>
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
