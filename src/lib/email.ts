import 'server-only';
import nodemailer from 'nodemailer';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'spendxp.app@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendEmail(email: EmailTemplate): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: '"SpendXP" <spendxp.app@gmail.com>',
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  // Email verification template
  sendEmailVerification(email: string, token: string, displayName: string): Promise<boolean> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Verify your SpendXP account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verify your SpendXP account</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1A1F2E; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #1A1F2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to SpendXP!</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <p>Thank you for signing up for SpendXP! To complete your registration and activate your account, please verify your email address.</p>
              <p><a href="${verifyUrl}" class="button">Verify Email Address</a></p>
              <p>Or copy and paste this link into your browser:</p>
              <p>${verifyUrl}</p>
              <p><strong>This link expires in 1 hour.</strong></p>
              <p>If you didn't create an account with SpendXP, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 SpendXP. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to SpendXP!
        
        Hi ${displayName},
        
        Thank you for signing up for SpendXP! To complete your registration, please verify your email address by visiting:
        
        ${verifyUrl}
        
        This link expires in 1 hour.
        
        If you didn't create an account with SpendXP, you can safely ignore this email.
        
        © 2024 SpendXP. All rights reserved.
      `
    });
  }

  // Login confirmation template
  sendLoginConfirmation(email: string, displayName: string, loginTime: Date, ip: string, location: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'New login to your SpendXP account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New login to your SpendXP account</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1A1F2E; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Detected</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <p>We detected a new login to your SpendXP account:</p>
              <div class="alert">
                <strong>Login Details:</strong><br>
                Time: ${loginTime.toLocaleString()}<br>
                IP Address: ${ip}<br>
                Location: ${location}
              </div>
              <p>If this was you, no action is needed. Your account is secure.</p>
              <p><strong>If this wasn't you</strong>, please secure your account immediately:</p>
              <ul>
                <li>Change your password</li>
                <li>Review your account activity</li>
                <li>Contact support if needed</li>
              </ul>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="color: #1A1F2E;">Go to Your Account</a></p>
            </div>
            <div class="footer">
              <p>© 2024 SpendXP. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  }

  // Password reset template
  sendPasswordReset(email: string, token: string, displayName: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset your SpendXP password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset your SpendXP password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .alert { background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <p>We received a request to reset your SpendXP password.</p>
              <div class="alert">
                <strong>Security Notice:</strong> You will need to answer your security questions to complete the password reset.
              </div>
              <p><a href="${resetUrl}" class="button">Reset Password</a></p>
              <p>Or copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
              <p><strong>This link expires in 1 hour.</strong></p>
              <p>If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
            </div>
            <div class="footer">
              <p>© 2024 SpendXP. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  }

  // Password reset confirmation template
  sendPasswordResetConfirmation(email: string, displayName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Your SpendXP password has been changed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your SpendXP password has been changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1A1F2E; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert { background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <div class="alert">
                <strong>Your SpendXP password has been successfully changed.</strong>
              </div>
              <p>If this was you, no action is needed. You can now log in with your new password.</p>
              <p><strong>If this wasn't you</strong>, please contact support immediately as your account may have been compromised.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #1A1F2E;">Log In to Your Account</a></p>
            </div>
            <div class="footer">
              <p>© 2024 SpendXP. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  }

  // ── Parental consent request (COPPA) ──────────────────────────────────────
  sendParentalConsentRequest(opts: {
    parentEmail: string;
    childName: string;
    childEmail: string;
    approveUrl: string;
    expiresInHours: number;
  }): Promise<boolean> {
    const { parentEmail, childName, childEmail, approveUrl, expiresInHours } = opts;
    return this.sendEmail({
      to: parentEmail,
      subject: `Action Required: ${childName} wants to join SpendXP`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Parental Consent — SpendXP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .wrapper { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #1A1F2E; color: white; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0 0 4px; font-size: 28px; }
            .header p { margin: 0; opacity: 0.7; font-size: 14px; }
            .content { padding: 32px 24px; }
            .info-box { background: #f8f9fa; border-left: 4px solid #2E7D5A; padding: 16px; border-radius: 4px; margin: 20px 0; }
            .info-box p { margin: 4px 0; font-size: 14px; }
            .checklist { list-style: none; padding: 0; margin: 16px 0; }
            .checklist li { padding: 6px 0; font-size: 14px; color: #555; }
            .checklist li::before { content: "✓ "; color: #2E7D5A; font-weight: bold; }
            .no-list { list-style: none; padding: 0; margin: 16px 0; }
            .no-list li { padding: 6px 0; font-size: 14px; color: #555; }
            .no-list li::before { content: "✓ "; color: #2E7D5A; font-weight: bold; }
            .btn { display: block; width: fit-content; margin: 28px auto; background: #2E7D5A; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .expiry { background: #fff8e1; border: 1px solid #ffe082; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #7a5c00; margin: 20px 0; }
            .legal { font-size: 11px; color: #999; padding: 16px 24px; border-top: 1px solid #eee; text-align: center; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>SpendXP</h1>
              <p>Financial literacy for young learners</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>
                <strong>${childName}</strong> has created a SpendXP account and listed you as their parent or guardian.
                Because ${childName} is under 13, we need your consent before their account can be activated.
              </p>

              <div class="info-box">
                <p><strong>Account request for:</strong></p>
                <p>Name: ${childName}</p>
                <p>Email: ${childEmail}</p>
              </div>

              <p><strong>What SpendXP collects about your child:</strong></p>
              <ul class="checklist">
                <li>Name and birth year (for age-appropriate content)</li>
                <li>Game scores and earned XP points</li>
                <li>Learning progress and completed quests</li>
                <li>Email address (for account access only)</li>
              </ul>

              <p><strong>We never:</strong></p>
              <ul class="no-list">
                <li>Show advertisements on child accounts</li>
                <li>Sell personal data to third parties</li>
                <li>Collect location data</li>
              </ul>

              <a href="${approveUrl}" class="btn">✓ Approve Account</a>

              <div class="expiry">
                ⏱ This approval link expires in ${expiresInHours} hours.
              </div>

              <p style="font-size: 13px; color: #777;">
                <strong>Not your child's request?</strong> Simply ignore this email — no account will be created.
                The pending data will be automatically deleted when the link expires.
              </p>
            </div>
            <div class="legal">
              <p>© ${new Date().getFullYear()} SpendXP · All rights reserved</p>
              <p>This email was sent because someone listed this address as a parent/guardian during sign-up.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
SpendXP — Parental Consent Required

Hello,

${childName} has created a SpendXP account and listed you as their parent or guardian.
Because they are under 13, your consent is required before the account is activated.

Account request for:
  Name: ${childName}
  Email: ${childEmail}

To approve the account, visit:
${approveUrl}

This link expires in ${expiresInHours} hours.

If this wasn't your child, simply ignore this email — no account will be created.

© ${new Date().getFullYear()} SpendXP
      `
    });
  }

  // ── Account ready notification (sent to child after parent approves) ───────
  sendAccountReady(opts: {
    childEmail: string;
    childName: string;
    loginUrl: string;
  }): Promise<boolean> {
    const { childEmail, childName, loginUrl } = opts;
    return this.sendEmail({
      to: childEmail,
      subject: 'Your SpendXP account is ready! 🎮',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your SpendXP account is ready!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .wrapper { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #1A1F2E; color: white; padding: 32px 24px; text-align: center; }
            .content { padding: 32px 24px; }
            .btn { display: block; width: fit-content; margin: 24px auto; background: #2E7D5A; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .celebrate { font-size: 40px; text-align: center; margin: 20px 0; }
            .legal { font-size: 11px; color: #999; padding: 16px 24px; border-top: 1px solid #eee; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>SpendXP</h1>
            </div>
            <div class="content">
              <div class="celebrate">🎉</div>
              <h2 style="text-align:center">You're all set, ${childName}!</h2>
              <p>
                Your parent has approved your SpendXP account. You can now sign in and start playing!
              </p>
              <p>
                Earn XP, complete quests, play mini-games, and learn how money works — all while having fun.
              </p>
              <a href="${loginUrl}" class="btn">Start Playing →</a>
              <p style="font-size:13px; color:#777; text-align:center;">
                Use your email and the password you chose when you signed up.
              </p>
            </div>
            <div class="legal">
              <p>© ${new Date().getFullYear()} SpendXP · All rights reserved</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
You're all set, ${childName}!

Your parent has approved your SpendXP account.
Sign in at: ${loginUrl}

Use your email and the password you chose when you signed up.

© ${new Date().getFullYear()} SpendXP
      `
    });
  }
  // ── Parent-to-child connection request ───────────────────────────────────
  sendChildConnectionRequest(opts: {
    childEmail: string;
    parentName: string;
    parentEmail: string;
    acceptUrl: string;
    expiresInDays: number;
  }): Promise<boolean> {
    const { childEmail, parentName, parentEmail, acceptUrl, expiresInDays } = opts;
    return this.sendEmail({
      to: childEmail,
      subject: `${parentName} wants to connect on SpendXP`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Parent Connection Request — SpendXP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .wrapper { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #1A1F2E; color: white; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0 0 4px; font-size: 28px; }
            .header p { margin: 0; opacity: 0.7; font-size: 14px; }
            .content { padding: 32px 24px; }
            .parent-box { background: #f0fdf4; border: 2px solid #2E7D5A; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .parent-box .name { font-size: 22px; font-weight: bold; color: #1a3c2a; margin: 0 0 4px; }
            .parent-box .email { font-size: 13px; color: #666; margin: 0; }
            .checklist { list-style: none; padding: 0; margin: 16px 0; }
            .checklist li { padding: 6px 0; font-size: 14px; color: #555; display: flex; align-items: flex-start; gap: 8px; }
            .check { color: #2E7D5A; font-weight: bold; flex-shrink: 0; }
            .btn { display: block; width: fit-content; margin: 28px auto; background: #2E7D5A; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .expiry { background: #fff8e1; border: 1px solid #ffe082; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #7a5c00; margin: 20px 0; text-align: center; }
            .legal { font-size: 11px; color: #999; padding: 16px 24px; border-top: 1px solid #eee; text-align: center; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>SpendXP</h1>
              <p>Financial literacy for young learners</p>
            </div>
            <div class="content">
              <p>Hi there! 👋</p>
              <p>A parent wants to connect with your SpendXP account so they can cheer you on as you learn!</p>

              <div class="parent-box">
                <p class="name">${parentName}</p>
                <p class="email">${parentEmail}</p>
              </div>

              <p style="font-size: 14px; color: #555;">When you connect, they'll be able to:</p>
              <ul class="checklist">
                <li><span class="check">✓</span> See your XP, badges, and learning progress</li>
                <li><span class="check">✓</span> Watch which quests and games you've completed</li>
                <li><span class="check">✓</span> Get a weekly summary of your achievements</li>
                <li><span class="check">✓</span> Help set healthy screen-time habits</li>
              </ul>

              <a href="${acceptUrl}" class="btn">Accept & Connect →</a>

              <div class="expiry">
                ⏰ This link expires in ${expiresInDays} day${expiresInDays !== 1 ? 's' : ''}. You'll need to be signed in to your SpendXP account to accept.
              </div>

              <p style="font-size: 13px; color: #888;">
                If you don't recognise this person or don't want to connect, simply ignore this email. Your account won't be changed.
              </p>
            </div>
            <div class="legal">
              <p>© ${new Date().getFullYear()} SpendXP · All rights reserved</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi! ${parentName} (${parentEmail}) wants to connect with your SpendXP account.

Accept the connection here: ${acceptUrl}

When connected, they can see your XP and learning progress, and get weekly achievement summaries.

This link expires in ${expiresInDays} day${expiresInDays !== 1 ? 's' : ''}. If you don't want to connect, ignore this email.

© ${new Date().getFullYear()} SpendXP
      `
    });
  }
}

export const emailService = new EmailService();
