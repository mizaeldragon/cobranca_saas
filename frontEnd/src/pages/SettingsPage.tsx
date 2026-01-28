import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { clearAuth, getAuth, setAuth } from "../lib/auth";
import { maskPhone, onlyDigits } from "../lib/masks";
import { Button, Card, Input, Label, SectionTitle, Select } from "../components/ui";

type SettingsTab = "dados" | "seguranca" | "gateways" | "whatsapp" | "email";

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("dados");
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userBaseline, setUserBaseline] = useState({ fullName: "", email: "", phone: "" });
  const authRole = getAuth()?.role ?? "ADMIN";
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
        const [companyData, userData] = await Promise.all([api.getCompany(), api.getMe()]);
        if (!active) return;
        setForm({
          legalName: (companyData as any).legal_name ?? "",
          bankProvider: (companyData as any).bank_provider ?? "mock",
          providerApiKey: "",
          whatsappEnabled: Boolean((companyData as any).whatsapp_enabled),
          whatsappProvider: (companyData as any).whatsapp_provider ?? "meta",
          metaAccessToken: (companyData as any).meta_access_token ?? "",
          metaPhoneNumberId: (companyData as any).meta_phone_number_id ?? "",
          metaBaseUrl: (companyData as any).meta_base_url ?? "https://graph.facebook.com/v20.0",
          metaTemplateName: (companyData as any).meta_template_name ?? "",
          metaTemplateLanguage: (companyData as any).meta_template_language ?? "pt_BR",
          emailEnabled: Boolean((companyData as any).email_enabled),
          smtpHost: (companyData as any).smtp_host ?? "",
          smtpPort: (companyData as any).smtp_port ? String((companyData as any).smtp_port) : "587",
          smtpUser: (companyData as any).smtp_user ?? "",
          smtpPass: (companyData as any).smtp_pass ?? "",
          smtpFrom: (companyData as any).smtp_from ?? "",
          smtpSecure: Boolean((companyData as any).smtp_secure),
        });
        const baseFullName = (userData as any).full_name ?? "";
        const baseEmail = (userData as any).email ?? "";
        const basePhone = (userData as any).phone ?? "";
        setUserBaseline({ fullName: baseFullName, email: baseEmail, phone: basePhone });
        setUserForm((prev) => ({
          ...prev,
          fullName: baseFullName,
          email: baseEmail,
          phone: maskPhone(basePhone),
        }));
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

  useEffect(() => {
    setSuccess(null);
    setError(null);
  }, [tab]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 3500);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    try {
      if (tab === "dados" || tab === "seguranca") {
        if (userForm.newPassword && userForm.newPassword !== userForm.confirmPassword) {
          setError("As senhas nao conferem");
          return;
        }
        const normalizedPhone = onlyDigits(userForm.phone);
        const fullNameChanged = userForm.fullName.trim() !== userBaseline.fullName.trim();
        const emailChanged = userForm.email.trim().toLowerCase() !== userBaseline.email.trim().toLowerCase();
        const phoneChanged = normalizedPhone !== onlyDigits(userBaseline.phone);
        const wantsPassword = Boolean(userForm.newPassword);
        if (wantsPassword && !userForm.currentPassword) {
          setError("Informe a senha atual para atualizar a senha");
          return;
        }
        const payload = {
          fullName: fullNameChanged ? userForm.fullName.trim() : undefined,
          email: emailChanged ? userForm.email.trim() : undefined,
          phone: phoneChanged ? normalizedPhone : undefined,
          currentPassword: userForm.currentPassword || undefined,
          newPassword: userForm.newPassword || undefined,
        };
        const result = (await api.updateMe(payload)) as any;
        if (result?.user) {
          setUserBaseline({
            fullName: result.user.full_name ?? userBaseline.fullName,
            email: result.user.email ?? userBaseline.email,
            phone: result.user.phone ?? userBaseline.phone,
          });
          setUserForm((prev) => ({
            ...prev,
            fullName: result.user.full_name ?? prev.fullName,
            email: result.user.email ?? prev.email,
            phone: maskPhone(result.user.phone ?? ""),
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
          if (result.auth) {
            setAuth(result.auth);
          }
          if (result.passwordChanged) {
            clearAuth();
            setSuccess("Senha alterada. Entre novamente.");
            setTimeout(() => {
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
            }, 800);
            return;
          }
        }
        setSuccess("Usuario atualizado.");
      } else if (authRole === "OWNER") {
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
      }
    } catch (err: any) {
      setError(err?.message ?? "Falha ao atualizar");
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Settings</SectionTitle>
        <p className="text-sm text-ink-700">Gerencie dados, seguranca, gateways e integracoes.</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "dados", label: "Dados" },
            { id: "seguranca", label: "Seguranca" },
            ...(authRole === "OWNER"
              ? [
                  { id: "gateways", label: "Gateways" },
                  { id: "whatsapp", label: "WhatsApp" },
                  { id: "email", label: "Email" },
                ]
              : []),
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as SettingsTab)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                tab === item.id ? "bg-ink-900 text-sand-50" : "bg-ink-700/10 text-ink-700 hover:bg-ink-700/20"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {tab === "dados" && (
            <>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: maskPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </>
          )}

          {tab === "seguranca" && (
            <>
              <div className="space-y-2">
                <Label>Senha atual</Label>
                <Input
                  type="password"
                  value={userForm.currentPassword}
                  onChange={(e) => setUserForm({ ...userForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <Input
                  type="password"
                  value={userForm.newPassword}
                  onChange={(e) => setUserForm({ ...userForm, newPassword: e.target.value })}
                  placeholder="Minimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar senha</Label>
                <Input
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                />
              </div>
            </>
          )}

          {tab === "gateways" && authRole === "OWNER" && (
            <>
              <div className="space-y-2">
                <Label>Banco principal</Label>
                <Select value={form.bankProvider} onChange={(e) => setForm({ ...form, bankProvider: e.target.value })}>
                  <option value="mock">Mock</option>
                  <option value="asaas">Asaas</option>
                  <option value="cora" disabled>
                    Cora (em breve)
                  </option>
                  <option value="santander" disabled>
                    Santander (em breve)
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
            </>
          )}

          {tab === "whatsapp" && authRole === "OWNER" && (
            <>
              <div className="md:col-span-2">
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
            </>
          )}

          {tab === "email" && authRole === "OWNER" && (
            <>
              <div className="md:col-span-2">
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
            </>
          )}

          <div className="flex items-end md:col-span-2">
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
