import nodemailer from 'nodemailer';

// Create transporter using Brevo SMTP or fallback
const createTransporter = () => {
  const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️ Brevo SMTP credentials not found in environment (BREVO_SMTP_USER / BREVO_SMTP_PASS).');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
};

/**
 * Send Verification Email
 * @param {Object} options { email, name, verificationUrl }
 */
export const sendVerificationEmail = async ({ email, name, verificationUrl }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@placify.com';
  const fromName = process.env.BREVO_FROM_NAME || 'Placify';

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

  if (!transporter) {
    console.log('\n=========================================');
    console.log('📧 [DEV EMAIL SIMULATION - Brevo SMTP credentials not configured]');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your Placify Account`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('=========================================\n');
    return { simulated: true, verificationUrl };
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Verify your Placify Account',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email} (MessageId: ${info.messageId})`);
    console.log(`🔗 Verification Link: ${verificationUrl}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send verification email via Brevo to ${email}:`, error.message);
    console.log(`🔗 Verification Link fallback: ${verificationUrl}`);
    throw error;
  }
};

/**
 * Send Password Reset Email
 * @param {Object} options { email, name, resetUrl }
 */
export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@placify.com';
  const fromName = process.env.BREVO_FROM_NAME || 'Placify';

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

  if (!transporter) {
    console.log('\n=========================================');
    console.log('📧 [DEV EMAIL SIMULATION - Brevo SMTP not configured]');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your Placify Password`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('=========================================\n');
    return { simulated: true, resetUrl };
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Reset your Placify Password',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email} (MessageId: ${info.messageId})`);
    console.log(`🔗 Reset Link: ${resetUrl}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send password reset email via Brevo to ${email}:`, error.message);
    console.log(`🔗 Reset Link fallback: ${resetUrl}`);
    throw error;
  }
};
