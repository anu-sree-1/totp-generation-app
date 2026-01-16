import { stringToBytes } from "@otplib/core";
import { getRemainingTime } from "@otplib/totp";
import {
  NobleCryptoPlugin,
  ScureBase32Plugin,
  createGuardrails,
  generate,
  verify,
} from "otplib";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import "./App.css";

const totpOptions = {
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
  guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
};
export const validateSecret = (
  str: string,
  setError: Dispatch<SetStateAction<string>>
) => {
  const base32Regex = /^[A-Z0-7]+$/;
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

// as done in google auth
export function normaliseCharset(input: string) {
  return input
    .toUpperCase()
    .replace(/ /g, "") // Remove spaces
    .replace(/1/g, "I") // Replace '1' with 'I' (capital i)
    .replace(/0/g, "O"); // Replace '0' with 'O' (capital o)
}

export const generateToken = async (
  secret: string,
  setOtp: Dispatch<SetStateAction<string>>
) => {
  const token = await generate({
    ...totpOptions,
    secret: normaliseCharset(secret),
  });
  setOtp(token);
};

export const startTotpTimer = async (
  secret: string,
  setError: Dispatch<SetStateAction<string>>,
  setOtp: Dispatch<SetStateAction<string>>,
  setTimeLeft: Dispatch<SetStateAction<number>>,
  timerRef: RefObject<NodeJS.Timeout | null>
) => {
  validateSecret(secret, setError);

  await generateToken(secret, setOtp);
  setTimeLeft(getRemainingTime());

  if (timerRef.current) clearInterval(timerRef.current);

  timerRef.current = setInterval(async () => {
    const remaining = getRemainingTime();
    setTimeLeft(remaining);

    if (remaining === 30) {
      await generateToken(secret, setOtp); // auto-regenerate every 30s
    }
  }, 1000);
};

export const verifyOtp = async (
  setIsValid: Dispatch<SetStateAction<boolean | null>>,
  secret: string,
  otp: string
) => {
  const result = await verify({
    ...totpOptions,
    secret: normaliseCharset(secret),
    token: otp,
  });
  setIsValid(result.valid);
};
