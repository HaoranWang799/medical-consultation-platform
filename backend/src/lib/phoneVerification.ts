type PhoneCodeRecord = {
  code: string;
  expiresAt: number;
  attemptsLeft: number;
};

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const phoneCodeStore = new Map<string, PhoneCodeRecord>();

function buildKey(phone: string, role: string): string {
  return `${role}:${phone}`;
}

export function createPhoneVerificationCode(phone: string, role: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  phoneCodeStore.set(buildKey(phone, role), {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attemptsLeft: MAX_VERIFY_ATTEMPTS,
  });
  return code;
}

export function verifyPhoneCode(phone: string, role: string, code: string): boolean {
  const key = buildKey(phone, role);
  const record = phoneCodeStore.get(key);

  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    phoneCodeStore.delete(key);
    return false;
  }

  if (record.code !== code) {
    record.attemptsLeft -= 1;
    if (record.attemptsLeft <= 0) {
      phoneCodeStore.delete(key);
    } else {
      phoneCodeStore.set(key, record);
    }
    return false;
  }

  phoneCodeStore.delete(key);
  return true;
}

export function getPhoneCodeDebug(phone: string, role: string): string | null {
  return phoneCodeStore.get(buildKey(phone, role))?.code ?? null;
}
