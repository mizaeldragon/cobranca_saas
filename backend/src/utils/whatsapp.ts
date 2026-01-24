import axios from "axios";
import { env } from "../config/env";

export type WhatsAppConfig = {
  enabled: boolean;
  provider: "meta" | "twilio";
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
  twilioFrom?: string | null;
  twilioTemplateSid?: string | null;
  metaAccessToken?: string | null;
  metaPhoneNumberId?: string | null;
  metaBaseUrl?: string | null;
  metaTemplateName?: string | null;
  metaTemplateLanguage?: string | null;
};

export type WhatsAppSendResult = {
  provider: "meta" | "twilio";
  status?: string;
  sid?: string;
  raw?: any;
};

type SendWhatsAppInput = {
  to: string;
  body: string;
  templateVars?: Record<string, string>;
  config?: WhatsAppConfig;
};

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function resolveConfig(config?: WhatsAppConfig): WhatsAppConfig {
  if (config) return config;
  return {
    enabled: env.WHATSAPP_ENABLED,
    provider: (env.WHATSAPP_PROVIDER ?? "meta") as "meta" | "twilio",
    twilioAccountSid: env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: env.TWILIO_AUTH_TOKEN,
    twilioFrom: env.TWILIO_WHATSAPP_FROM,
    twilioTemplateSid: env.TWILIO_WHATSAPP_TEMPLATE_SID,
    metaAccessToken: env.WHATSAPP_ACCESS_TOKEN,
    metaPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    metaBaseUrl: env.WHATSAPP_BASE_URL,
    metaTemplateName: process.env.WHATSAPP_TEMPLATE_NAME,
    metaTemplateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE,
  };
}

export async function sendWhatsAppMessage({
  to,
  body,
  templateVars,
  config,
}: SendWhatsAppInput): Promise<WhatsAppSendResult | null> {
  const resolved = resolveConfig(config);
  if (!resolved.enabled) return;

  const normalized = normalizePhone(to);
  if (!normalized) return;

  if (resolved.provider === "meta") {
    if (!resolved.metaAccessToken || !resolved.metaPhoneNumberId) {
      throw new Error("WhatsApp config missing");
    }

    const baseUrl = resolved.metaBaseUrl ?? "https://graph.facebook.com/v20.0";
    const hasTemplate = Boolean(resolved.metaTemplateName);
    const templateParams = templateVars
      ? Object.keys(templateVars)
          .sort()
          .map((key) => ({ type: "text", text: String(templateVars[key] ?? "") }))
      : [];
    const payload = hasTemplate
      ? {
          messaging_product: "whatsapp",
          to: normalized,
          type: "template",
          template: {
            name: resolved.metaTemplateName,
            language: { code: resolved.metaTemplateLanguage ?? "pt_BR" },
            components: [{ type: "body", parameters: templateParams }],
          },
        }
      : {
          messaging_product: "whatsapp",
          to: normalized,
          type: "text",
          text: { body },
        };

    const res = await axios.post(`${baseUrl}/${resolved.metaPhoneNumberId}/messages`, payload, {
      headers: {
        Authorization: `Bearer ${resolved.metaAccessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
    return { provider: "meta", raw: res.data };
  }

  if (resolved.provider === "twilio") {
    if (!resolved.twilioAccountSid || !resolved.twilioAuthToken || !resolved.twilioFrom) {
      throw new Error("Twilio WhatsApp config missing");
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${resolved.twilioAccountSid}/Messages.json`;
    const payload = new URLSearchParams({
      From: resolved.twilioFrom,
      To: `whatsapp:+${normalized}`,
    });
    if (resolved.twilioTemplateSid) {
      payload.set("ContentSid", resolved.twilioTemplateSid);
      if (templateVars) {
        payload.set("ContentVariables", JSON.stringify(templateVars));
      }
    } else {
      payload.set("Body", body);
    }

    const res = await axios.post(url, payload.toString(), {
      auth: {
        username: resolved.twilioAccountSid,
        password: resolved.twilioAuthToken,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
    });
    return {
      provider: "twilio",
      sid: res.data?.sid,
      status: res.data?.status,
      raw: res.data,
    };
  }

  throw new Error(`Unsupported WhatsApp provider: ${resolved.provider}`);
}

type ChargeWhatsAppInput = {
  customerName: string;
  phone?: string | null;
  amountCents: number;
  dueDate: string;
  invoiceUrl?: string | null;
  config?: WhatsAppConfig;
};

function formatMoney(cents: number) {
  const value = (cents / 100).toFixed(2).replace(".", ",");
  return `R$ ${value}`;
}

export async function sendChargeWhatsApp(input: ChargeWhatsAppInput) {
  if (!input.phone) return;

  const lines = [
    `Ola ${input.customerName}, sua cobranca foi criada.`,
    `Valor: ${formatMoney(input.amountCents)}`,
    `Vencimento: ${input.dueDate}`,
  ];
  if (input.invoiceUrl) lines.push(`Link: ${input.invoiceUrl}`);

  return sendWhatsAppMessage({
    to: input.phone,
    body: lines.join("\n"),
    templateVars: {
      "1": input.customerName,
      "2": formatMoney(input.amountCents),
      "3": input.dueDate,
      "4": input.invoiceUrl ?? "-",
    },
    config: input.config,
  });
}
