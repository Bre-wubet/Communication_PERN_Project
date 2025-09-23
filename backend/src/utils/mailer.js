import { emailConfig } from '../config/email.js';
import { logger } from './logger.js';

class Mailer {
  constructor() {
    this.emailConfig = emailConfig;
  }

  /**
   * Send a simple text email
   */
  async sendTextEmail(to, subject, text, options = {}) {
    try {
      const emailOptions = {
        to,
        subject,
        text,
        provider: options.provider,
        from: options.from,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      };

      const result = await this.emailConfig.sendEmail(emailOptions);
      
      logger.info('Text email sent successfully', {
        to,
        subject,
        provider: result.provider,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send text email:', error);
      throw error;
    }
  }

  /**
   * Send an HTML email
   */
  async sendHtmlEmail(to, subject, html, options = {}) {
    try {
      const emailOptions = {
        to,
        subject,
        html,
        text: options.text, // Fallback text version
        provider: options.provider,
        from: options.from,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const result = await this.emailConfig.sendEmail(emailOptions);
      
      logger.info('HTML email sent successfully', {
        to,
        subject,
        provider: result.provider,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send HTML email:', error);
      throw error;
    }
  }

  /**
   * Send a templated email
   */
  async sendTemplatedEmail(to, subject, template, data = {}, options = {}) {
    try {
      const html = this.renderTemplate(template, data);
      const text = this.renderTemplate(template, data, 'text');

      return await this.sendHtmlEmail(to, subject, html, {
        ...options,
        text,
      });
    } catch (error) {
      logger.error('Failed to send templated email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails, options = {}) {
    try {
      const results = [];
      const batchSize = options.batchSize || 10;
      const delay = options.delay || 1000; // 1 second delay between batches

      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (email) => {
          try {
            const result = await this.emailConfig.sendEmail(email);
            return { ...email, ...result };
          } catch (error) {
            logger.error(`Failed to send email to ${email.to}:`, error);
            return { ...email, success: false, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      logger.info(`Bulk email sending completed`, {
        total: emails.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to send bulk emails:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, name, options = {}) {
    const subject = options.subject || 'Welcome!';
    const template = options.template || 'welcome';
    
    const data = {
      name,
      ...options.data,
    };

    return await this.sendTemplatedEmail(to, subject, template, data, options);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, resetToken, options = {}) {
    const subject = options.subject || 'Password Reset Request';
    const template = options.template || 'password-reset';
    
    const data = {
      resetToken,
      resetUrl: `${options.baseUrl}/reset-password?token=${resetToken}`,
      ...options.data,
    };

    return await this.sendTemplatedEmail(to, subject, template, data, options);
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(to, title, message, options = {}) {
    const subject = options.subject || title;
    const template = options.template || 'notification';
    
    const data = {
      title,
      message,
      ...options.data,
    };

    return await this.sendTemplatedEmail(to, subject, template, data, options);
  }

  /**
   * Send comment notification email
   */
  async sendCommentNotificationEmail(to, commenterName, comment, options = {}) {
    const subject = options.subject || `New comment from ${commenterName}`;
    const template = options.template || 'comment-notification';
    
    const data = {
      commenterName,
      comment,
      ...options.data,
    };

    return await this.sendTemplatedEmail(to, subject, template, data, options);
  }

  /**
   * Send mention notification email
   */
  async sendMentionNotificationEmail(to, mentionedBy, content, options = {}) {
    const subject = options.subject || `You were mentioned by ${mentionedBy}`;
    const template = options.template || 'mention-notification';
    
    const data = {
      mentionedBy,
      content,
      ...options.data,
    };

    return await this.sendTemplatedEmail(to, subject, template, data, options);
  }

  /**
   * Render email template (simple template engine)
   */
  renderTemplate(template, data, format = 'html') {
    // This is a simple template engine
    // In production, you might want to use a more sophisticated template engine like Handlebars or EJS
    
    let templateContent = '';
    
    // Load template based on format
    if (format === 'html') {
      templateContent = this.getHtmlTemplate(template);
    } else {
      templateContent = this.getTextTemplate(template);
    }

    // Replace placeholders with data
    return templateContent.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Get HTML template content
   */
  getHtmlTemplate(templateName) {
    const templates = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome</title>
        </head>
        <body>
          <h1>Welcome {{name}}!</h1>
          <p>Thank you for joining us. We're excited to have you on board!</p>
        </body>
        </html>
      `,
      'password-reset': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body>
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="{{resetUrl}}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </body>
        </html>
      `,
      notification: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>{{title}}</title>
        </head>
        <body>
          <h1>{{title}}</h1>
          <p>{{message}}</p>
        </body>
        </html>
      `,
      'comment-notification': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Comment</title>
        </head>
        <body>
          <h1>New Comment from {{commenterName}}</h1>
          <p>{{comment}}</p>
        </body>
        </html>
      `,
      'mention-notification': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>You were mentioned</title>
        </head>
        <body>
          <h1>You were mentioned by {{mentionedBy}}</h1>
          <p>{{content}}</p>
        </body>
        </html>
      `,
    };

    return templates[templateName] || templates.notification;
  }

  /**
   * Get text template content
   */
  getTextTemplate(templateName) {
    const templates = {
      welcome: `Welcome {{name}}!\n\nThank you for joining us. We're excited to have you on board!`,
      'password-reset': `Password Reset Request\n\nClick the link below to reset your password:\n{{resetUrl}}\n\nThis link will expire in 1 hour.`,
      notification: `{{title}}\n\n{{message}}`,
      'comment-notification': `New Comment from {{commenterName}}\n\n{{comment}}`,
      'mention-notification': `You were mentioned by {{mentionedBy}}\n\n{{content}}`,
    };

    return templates[templateName] || templates.notification;
  }

  /**
   * Get supported email providers
   */
  getSupportedProviders() {
    return this.emailConfig.getSupportedProviders();
  }
}

// Create singleton instance
const mailer = new Mailer();

export { mailer };
export default mailer;
