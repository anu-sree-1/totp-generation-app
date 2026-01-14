import express, { Request, Response } from "express";
import cors from "cors";
import { generate } from "otplib";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5174" })); // Your React dev server
app.use(express.json());

// 1. Generate totp
app.post("/api/totp", async (req: Request, res: Response) => {
  try {
    console.log("🚀 ~ req.body.secret:", req.body.secret);
    // const encodedsecret = authenticator.encode(req.body.secret);
    // console.log("🚀 ~ encodedsecret:", encodedsecret);
    const totp = await generate({ secret: req.body.secret });
    console.log("🚀 ~ totp:", totp);
    res.json({ totp });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(500).json({ error });
  }
});

// // 2. Verify user-submitted OTP
// app.post("/api/totp/verify", (req: Request, res: Response) => {
//   const { token, secret } = req.body;

//   if (!token || !secret) {
//     return res.status(400).json({ error: "Token and secret required" });
//   }

//   const isValid = authenticator.check(token, secret);

//   if (isValid) {
//     res.json({ success: true, message: "TOTP verified!" });
//   } else {
//     res.status(401).json({ success: false, message: "Invalid TOTP" });
//   }
// });

// // 3. Check existing secret (for testing)
// app.get("/api/totp/status/:secret", (req: Request, res: Response) => {
//   const { secret } = req.params;
//   const currentOtp = totp.generate(secret);
//   res.json({ currentOtp });
// });

app.listen(PORT, () => {
  console.log(`TOTP Server running at http://localhost:${PORT}`);
});
