import React, { useState, useEffect } from "react";
import { generateSecret, generate, verify } from "otplib";
import { base32 } from "otplib/utils";

// Disable strict Base32 validation
base32.setDecoder((str: string) => Buffer.from(str, "utf8"));

const App = () => {
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [isValid, setIsValid] = useState(false);

  const generateTotp = async () => {
    console.log("🚀 ~ generateTotp ~ secret:", secret);
    const token = await generate({ secret });
    console.log("🚀 ~ generateTotp ~ token:", token);
    setOtp(token);
  };

  const verifyOtp = async () => {
    const result = await verify({ secret, token: otp });
    setIsValid(result.valid);
  };

  return (
    <div>
      <input
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Enter Secret"
      />
      <button onClick={generateTotp}>Get TOTP</button>

      <br />

      <p>Current OTP: {otp}</p>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={verifyOtp}>Verify</button>
      <p>Valid: {isValid ? "Yes" : "No"}</p>
    </div>
  );
};

export default App;
