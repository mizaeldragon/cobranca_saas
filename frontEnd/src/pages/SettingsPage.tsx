import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { Button, Card, Input, Label, SectionTitle, Select } from "../components/ui";

export function SettingsPage() {
  const [form, setForm] = useState({
    legalName: "",
    bankProvider: "mock",
    providerApiKey: "",
    whatsappEnabled: false,
    whatsappProvider: "meta",
    metaAccessToken: "",
    metaPhoneNumberId: "",
    metaBaseUrl: "https://graph.facebook.com/v20.0",
    metaTemplateName: "",
    metaTemplateLanguage: "pt_BR",
    emailEnabled: false,
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
    smtpSecure: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = (await api.getCompany()) as any;
        if (!active) return;
        setForm({
          legalName: data.legal_name ?? "",
          bankProvider: data.bank_provider ?? "mock",
          providerApiKey: "",
          whatsappEnabled: Boolean(data.whatsapp_enabled),
          whatsappProvider: data.whatsapp_provider ?? "meta",
          metaAccessToken: data.meta_access_token ?? "",
          metaPhoneNumberId: data.meta_phone_number_id ?? "",
          metaBaseUrl: data.meta_base_url ?? "https://graph.facebook.com/v20.0",
          metaTemplateName: data.meta_template_name ?? "",
          metaTemplateLanguage: data.meta_template_language ?? "pt_BR",
          emailEnabled: Boolean(data.email_enabled),
          smtpHost: data.smtp_host ?? "",
          smtpPort: data.smtp_port ? String(data.smtp_port) : "587",
          smtpUser: data.smtp_user ?? "",
          smtpPass: data.smtp_pass ?? "",
          smtpFrom: data.smtp_from ?? "",
          smtpSecure: Boolean(data.smtp_secure),
        });
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? "Failed to load company");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    try {
      await api.updateCompany({
        legalName: form.legalName || undefined,
        bankProvider: form.bankProvider,
        providerApiKey: form.providerApiKey || null,
        whatsappEnabled: form.whatsappEnabled,
        whatsappProvider: form.whatsappProvider,
        metaAccessToken: form.metaAccessToken || null,
        metaPhoneNumberId: form.metaPhoneNumberId || null,
        metaBaseUrl: form.metaBaseUrl || null,
        metaTemplateName: form.metaTemplateName || null,
        metaTemplateLanguage: form.metaTemplateLanguage || null,
        emailEnabled: form.emailEnabled,
        smtpHost: form.smtpHost || null,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : null,
        smtpUser: form.smtpUser || null,
        smtpPass: form.smtpPass || null,
        smtpFrom: form.smtpFrom || null,
        smtpSecure: form.smtpSecure,
      });
      setSuccess("Empresa atualizada.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to update company");
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Configurar empresa</SectionTitle>
        <p className="text-sm text-ink-700">Atualize dados, banco principal e credenciais.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Nome legal</Label>
            <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
            {fieldErrors.legalName?.[0] && <p className="text-xs text-red-500">{fieldErrors.legalName[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Banco principal</Label>
            <Select value={form.bankProvider} onChange={(e) => setForm({ ...form, bankProvider: e.target.value })}>
              <option value="mock">Mock</option>
              <option value="asaas">Asaas</option>
              <option value="cora" disabled>
                Cora (em breve)
              </option>
            </Select>
            {fieldErrors.bankProvider?.[0] && <p className="text-xs text-red-500">{fieldErrors.bankProvider[0]}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>API Key</Label>
            <Input
              value={form.providerApiKey}
              onChange={(e) => setForm({ ...form, providerApiKey: e.target.value })}
              placeholder="Deixe vazio para manter"
            />
            {fieldErrors.providerApiKey?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.providerApiKey[0]}</p>
            )}
          </div>

          <div className="md:col-span-2 pt-4">
            <SectionTitle>WhatsApp (Meta)</SectionTitle>
            <p className="text-sm text-ink-700">
              Cada empresa usa suas proprias credenciais da Meta Cloud API.
            </p>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.whatsappEnabled}
              onChange={(e) => setForm({ ...form, whatsappEnabled: e.target.checked })}
            />
            <span className="text-sm text-ink-700">Ativar WhatsApp</span>
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={form.whatsappProvider}
              onChange={(e) => setForm({ ...form, whatsappProvider: e.target.value })}
            >
              <option value="meta">Meta Cloud API</option>
            </Select>
            {fieldErrors.whatsappProvider?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.whatsappProvider[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Access Token</Label>
            <Input
              value={form.metaAccessToken}
              onChange={(e) => setForm({ ...form, metaAccessToken: e.target.value })}
              placeholder="Token da Meta"
            />
            {fieldErrors.metaAccessToken?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.metaAccessToken[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone Number ID</Label>
            <Input
              value={form.metaPhoneNumberId}
              onChange={(e) => setForm({ ...form, metaPhoneNumberId: e.target.value })}
              placeholder="ID do numero de telefone"
            />
            {fieldErrors.metaPhoneNumberId?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.metaPhoneNumberId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input
              value={form.metaBaseUrl}
              onChange={(e) => setForm({ ...form, metaBaseUrl: e.target.value })}
              placeholder="https://graph.facebook.com/v20.0"
            />
            {fieldErrors.metaBaseUrl?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.metaBaseUrl[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Template name</Label>
            <Input
              value={form.metaTemplateName}
              onChange={(e) => setForm({ ...form, metaTemplateName: e.target.value })}
              placeholder="cobranca_gerada"
            />
            {fieldErrors.metaTemplateName?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.metaTemplateName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Template language</Label>
            <Input
              value={form.metaTemplateLanguage}
              onChange={(e) => setForm({ ...form, metaTemplateLanguage: e.target.value })}
              placeholder="pt_BR"
            />
            {fieldErrors.metaTemplateLanguage?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.metaTemplateLanguage[0]}</p>
            )}
          </div>

          <div className="md:col-span-2 pt-4">
            <SectionTitle>Email (SMTP)</SectionTitle>
            <p className="text-sm text-ink-700">Configure o servidor de email da empresa.</p>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.emailEnabled}
              onChange={(e) => setForm({ ...form, emailEnabled: e.target.checked })}
            />
            <span className="text-sm text-ink-700">Ativar Email</span>
          </div>

          <div className="space-y-2">
            <Label>SMTP Host</Label>
            <Input value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} />
            {fieldErrors.smtpHost?.[0] && <p className="text-xs text-red-500">{fieldErrors.smtpHost[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label>SMTP Port</Label>
            <Input
              value={form.smtpPort}
              onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
              placeholder="587"
            />
            {fieldErrors.smtpPort?.[0] && <p className="text-xs text-red-500">{fieldErrors.smtpPort[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label>SMTP User</Label>
            <Input value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} />
            {fieldErrors.smtpUser?.[0] && <p className="text-xs text-red-500">{fieldErrors.smtpUser[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label>SMTP Pass</Label>
            <Input value={form.smtpPass} onChange={(e) => setForm({ ...form, smtpPass: e.target.value })} />
            {fieldErrors.smtpPass?.[0] && <p className="text-xs text-red-500">{fieldErrors.smtpPass[0]}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>SMTP From</Label>
            <Input value={form.smtpFrom} onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })} />
            {fieldErrors.smtpFrom?.[0] && <p className="text-xs text-red-500">{fieldErrors.smtpFrom[0]}</p>}
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.smtpSecure}
              onChange={(e) => setForm({ ...form, smtpSecure: e.target.checked })}
            />
            <span className="text-sm text-ink-700">SMTP Secure (SSL)</span>
          </div>

          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
          {error && <p className="text-sm text-ember-500 md:col-span-2">{error}</p>}
          {success && <p className="text-sm text-tide-600 md:col-span-2">{success}</p>}
        </form>
      </Card>
    </div>
  );
}
