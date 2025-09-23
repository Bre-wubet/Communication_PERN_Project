import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';

class PushConfig {
  constructor() {
    this.apps = new Map();
    this.defaultProvider = process.env.PUSH_DEFAULT_PROVIDER || 'firebase';
  }

  initializeFirebase(config) {
    try {
      const serviceAccount = config.serviceAccount || JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
      
      if (!serviceAccount.private_key) {
        throw new Error('Firebase service account configuration is missing');
      }

      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.projectId || process.env.FIREBASE_PROJECT_ID,
      }, `firebase-${Date.now()}`);

      logger.info('Firebase Admin SDK initialized successfully');
      return app;
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }

  createClient(provider, config) {
    try {
      let client;

      switch (provider.toLowerCase()) {
        case 'firebase':
          const app = this.initializeFirebase(config);
          client = {
            messaging: admin.messaging(app),
            app: app,
          };
          break;

        case 'apns':
          // Apple Push Notification Service implementation would go here
          client = {
            send: async (notification) => {
              logger.info('APNS notification (mock):', notification);
              return { id: `mock-${Date.now()}` };
            }
          };
          break;

        case 'fcm':
          // Firebase Cloud Messaging (alternative implementation)
          client = {
            send: async (message) => {
              logger.info('FCM notification (mock):', message);
              return { name: `mock-${Date.now()}` };
            }
          };
          break;

        default:
          throw new Error(`Unsupported push notification provider: ${provider}`);
      }

      logger.info(`Push notification client created successfully for ${provider}`);
      return client;
    } catch (error) {
      logger.error(`Failed to create push notification client for ${provider}:`, error);
      throw error;
    }
  }

  getClient(provider = null) {
    const providerName = provider || this.defaultProvider;
    
    if (!this.apps.has(providerName)) {
      const config = this.getProviderConfig(providerName);
      const client = this.createClient(providerName, config);
      this.apps.set(providerName, client);
    }

    return this.apps.get(providerName);
  }

  getProviderConfig(provider) {
    const configs = {
      firebase: {
        serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null,
        projectId: process.env.FIREBASE_PROJECT_ID,
      },
      apns: {
        keyId: process.env.APNS_KEY_ID,
        teamId: process.env.APNS_TEAM_ID,
        bundleId: process.env.APNS_BUNDLE_ID,
        keyPath: process.env.APNS_KEY_PATH,
      },
      fcm: {
        serverKey: process.env.FCM_SERVER_KEY,
      },
    };

    return configs[provider] || {};
  }

  async sendNotification(options) {
    try {
      const { provider, tokens, title, body, data, ...otherOptions } = options;
      const client = this.getClient(provider);

      let result;

      switch (provider || this.defaultProvider) {
        case 'firebase':
          const message = {
            notification: {
              title,
              body,
            },
            data: data || {},
            tokens: Array.isArray(tokens) ? tokens : [tokens],
            ...otherOptions,
          };

          // Firebase Admin SDK v11+: use sendEachForMulticast instead of sendMulticast
          result = await client.messaging.sendEachForMulticast(message);
          break;

        case 'apns':
          result = await client.send({
            deviceToken: tokens,
            title,
            body,
            data,
            ...otherOptions,
          });
          break;

        case 'fcm':
          result = await client.send({
            to: tokens,
            notification: {
              title,
              body,
            },
            data: data || {},
            ...otherOptions,
          });
          break;

        default:
          throw new Error(`Unsupported push notification provider: ${provider}`);
      }

      logger.info(`Push notification sent successfully`, {
        tokens: Array.isArray(tokens) ? tokens.length : 1,
        provider: provider || this.defaultProvider,
        result: result.successCount || 1,
      });

      return {
        success: true,
        result,
        provider: provider || this.defaultProvider,
      };
    } catch (error) {
      logger.error('Failed to send push notification:', error);
      throw error;
    }
  }

  async sendToTopic(options) {
    try {
      const { provider, topic, title, body, data, ...otherOptions } = options;
      const client = this.getClient(provider);

      let result;

      switch (provider || this.defaultProvider) {
        case 'firebase':
          const message = {
            notification: {
              title,
              body,
            },
            data: data || {},
            topic,
            ...otherOptions,
          };

          // Firebase Admin SDK v11+: call through the Messaging instance
          result = await client.messaging.send(message);
          break;

        default:
          throw new Error(`Topic messaging not supported for provider: ${provider}`);
      }

      logger.info(`Push notification sent to topic ${topic}`, {
        provider: provider || this.defaultProvider,
      });

      return {
        success: true,
        result,
        provider: provider || this.defaultProvider,
      };
    } catch (error) {
      logger.error('Failed to send push notification to topic:', error);
      throw error;
    }
  }

  async subscribeToTopic(tokens, topic, provider = null) {
    try {
      const client = this.getClient(provider);

      switch (provider || this.defaultProvider) {
        case 'firebase':
          const result = await client.messaging.subscribeToTopic(tokens, topic);
          logger.info(`Successfully subscribed ${tokens.length} tokens to topic ${topic}`);
          return result;

        default:
          throw new Error(`Topic subscription not supported for provider: ${provider}`);
      }
    } catch (error) {
      logger.error('Failed to subscribe to topic:', error);
      throw error;
    }
  }

  async unsubscribeFromTopic(tokens, topic, provider = null) {
    try {
      const client = this.getClient(provider);

      switch (provider || this.defaultProvider) {
        case 'firebase':
          const result = await client.messaging.unsubscribeFromTopic(tokens, topic);
          logger.info(`Successfully unsubscribed ${tokens.length} tokens from topic ${topic}`);
          return result;

        default:
          throw new Error(`Topic unsubscription not supported for provider: ${provider}`);
      }
    } catch (error) {
      logger.error('Failed to unsubscribe from topic:', error);
      throw error;
    }
  }

  getSupportedProviders() {
    return ['firebase', 'apns', 'fcm'];
  }
}

// Create singleton instance
const pushConfig = new PushConfig();

export { pushConfig };
export default pushConfig;
