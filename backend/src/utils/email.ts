import nodemailer from "nodemailer";
import { env } from "../config/env";

export type EmailConfig = {
  enabled: boolean;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
  smtpSecure?: boolean | null;
};

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

function resolveConfig(config?: EmailConfig): EmailConfig {
  if (config) return config;
  return {
    enabled: env.EMAIL_ENABLED,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    smtpFrom: env.SMTP_FROM,
    smtpSecure: env.SMTP_SECURE,
  };
}

function getTransport(config: EmailConfig) {
  if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPass || !config.smtpFrom) {
    throw new Error("SMTP config missing");
  }
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure ?? false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

export async function sendEmail({ to, subject, text, config }: SendEmailInput & { config?: EmailConfig }) {
  const resolved = resolveConfig(config);
  if (!resolved.enabled) return;
  const transport = getTransport(resolved);
  const info = await transport.sendMail({
    from: resolved.smtpFrom,
    to,
    subject,
    text,
  });
  return info;
}

type ChargeEmailInput = {
  customerName: string;
  email?: string | null;
  amountCents: number;
  dueDate: string;
  invoiceUrl?: string | null;
  config?: EmailConfig;
};

function formatMoney(cents: number) {
  const value = (cents / 100).toFixed(2).replace(".", ",");
  return `R$ ${value}`;
}

export async function sendChargeEmail(input: ChargeEmailInput) {
  if (!input.email) return;
  const lines = [
    `Ola ${input.customerName}, sua cobranca foi criada.`,
    `Valor: ${formatMoney(input.amountCents)}`,
    `Vencimento: ${input.dueDate}`,
  ];
  if (input.invoiceUrl) lines.push(`Link: ${input.invoiceUrl}`);
  return sendEmail({
    to: input.email,
    subject: "Nova cobranca gerada",
    text: lines.join("\n"),
    config: input.config,
  });
}
