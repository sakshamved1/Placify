import nodemailer from 'nodemailer';

// Helper to send email via Brevo HTTPS REST API (Port 443 - never blocked by cloud firewalls)
const sendViaBrevoApi = async ({ to, subject, html, apiKey, fromEmail, fromName }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Brevo API error: ${response.status}`);
  }
  return data;
};

// Create transporter using Brevo SMTP with multi-port cloud resilience (2525, 587, 465)
const createTransporter = (customPort) => {
  const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
  // Use port 2525 by default on cloud instances because port 587 is frequently throttled/blocked
  const port = parseInt(customPort || process.env.BREVO_SMTP_PORT || '2525', 10);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 7000,
  });
};

// Universal Email Dispatcher (Attempts HTTPS API -> SMTP Port 2525 -> SMTP Port 587)
const dispatchEmail = async ({ to, subject, html }) => {
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'sakshamved111@gmail.com';
  const fromName = process.env.BREVO_FROM_NAME || 'Placify';
  const apiKey = process.env.BREVO_API_KEY || (process.env.BREVO_SMTP_PASS?.startsWith('xkeysib-') ? process.env.BREVO_SMTP_PASS : null);

  // 1. If Brevo API Key is present, use HTTPS Port 443 (Fastest & 100% cloud-safe)
  if (apiKey) {
    try {
      const res = await sendViaBrevoApi({ to, subject, html, apiKey, fromEmail, fromName });
      console.log(`✅ [HTTPS API] Email sent to ${to} (MessageId: ${res.messageId})`);
      return res;
    } catch (apiErr) {
      console.warn('Brevo HTTPS API failed, falling back to SMTP:', apiErr.message);
    }
  }

  // 2. Try SMTP on primary port (default 2525 for Render cloud compatibility)
  const primaryPort = process.env.BREVO_SMTP_PORT || '2525';
  let transporter = createTransporter(primaryPort);

  if (!transporter) {
    console.log('\n=========================================');
    console.log('📧 [DEV EMAIL SIMULATION - Brevo credentials missing in .env]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('=========================================\n');
    return { simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ [SMTP :${primaryPort}] Email sent to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (err1) {
    console.warn(`⚠️ SMTP port ${primaryPort} timed out or failed (${err1.message}). Retrying on alternative port...`);
    
    // 3. Fallback to alternative port (if 2525 failed, try 587; if 587 failed, try 2525)
    const fallbackPort = primaryPort === '2525' ? '587' : '2525';
    try {
      const fallbackTransporter = createTransporter(fallbackPort);
      const info2 = await fallbackTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ [SMTP :${fallbackPort} Fallback] Email sent to ${to} (MessageId: ${info2.messageId})`);
      return info2;
    } catch (err2) {
      console.error(`❌ Both SMTP ports (${primaryPort} & ${fallbackPort}) failed for ${to}:`, err2.message);
      throw err2;
    }
  }
};

/**
 * Send Verification Email
 * @param {Object} options { email, name, verificationUrl }
 */
export const sendVerificationEmail = async ({ email, name, verificationUrl }) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Placify Account</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0F19; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
            <!-- Header -->
            <tr>
              <td style="padding: 36px 40px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #818cf8;">
                  Placify
                </span>
                <p style="margin: 6px 0 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Placement & Career Intelligence</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px;">
                <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #FFFFFF;">
                  Verify your email address
                </h1>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #94A3B8;">
                  Hi <strong style="color: #F1F5F9;">${name || 'there'}</strong>,
                </p>
                <p style="margin: 0 0 28px; font-size: 15px; line-height: 24px; color: #94A3B8;">
                  Thank you for creating an account on Placify. To protect your identity and activate your access to campus placements and ATS tools, please confirm your email address below:
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 34px 0;">
                  <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); border: 1px solid rgba(255, 255, 255, 0.15);">
                    Verify Email Address &rarr;
                  </a>
                </div>

                <p style="margin: 28px 0 0; font-size: 13px; line-height: 20px; color: #64748B;">
                  This verification link will expire in <strong>24 hours</strong>. If the button above does not work, copy and paste this link into your browser:
                </p>
                <p style="margin: 8px 0 0; word-break: break-all; font-size: 12px; color: #818cf8;">
                  <a href="${verificationUrl}" style="color: #818cf8; text-decoration: underline;">${verificationUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px; background-color: rgba(15, 23, 42, 0.6); border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #64748B;">
                  If you didn't create a Placify account, you can safely ignore this email.
                </p>
                <p style="margin: 8px 0 0; font-size: 11px; color: #475569;">
                  &copy; ${new Date().getFullYear()} Placify Platform. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  console.log(`🔗 Verification Link for ${email}: ${verificationUrl}`);
  return await dispatchEmail({
    to: email,
    subject: 'Verify your Placify Account',
    html: htmlContent,
  });
};

/**
 * Send Password Reset Email
 * @param {Object} options { email, name, resetUrl }
 */
export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your Placify Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0F19; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
            <!-- Header -->
            <tr>
              <td style="padding: 36px 40px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #818cf8;">
                  Placify
                </span>
                <p style="margin: 6px 0 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Placement & Career Intelligence</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px;">
                <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #FFFFFF;">
                  Password Reset Request
                </h1>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #94A3B8;">
                  Hi <strong style="color: #F1F5F9;">${name || 'User'}</strong>,
                </p>
                <p style="margin: 0 0 28px; font-size: 15px; line-height: 24px; color: #94A3B8;">
                  We received a request to reset your password for your Placify account. Click the button below to set a new password:
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 34px 0;">
                  <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 10px 25px rgba(236, 72, 153, 0.4); border: 1px solid rgba(255, 255, 255, 0.15);">
                    Reset Password &rarr;
                  </a>
                </div>

                <p style="margin: 28px 0 0; font-size: 13px; line-height: 20px; color: #64748B;">
                  This link is valid for <strong>1 hour</strong>. If you did not make this request, your account is safe and you can ignore this email.
                </p>
                <p style="margin: 8px 0 0; word-break: break-all; font-size: 12px; color: #c084fc;">
                  <a href="${resetUrl}" style="color: #c084fc; text-decoration: underline;">${resetUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px; background-color: rgba(15, 23, 42, 0.6); border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #64748B;">
                  Placify Security Team &bull; Never share your login links with anyone.
                </p>
                <p style="margin: 8px 0 0; font-size: 11px; color: #475569;">
                  &copy; ${new Date().getFullYear()} Placify Platform. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  console.log(`🔗 Password Reset Link for ${email}: ${resetUrl}`);
  return await dispatchEmail({
    to: email,
    subject: 'Reset your Placify Password',
    html: htmlContent,
  });
};
