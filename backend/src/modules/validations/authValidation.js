import Joi from 'joi';

export const authSchemas = {
  registerTenantAndAdmin: Joi.object({
    tenantName: Joi.string().min(2).max(120).required(),
    domain: Joi.string().min(2).max(120).allow(null, '').optional(),
    adminEmail: Joi.string().email().required(),
    adminName: Joi.string().min(1).max(120).required(),
  }),

  registerUser: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(1).max(120).required(),
    role: Joi.string().valid('admin', 'user').optional(),
  }),

  loginWithEmail: Joi.object({
    email: Joi.string().email().required(),
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export default authSchemas;
