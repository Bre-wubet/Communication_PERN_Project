import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

class EmailConfig {
  constructor() {
    this.transporters = new Map();
    this.defaultProvider = process.env.EMAIL_DEFAULT_PROVIDER || 'smtp';
  }

  createTransporter(provider, config) {
    try {
      let transporter;

      switch (provider.toLowerCase()) {
        case 'smtp':
          transporter = nodemailer.createTransport({
            host: config.host || process.env.SMTP_HOST,
            port: Number(config.port || process.env.SMTP_PORT || 587),
            secure: config.secure || process.env.SMTP_SECURE === 'true',
            auth: {
              user: config.user || process.env.SMTP_USER,
              pass: config.pass || process.env.SMTP_PASS,
            },
            tls: {
              rejectUnauthorized: config.rejectUnauthorized !== false,
            },
          });
          break;

        case 'gmail':
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.user || process.env.GMAIL_USER,
              pass: config.pass || process.env.GMAIL_APP_PASSWORD,
            },
          });
          break;

        case 'sendgrid':
          transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
              user: 'apikey',
              pass: config.apiKey || process.env.SENDGRID_API_KEY,
            },
          });
          break;

        case 'mailgun':
          transporter = nodemailer.createTransport({
            host: config.host || 'smtp.mailgun.org',
            port: Number(config.port || 587),
            secure: false,
            auth: {
              user: config.user || process.env.MAILGUN_SMTP_USER,
              pass: config.pass || process.env.MAILGUN_SMTP_PASSWORD,
            },
          });
          break;

        default:
          throw new Error(`Unsupported email provider: ${provider}`);
      }

      // Verify transporter configuration
      transporter.verify((error, success) => {
        if (error) {
          logger.error(`Email transporter verification failed for ${provider}:`, error);
        } else {
          logger.info(`Email transporter verified successfully for ${provider}`);
        }
      });

      return transporter;
    } catch (error) {
      logger.error(`Failed to create email transporter for ${provider}:`, error);
      throw error;
    }
  }

  getTransporter(provider = null) {
    const providerName = provider || this.defaultProvider;
    
    if (!this.transporters.has(providerName)) {
      const config = this.getProviderConfig(providerName);
      const transporter = this.createTransporter(providerName, config);
      this.transporters.set(providerName, transporter);
    }

    return this.transporters.get(providerName);
  }

  getProviderConfig(provider) {
    const configs = {
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      gmail: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
      },
      mailgun: {
        host: process.env.MAILGUN_SMTP_HOST,
        port: process.env.MAILGUN_SMTP_PORT,
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    };

    return configs[provider] || {};
  }

  async sendEmail(options) {
    try {
      const { provider, ...emailOptions } = options;
      const transporter = this.getTransporter(provider);

      // Fallbacks: if only `body` is provided, use it as text and basic HTML
      const escapeHtml = (str) =>
        String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const textBody = emailOptions.text ?? emailOptions.body ?? undefined;
      const htmlBody = emailOptions.html ?? (
        emailOptions.body ? `<div style="white-space:pre-wrap">${escapeHtml(emailOptions.body)}</div>` : undefined
      );

      const result = await transporter.sendMail({
        from: emailOptions.from || process.env.EMAIL_FROM,
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: textBody,
        html: htmlBody,
        attachments: emailOptions.attachments,
        replyTo: emailOptions.replyTo,
        cc: emailOptions.cc,
        bcc: emailOptions.bcc,
      });

      logger.info(`Email sent successfully to ${emailOptions.to}`, {
        messageId: result.messageId,
        provider: provider || this.defaultProvider,
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: provider || this.defaultProvider,
      };
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  getSupportedProviders() {
    return ['smtp', 'gmail', 'sendgrid', 'mailgun'];
  }
}

// Create singleton instance
const emailConfig = new EmailConfig();

export { emailConfig };
export default emailConfig;
