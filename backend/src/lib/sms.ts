import twilio from "twilio";
import { createPhoneVerificationCode, getPhoneCodeDebug, verifyPhoneCode } from "./phoneVerification.js";

type SmsProviderStatus =
  | { enabled: false; provider: "debug"; reason: string }
  | { enabled: true; provider: "twilio" };

function getEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

function getTwilioConfig() {
  return {
    accountSid: getEnv("TWILIO_ACCOUNT_SID"),
    authToken: getEnv("TWILIO_AUTH_TOKEN"),
    verifyServiceSid: getEnv("TWILIO_VERIFY_SERVICE_SID"),
  };
}

function formatE164Phone(phone: string): string {
  return phone.startsWith("+") ? phone : `+86${phone}`;
}

export function getSmsProviderStatus(): SmsProviderStatus {
  const config = getTwilioConfig();
  if (!config.accountSid || !config.authToken || !config.verifyServiceSid) {
    return { enabled: false, provider: "debug", reason: "Twilio Verify 配置不完整，已回退为调试验证码模式" };
  }

  return { enabled: true, provider: "twilio" };
}

export async function sendPhoneVerificationCode(phone: string, role: string): Promise<{ debugCode?: string }> {
  const status = getSmsProviderStatus();

  if (status.enabled) {
    const config = getTwilioConfig();
    const client = twilio(config.accountSid, config.authToken);
    await client.verify.v2.services(config.verifyServiceSid).verifications.create({
      to: formatE164Phone(phone),
      channel: "sms",
    });
    return {};
  }

  const code = createPhoneVerificationCode(phone, role);
  console.log(`📱 调试验证码 [${role}] ${phone}: ${code}`);

  const debugCode =
    process.env.NODE_ENV !== "production" || process.env.SMS_DEBUG_CODE === "true"
      ? getPhoneCodeDebug(phone, role) ?? undefined
      : undefined;

  return { debugCode };
}

export async function checkPhoneVerificationCode(phone: string, role: string, code: string): Promise<boolean> {
  const status = getSmsProviderStatus();

  if (status.enabled) {
    const config = getTwilioConfig();
    const client = twilio(config.accountSid, config.authToken);
    const result = await client.verify.v2.services(config.verifyServiceSid).verificationChecks.create({
      to: formatE164Phone(phone),
      code,
    });
    return result.status === "approved";
  }

  return verifyPhoneCode(phone, role, code);
}
