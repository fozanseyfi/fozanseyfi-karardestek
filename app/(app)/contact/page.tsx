"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Sparkles,
  Globe,
  ShieldCheck,
  Info,
  Bug,
  Lightbulb,
  HelpCircle,
} from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sendContactMessage } from "@/app/(app)/contact/actions";

const DEV = {
  name: "Furkan Ozan Seyfi",
  title: "Elektrik Mühendisi",
  phone: "+90 506 684 29 33",
  email: "fozanseyfi@gmail.com",
  linkedin: "https://www.linkedin.com/in/fozanseyfi/",
  website: "https://fozanseyfi.com",
};

type Topic = "feedback" | "bug" | "feature" | "question";

const TOPICS: { key: Topic; label: string; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { key: "feedback", label: "Genel Geri Bildirim", icon: MessageSquare, tone: "blue" },
  { key: "bug", label: "Hata Bildirimi", icon: Bug, tone: "rose" },
  { key: "feature", label: "Özellik Önerisi", icon: Lightbulb, tone: "amber" },
  { key: "question", label: "Soru / Yardım", icon: HelpCircle, tone: "violet" },
];

const TOPIC_TONES = {
  blue: "border-blue-300 bg-blue-50 text-blue-700",
  rose: "border-rose-300 bg-rose-50 text-rose-700",
  amber: "border-amber-300 bg-amber-50 text-amber-700",
  violet: "border-violet-300 bg-violet-50 text-violet-700",
} as const;

export default function ContactPage() {
  const [topic, setTopic] = useState<Topic>("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || message.trim().length < 10) {
      toast.error("Konu ve en az 10 karakterlik mesaj gerekli.");
      return;
    }
    setSending(true);
    try {
      const topicLabel = TOPICS.find((t) => t.key === topic)?.label ?? "Geri Bildirim";
      await sendContactMessage({
        topic: topicLabel,
        subject: subject.trim(),
        message: message.trim(),
      });
      toast.success(`Mesajınız ${DEV.email} adresine iletildi. En kısa sürede dönüş yapılacak.`);
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gönderim hatası");
    } finally {
      setSending(false);
    }
  }

  function mailto() {
    const topicLabel = TOPICS.find((t) => t.key === topic)?.label ?? "";
    const body = `Konu: ${subject}\n\n${message}`;
    window.location.href = `mailto:${DEV.email}?subject=${encodeURIComponent(
      `[${topicLabel}] ${subject || "Geri Bildirim"}`
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-8 md:p-10">
        <div className="bg-grid-slate-100/60 pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,white,transparent_70%)]" />
        <div className="relative max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <MessageSquare className="size-3" />
            İletişim & Destek
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Sizden gelen her geri bildirim platformu daha iyi yapar.
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed md:text-lg">
            Hata bildirimi, özellik önerisi veya genel sorularınız için aşağıdaki formdan veya doğrudan
            iletişim kanallarından bana ulaşabilirsiniz.
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* DEV CARD */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
            <div className="bg-grid-white/[0.04] pointer-events-none absolute inset-0" />
            <div className="relative">
              <div className="bg-primary/20 ring-primary/30 flex size-12 items-center justify-center rounded-xl ring-1 backdrop-blur">
                <Sparkles className="text-primary-foreground size-5" />
              </div>
              <div className="mt-4 text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase">
                Geliştirici
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{DEV.name}</h2>
              <div className="text-sm text-slate-300">{DEV.title}</div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300/90">
                Yenilenebilir enerji sektöründe aktif çalışan bir mühendis olarak EPC tedarik süreçlerinde
                yaşadığım operasyonel ihtiyaçlardan doğan bu platformu sektör paydaşlarının kullanımına
                ücretsiz olarak sunuyorum.
              </p>
            </div>
          </div>

          <CardContent className="space-y-2 p-4">
            <ContactRow href={`tel:${DEV.phone.replace(/\s/g, "")}`} icon={Phone} label="Telefon" value={DEV.phone} />
            <ContactRow href={`mailto:${DEV.email}`} icon={Mail} label="E-posta" value={DEV.email} />
            <ContactRow
              href={DEV.linkedin}
              external
              icon={LinkedinIcon}
              label="LinkedIn"
              value="linkedin.com/in/fozanseyfi"
            />
            <ContactRow
              href={DEV.website}
              external
              icon={Globe}
              label="Web Sitesi"
              value="fozanseyfi.com"
            />
          </CardContent>
        </Card>

        {/* CONTACT FORM */}
        <Card className="border-slate-200/80 shadow-sm lg:col-span-3">
          <CardContent className="p-6 md:p-7">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-tight">Mesaj Bırakın</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Aşağıdaki formu doldurun, hesabınıza bağlı olarak takip edilebilen bir mesaj olarak iletilir.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Topic chips */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-wide uppercase">Konu Türü</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {TOPICS.map((t) => {
                    const Icon = t.icon;
                    const active = topic === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTopic(t.key)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 text-xs font-medium transition-all",
                          active
                            ? TOPIC_TONES[t.tone as keyof typeof TOPIC_TONES]
                            : "hover:bg-muted/50 text-muted-foreground border-slate-200"
                        )}
                      >
                        <Icon className="size-4" />
                        <span className="text-center leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-semibold tracking-wide uppercase">
                  Konu
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Kısa bir özet — örn. PDF çıktısında font sorunu"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-semibold tracking-wide uppercase">
                  Mesaj
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detaylı açıklama: hangi sayfada, hangi adımda yaşandı, ne bekleniyordu, ne oldu?"
                  rows={7}
                  required
                  minLength={10}
                />
                <div className="text-muted-foreground flex justify-between text-[11px]">
                  <span>En az 10 karakter</span>
                  <span className={cn(message.length >= 10 ? "text-emerald-600" : "")}>{message.length} karakter</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={mailto} disabled={sending}>
                  <Mail className="mr-1.5 size-4" />
                  E-posta ile Gönder
                </Button>
                <Button type="submit" disabled={sending} className="min-w-[120px]">
                  <Send className="mr-1.5 size-4" />
                  {sending ? "Gönderiliyor..." : "Gönder"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* TWO INFO CARDS — privacy + disclaimer */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-200/60 bg-emerald-50/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="text-emerald-900 text-[10px] font-semibold tracking-wider uppercase">
                  Veri Gizliliği
                </div>
                <h4 className="mt-0.5 text-sm font-semibold">Verileriniz size aittir</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                  Tüm veriler <strong>RLS</strong> ile şifrelenir, hesaplar arası izole edilir. Geliştirici
                  dahil <strong>hiçbir üçüncü taraf</strong> içeriğinizi göremez veya indiremez.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-amber-50/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                <Info className="size-5" />
              </div>
              <div>
                <div className="text-amber-900 text-[10px] font-semibold tracking-wider uppercase">
                  Sorumluluk Reddi
                </div>
                <h4 className="mt-0.5 text-sm font-semibold">Karar destek aracı</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                  Algoritma sonuçları yol gösterici niteliktedir. Nihai satın alma kararının sorumluluğu
                  kullanıcıya aittir; <strong>teknik/finansal/hukuki danışmanlık yerine geçmez</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContactRow({
  href,
  external,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="hover:bg-muted/60 flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-slate-200"
    >
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">{label}</div>
        <div className="text-foreground truncate text-sm font-medium">{value}</div>
      </div>
    </a>
  );
}
