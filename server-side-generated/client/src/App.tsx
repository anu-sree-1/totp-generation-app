import axios from "axios";
import React, { useState, useEffect } from "react";
const API_BASE = "http://localhost:3001/api";

const App = () => {
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateTotp = async () => {
    if (!secret) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/totp`, { secret });
      setOtp(response.data.token);
    } catch (error: any) {
      console.error(
        "Generate TOTP failed:",
        error.response?.data || error.message
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

//   const verifyOtp = async () => {
//     const result = await verify({ secret, token: otp });
//     setIsValid(result.valid);
//   };

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
