import { stringToBytes } from "@otplib/core";
import { getRemainingTime } from "@otplib/totp";
import {
  NobleCryptoPlugin,
  ScureBase32Plugin,
  createGuardrails,
  generate,
  verify,
} from "otplib";
import { useState } from "react";
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

  function isValidBase32(str: string) {
    try {
      base32.decode(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  const validateSecret = (str: string) => {
    const illegalCharRegex = /[A-Z2-7]/;
    const trimmed = str.trim();

    if (!illegalCharRegex.test(trimmed)) {
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

  const generateTotp = async () => {
    validateSecret(secret);

    const secretB32 = isValidBase32(secret)
      ? secret
      : base32.encode(stringToBytes(secret));

    const token = await generate({ ...totpOptions, secret: secretB32 });
    const time = getRemainingTime();
    setOtp(token);
  };

  const verifyOtp = async () => {
    const secretB32 = isValidBase32(secret)
      ? secret
      : base32.encode(stringToBytes(secret));
    const result = await verify({
      ...totpOptions,
      secret: secretB32,
      token: otp,
    });
    setIsValid(result.valid);
  };

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

      <button onClick={generateTotp}>✨ Generate TOTP</button>

      <div className="otp-display">{otp || "---"}</div>

      <div className="input-group">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP to verify"
        />
        <button onClick={verifyOtp}>✅ Verify</button>
      </div>

      {isValid !== null && (
        <div className={isValid ? "status valid" : "status invalid"}>
          Valid: {isValid ? "Yes ✨" : "No ❌"}
        </div>
      )}
    </div>
  );
};

export default App;
