import axios from "axios";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import QrScanner from "qr-scanner";

const API_BASE = "http://localhost:3001/api";

const App = () => {
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);

  const generateTotp = async () => {
    if (!secret) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/totp`, { secret });
      console.log("🚀 ~ response:", response.data);
      setOtp(response.data.token);
    } catch (error: any) {
      console.error("TOTP failed:", error.response?.data || error.message);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setScanning(true);
    setResult("Scanning QR...");

    try {
      // qr-scanner works directly with File objects
      const qrData = await QrScanner.scanImage(file);
      
      setResult(qrData);
      
      // Extract TOTP secret from otpauth://totp/...
      const secretMatch = qrData.match(/secret=([^&]+)/i);
      if (secretMatch) {
        const extractedSecret = decodeURIComponent(secretMatch[1]);
        setSecret(extractedSecret);
        // Auto generate OTP
        setTimeout(() => generateTotp(), 300);
      } else {
        setResult("QR scanned but no TOTP secret found");
      }
    } catch (error: any) {
      console.error("QR scan failed:", error);
      setResult("No QR code found in image");
    } finally {
      setScanning(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1
  });

  return (
    <div style={{ 
      padding: '20px', maxWidth: '500px', margin: '0 auto', 
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>QR → TOTP</h2>
      
      <div
        {...getRootProps()}
        style={{
          border: '3px dashed #10b981',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          background: isDragActive ? '#ecfdf5' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: '20px'
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#059669' }}>
          Drop QR screenshot here
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
          Google Authenticator, Authy, etc.
        </div>
      </div>

      {scanning && (
        <div style={{
          textAlign: 'center', padding: '20px',
          background: '#fef3c7', borderRadius: '8px', color: '#92400e'
        }}>
          🔍 Scanning QR code...
        </div>
      )}

      {result && !scanning && (
        <div style={{ 
          margin: '20px 0', padding: '16px', 
          background: '#dbeafe', borderRadius: '8px',
          fontFamily: 'monospace', fontSize: '14px',
          wordBreak: 'break-all', lineHeight: 1.5
        }}>
          <strong>QR Data:</strong>
          <div>{result}</div>
        </div>
      )}

      <input
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="TOTP Secret (auto-filled from QR)"
        style={{ 
          width: '100%', padding: '14px', marginBottom: '16px',
          border: '1px solid #d1d5db', borderRadius: '8px',
          fontFamily: 'monospace', fontSize: '14px'
        }}
      />
      
      <button
        onClick={generateTotp}
        disabled={loading || !secret}
        style={{
          width: '100%', padding: '16px', 
          background: loading || !secret ? '#9ca3af' : '#10b981',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 600,
          cursor: loading || !secret ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? "⏳ Generating..." : `🚀 Get TOTP Code`}
      </button>

      {otp && (
        <div style={{
          marginTop: '24px', padding: '32px 20px',
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          borderRadius: '16px', textAlign: 'center',
          fontSize: '36px', fontFamily: 'monospace', 
          fontWeight: 'bold', letterSpacing: '6px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)'
        }}>
          {otp}
        </div>
      )}
    </div>
  );
};

export default App;
  