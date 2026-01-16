import express, { Request, Response } from "express";
import cors from "cors";
import {
  generate,
  NobleCryptoPlugin,
  ScureBase32Plugin,
  createGuardrails,
  verify,
} from "otplib";
import { stringToBytes } from "@otplib/core";
import { getRemainingTime } from "@otplib/totp";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5174" })); // Your React dev server
app.use(express.json());

const base32 = new ScureBase32Plugin();
const totpOptions = { guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }) };

function isValidBase32(str: string) {
  try {
    base32.decode(str);
    return true;
  } catch (error) {
    return false;
  }
}

// normalise secret to match older g-auth totps
function normaliseCharset(input: string) {
  return input
    .toUpperCase()
    .replace(/ /g, "") // Remove spaces
    .replace(/1/g, "I") // Replace '1' with 'I' (capital i)
    .replace(/0/g, "O"); // Replace '0' with 'O' (capital o)
}

// 1. Generate totp
app.post("/api/totp", async (req: Request, res: Response) => {
  try {
    const totp = await generate({
      ...totpOptions,
      secret: normaliseCharset(req.body.secret),
    });
    res.json({ totp });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// 2. Verify user-submitted OTP
app.post("/api/totp/verify", async (req: Request, res: Response) => {
  const { token, secret } = req.body;

  if (!token || !secret) {
    return res.status(400).json({ error: "Token and secret required" });
  }

  const secretB32 = isValidBase32(secret)
    ? secret
    : base32.encode(stringToBytes(secret));
  const isValid = await verify({ ...totpOptions, token, secret: secretB32 });

  if (isValid) {
    res.json({ success: true, message: "TOTP verified!" });
  } else {
    res.status(401).json({ success: false, message: "Invalid TOTP" });
  }
});

app.listen(PORT, () => {
  console.log(`TOTP Server running at http://localhost:${PORT}`);
});
