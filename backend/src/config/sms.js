import twilio from 'twilio';
import { logger } from '../utils/logger.js';

class SmsConfig {
  constructor() {
    this.clients = new Map();
    this.defaultProvider = process.env.SMS_DEFAULT_PROVIDER || 'twilio';
  }

  createClient(provider, config) {
    try {
      let client;

      switch (provider.toLowerCase()) {
        case 'twilio':
          client = twilio(
            config.accountSid || process.env.TWILIO_ACCOUNT_SID,
            config.authToken || process.env.TWILIO_AUTH_TOKEN
          );
          break;

        case 'aws-sns':
          // AWS SNS implementation would go here
          // For now, we'll use a mock client
          client = {
            publish: async (params) => {
              logger.info('AWS SNS SMS (mock):', params);
              return { MessageId: `mock-${Date.now()}` };
            }
          };
          break;

        case 'messagebird':
          // MessageBird implementation would go here
          client = {
            messages: {
              create: async (params) => {
                logger.info('MessageBird SMS (mock):', params);
                return { id: `mock-${Date.now()}` };
              }
            }
          };
          break;

        default:
          throw new Error(`Unsupported SMS provider: ${provider}`);
      }

      logger.info(`SMS client created successfully for ${provider}`);
      return client;
    } catch (error) {
      logger.error(`Failed to create SMS client for ${provider}:`, error);
      throw error;
    }
  }

  getClient(provider = null) {
    const providerName = provider || this.defaultProvider;
    
    if (!this.clients.has(providerName)) {
      const config = this.getProviderConfig(providerName);
      const client = this.createClient(providerName, config);
      this.clients.set(providerName, client);
    }

    return this.clients.get(providerName);
  }

  getProviderConfig(provider) {
    const configs = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
      'aws-sns': {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      },
      messagebird: {
        apiKey: process.env.MESSAGEBIRD_API_KEY,
      },
    };

    return configs[provider] || {};
  }

  async sendSms(options) {
    try {
      const { provider, phoneNumber, message, ...otherOptions } = options;
      const client = this.getClient(provider);

      let result;

      switch (provider || this.defaultProvider) {
        case 'twilio':
          result = await client.messages.create({
            body: message,
            from: otherOptions.from || process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          });
          break;

        case 'aws-sns':
          result = await client.publish({
            Message: message,
            PhoneNumber: phoneNumber,
          });
          break;

        case 'messagebird':
          result = await client.messages.create({
            originator: otherOptions.originator || process.env.MESSAGEBIRD_ORIGINATOR,
            recipients: [phoneNumber],
            body: message,
          });
          break;

        default:
          throw new Error(`Unsupported SMS provider: ${provider}`);
      }

      logger.info(`SMS sent successfully to ${phoneNumber}`, {
        messageId: result.sid || result.MessageId || result.id,
        provider: provider || this.defaultProvider,
      });

      return {
        success: true,
        messageId: result.sid || result.MessageId || result.id,
        provider: provider || this.defaultProvider,
      };
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendBulkSms(options) {
    try {
      const { provider, phoneNumbers, message, ...otherOptions } = options;
      const results = [];

      for (const phoneNumber of phoneNumbers) {
        try {
          const result = await this.sendSms({
            provider,
            phoneNumber,
            message,
            ...otherOptions,
          });
          results.push({ phoneNumber, ...result });
        } catch (error) {
          logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
          results.push({
            phoneNumber,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Failed to send bulk SMS:', error);
      throw error;
    }
  }

  getSupportedProviders() {
    return ['twilio', 'aws-sns', 'messagebird'];
  }
}

// Create singleton instance
const smsConfig = new SmsConfig();

export { smsConfig };
export default smsConfig;
