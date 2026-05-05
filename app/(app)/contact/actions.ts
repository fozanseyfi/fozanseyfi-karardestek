"use server";

import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

const DEV_EMAIL = "fozanseyfi@gmail.com";

type SendInput = {
  topic: string;
  subject: string;
  message: string;
};

export async function sendContactMessage(input: SendInput) {
  // 1. Oturum doğrula
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");

  const subject = (input.subject ?? "").trim();
  const message = (input.message ?? "").trim();
  const topic = (input.topic ?? "feedback").trim();
  if (!subject || message.length < 10) {
    throw new Error("Konu ve en az 10 karakterlik mesaj gerekli.");
  }

  // 2. Profil bilgisi
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const senderEmail = (profile?.email as string | null) ?? user.email ?? "bilinmiyor@example.com";
  const senderName = (profile?.full_name as string | null) ?? senderEmail;

  // 3. DB kaydı (denetim izi için)
  const finalSubject = `[${topic}] ${subject}`;
  const { error: dbErr } = await supabase.from("feedbacks").insert({
    user_id: user.id,
    user_email: senderEmail,
    user_name: senderName,
    subject: finalSubject,
    message,
  });
  if (dbErr) {
    console.error("[sendContactMessage] DB insert failed:", dbErr);
    // DB hatası gönderimi engellemiyor — devam et
  }

  // 4. SMTP — Gmail
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    throw new Error(
      "E-posta gönderim ayarları eksik. Vercel'de GMAIL_USER ve GMAIL_APP_PASSWORD env var'ları tanımlanmalı."
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
  });

  const html = buildHtml({ topic, subject, message, senderName, senderEmail });
  const text = buildText({ topic, subject, message, senderName, senderEmail });

  try {
    await transporter.sendMail({
      from: `"EPC Karar Destek" <${gmailUser}>`,
      to: DEV_EMAIL,
      replyTo: senderEmail,
      subject: `[Karar Destek · ${topic}] ${subject}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[sendContactMessage] SMTP send failed:", err);
    throw new Error("E-posta gönderilemedi. Lütfen birazdan tekrar deneyin.");
  }

  return { ok: true };
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml({
  topic,
  subject,
  message,
  senderName,
  senderEmail,
}: {
  topic: string;
  subject: string;
  message: string;
  senderName: string;
  senderEmail: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
  <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
    <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.7;">EPC Karar Destek — Yeni Mesaj</div>
    <div style="font-size: 18px; font-weight: 600; margin-top: 6px;">${escapeHtml(topic)}</div>
  </div>
  <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px; width: 80px;">GÖNDEREN</td>
        <td style="padding: 6px 0; font-size: 14px;"><strong>${escapeHtml(senderName)}</strong></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px;">E-POSTA</td>
        <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${escapeHtml(senderEmail)}" style="color: #2563eb;">${escapeHtml(senderEmail)}</a></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px;">KONU</td>
        <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${escapeHtml(subject)}</td>
      </tr>
    </table>
    <div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 16px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escapeHtml(message)}</div>
    <div style="margin-top: 20px; font-size: 11px; color: #94a3b8;">
      Bu e-posta karardestek.fozanseyfi.com üzerinden otomatik gönderildi. "Yanıtla" basarsanız doğrudan
      <strong>${escapeHtml(senderEmail)}</strong> adresine yanıt gider.
    </div>
  </div>
</body>
</html>`.trim();
}

function buildText({
  topic,
  subject,
  message,
  senderName,
  senderEmail,
}: {
  topic: string;
  subject: string;
  message: string;
  senderName: string;
  senderEmail: string;
}) {
  return [
    `EPC Karar Destek — Yeni Mesaj`,
    `Konu Türü: ${topic}`,
    ``,
    `Gönderen: ${senderName} <${senderEmail}>`,
    `Konu: ${subject}`,
    ``,
    `--- MESAJ ---`,
    message,
    ``,
    `Yanıtla butonuyla doğrudan ${senderEmail} adresine yanıt verebilirsiniz.`,
  ].join("\n");
}
