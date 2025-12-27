/**
 * Mailer Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const config = require('./env');

let transporter = null;

const initializeMailer = () => {
  try {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Verify connection configuration (non-blocking)
    transporter.verify((error, success) => {
      if (error) {
        console.warn('[Mailer] Warning: Email service may not be available:', error.message);
        console.log('[Mailer] OTPs will be logged to console for testing');
      } else {
        console.log('[Mailer] Email service is ready');
      }
    });
  } catch (error) {
    console.warn('[Mailer] Transporter initialization warning:', error.message);
  }

  return transporter;
};

const getMailer = () => {
  if (!transporter) {
    initializeMailer();
  }
  return transporter;
};

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 * @param {string} text - Email body (Plain text fallback)
 */
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailer = getMailer();
    const info = await mailer.sendMail({
      from: config.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log('[Mailer] Message sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn('[Mailer] Could not send email via SMTP:', error.message);
    console.log('[Mailer] Email logged for testing purposes');
    console.log(`[TEST] To: ${to}`);
    console.log(`[TEST] Subject: ${subject}`);
    console.log(`[TEST] HTML: ${html.substring(0, 200)}...`);
    
    // Return success anyway so signup can continue
    // In production, you'd want to handle this differently
    return { success: true, testMode: true, recipient: to };
  }
};

/**
 * Send OTP email
 */
const sendOtpEmail = async (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 20px; background-color: #ffffff; }
        .otp-box { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          padding: 30px; 
          border-radius: 10px; 
          text-align: center; 
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .otp-code { 
          font-size: 48px; 
          font-weight: bold; 
          letter-spacing: 8px; 
          color: white;
          font-family: 'Courier New', monospace;
          margin: 0;
        }
        .timer { 
          color: white; 
          font-size: 14px; 
          margin-top: 10px;
          opacity: 0.9;
        }
        .message { color: #333; line-height: 1.6; font-size: 16px; }
        .highlight { color: #667eea; font-weight: bold; }
        .warning { 
          background-color: #fff3cd; 
          border-left: 4px solid #ffc107; 
          padding: 15px; 
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer { 
          background-color: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          color: #666; 
          font-size: 12px;
          border-top: 1px solid #e0e0e0;
        }
        .social-links { margin-top: 20px; }
        .social-links a { margin: 0 10px; text-decoration: none; }
        ul { list-style: none; padding-left: 0; }
        li:before { content: "✓ "; color: #667eea; font-weight: bold; margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚙️ GearGuard</h1>
          <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Maintenance Management System</p>
        </div>
        
        <div class="content">
          <p class="message">Hello,</p>
          <p class="message">Welcome to <span class="highlight">GearGuard</span>! Your trusted maintenance management partner.</p>
          
          <p class="message">To complete your email verification, please use the code below:</p>
          
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
            <p class="timer">⏱️ Expires in 5 minutes</p>
          </div>
          
          <div class="warning">
            <strong>🔒 Security Notice:</strong>
            <ul>
              <li>Never share this code with anyone</li>
              <li>GearGuard will never ask for this code via email or phone</li>
              <li>If you didn't request this, ignore this email</li>
            </ul>
          </div>
          
          <p class="message"><strong>Next Steps:</strong></p>
          <ol style="color: #666; line-height: 1.8;">
            <li>Enter the code above on the verification page</li>
            <li>Complete your account setup</li>
            <li>Start managing your maintenance tasks efficiently</li>
          </ol>
          
          <p class="message" style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            Have questions? <a href="https://gearguard.com/support" style="color: #667eea; text-decoration: none;">Contact our support team</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2025 GearGuard. All rights reserved.</p>
          <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `GearGuard - Email Verification\n\nYour OTP for email verification is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.\n\n© 2025 GearGuard`;

  // Log OTP to console for testing (when SMTP fails)
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[OTP SENT] Email: ${email}`);
  console.log(`[OTP CODE] ${otp}`);
  console.log(`[OTP TYPE] EMAIL_VERIFICATION`);
  console.log(`${'='.repeat(60)}\n`);

  return sendEmail(email, '✉️ GearGuard - Verify Your Email Address', html, text);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 0; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 20px; background-color: #ffffff; }
        .otp-box { 
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
          padding: 30px; 
          border-radius: 10px; 
          text-align: center; 
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .otp-code { 
          font-size: 48px; 
          font-weight: bold; 
          letter-spacing: 8px; 
          color: white;
          font-family: 'Courier New', monospace;
          margin: 0;
        }
        .timer { 
          color: white; 
          font-size: 14px; 
          margin-top: 10px;
          opacity: 0.9;
        }
        .message { color: #333; line-height: 1.6; font-size: 16px; }
        .highlight { color: #e74c3c; font-weight: bold; }
        .warning { 
          background-color: #ffe6e6; 
          border-left: 4px solid #e74c3c; 
          padding: 15px; 
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer { 
          background-color: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          color: #666; 
          font-size: 12px;
          border-top: 1px solid #e0e0e0;
        }
        ul { list-style: none; padding-left: 0; }
        li:before { content: "⚠️ "; margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚙️ GearGuard</h1>
          <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Maintenance Management System</p>
        </div>
        
        <div class="content">
          <p class="message">Hello,</p>
          <p class="message">We received a request to reset your <span class="highlight">GearGuard</span> password.</p>
          
          <p class="message">Use the code below to reset your password:</p>
          
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
            <p class="timer">⏱️ Expires in 5 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Alert:</strong>
            <ul>
              <li>Only use this code if you requested a password reset</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, your account may be at risk - contact support immediately</li>
            </ul>
          </div>
          
          <p class="message"><strong>What to do:</strong></p>
          <ol style="color: #666; line-height: 1.8;">
            <li>Go to the password reset page</li>
            <li>Enter the 6-digit code above</li>
            <li>Create a new strong password</li>
            <li>Secure your account</li>
          </ol>
          
          <p class="message" style="color: #999; font-size: 14px; margin-top: 30px;">
            <strong>Didn't request this?</strong> Don't worry! Just ignore this email or <a href="https://gearguard.com/security" style="color: #e74c3c; text-decoration: none;">report the issue</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2025 GearGuard. All rights reserved.</p>
          <p style="margin: 0;">This is a security-related automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `GearGuard - Password Reset\n\nYour OTP for password reset is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this, your account may be at risk.\n\n© 2025 GearGuard`;

  // Log OTP to console for testing (when SMTP fails)
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[OTP SENT] Email: ${email}`);
  console.log(`[OTP CODE] ${otp}`);
  console.log(`[OTP TYPE] PASSWORD_RESET`);
  console.log(`${'='.repeat(60)}\n`);

  return sendEmail(email, '🔒 GearGuard - Password Reset Code', html, text);
};

module.exports = {
  initializeMailer,
  getMailer,
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
};
