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
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(email: EmailTemplate): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"SpendXP" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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
}

export const emailService = new EmailService();
