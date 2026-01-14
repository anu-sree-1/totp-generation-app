import React, { useState, useEffect } from "react";
import { generate, getRemainingTime, verify } from "@otplib/totp";
import { WebCryptoPlugin } from "@otplib/plugin-crypto-web";
import { ScureBase32Plugin } from "@otplib/plugin-base32-scure";
import { createGuardrails, stringToBytes } from "@otplib/core";

const base32 = new ScureBase32Plugin();
const totpOptions = {
  crypto: new WebCryptoPlugin(),
  guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
  base32,
};

const App = () => {
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [isValid, setIsValid] = useState(false);

  function isValidBase32(str: string) {
    try {
      base32.decode(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  const generateTotp = async () => {
    const secretBuffer = isValidBase32(secret)
      ? base32.decode(secret)
      : stringToBytes(secret);

    const token = await generate({ ...totpOptions, secret: secretBuffer });
    const time = getRemainingTime();
    setOtp(token);
  };

  // const verifyOtp = async () => {
  //   const result = await verify({ secret, token: otp });
  //   setIsValid(result.valid);
  // };

  return (
    <div>
      <input
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Enter Secret"
      />
      <button onClick={generateTotp}>Get TOTP</button>

      <br />

      {/* <p>Current OTP: {otp}</p>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={verifyOtp}>Verify</button>
      <p>Valid: {isValid ? "Yes" : "No"}</p> */}
    </div>
  );
};

export default App;
