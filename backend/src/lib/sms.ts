import { createRequire } from "module";

const require = createRequire(import.meta.url);
const tencentcloud = require("tencentcloud-sdk-nodejs");

type SendSmsResult = {
  provider: "tencent";
  serialNo?: string;
};

type SmsProviderStatus =
  | { enabled: false; reason: string }
  | { enabled: true };

function getEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

function getTencentSmsConfig() {
  return {
    secretId: getEnv("TENCENTCLOUD_SECRET_ID"),
    secretKey: getEnv("TENCENTCLOUD_SECRET_KEY"),
    sdkAppId: getEnv("TENCENTCLOUD_SMS_APP_ID"),
    signName: getEnv("TENCENTCLOUD_SMS_SIGN_NAME"),
    templateId: getEnv("TENCENTCLOUD_SMS_TEMPLATE_ID"),
    region: getEnv("TENCENTCLOUD_SMS_REGION") || "ap-guangzhou",
  };
}

export function getSmsProviderStatus(): SmsProviderStatus {
  const config = getTencentSmsConfig();
  if (!config.secretId || !config.secretKey || !config.sdkAppId || !config.signName || !config.templateId) {
    return { enabled: false, reason: "腾讯云短信配置不完整，已回退为调试验证码模式" };
  }

  return { enabled: true };
}

function formatChinesePhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+86${phone}`;
}

export async function sendVerificationCodeSms(phone: string, code: string): Promise<SendSmsResult> {
  const config = getTencentSmsConfig();
  const status = getSmsProviderStatus();
  if (!status.enabled) {
    throw new Error(status.reason);
  }

  const clientConfig = {
    credential: {
      secretId: config.secretId,
      secretKey: config.secretKey,
    },
    region: config.region,
    profile: {
      httpProfile: {
        endpoint: "sms.tencentcloudapi.com",
      },
    },
  };

  const SmsClient = tencentcloud.sms.v20210111.Client;
  const client = new SmsClient(clientConfig);

  const response = await client.SendSms({
    SmsSdkAppId: config.sdkAppId,
    SignName: config.signName,
    TemplateId: config.templateId,
    PhoneNumberSet: [formatChinesePhone(phone)],
    TemplateParamSet: [code, "5"],
  });

  const sendStatus = response.SendStatusSet?.[0];
  if (!sendStatus || sendStatus.Code !== "Ok") {
    throw new Error(sendStatus?.Message || "腾讯云短信发送失败");
  }

  return {
    provider: "tencent",
    serialNo: sendStatus.SerialNo,
  };
}
