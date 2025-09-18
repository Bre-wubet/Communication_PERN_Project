import Joi from 'joi';

/**
 * Comment validation schemas
 */
export const commentSchemas = {
  createComment: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),

  updateComment: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),

  getCommentById: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  getComments: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    userId: Joi.number().integer().positive().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    search: Joi.string().min(1).max(100).optional(),
  }),

  deleteComment: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  createReply: Joi.object({
    commentId: Joi.number().integer().positive().required(),
    content: Joi.string().min(1).max(1000).required(),
  }),

  updateReply: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),

  getReplyById: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  getRepliesForComment: Joi.object({
    commentId: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  deleteReply: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  getMentionsForUser: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  searchComments: Joi.object({
    q: Joi.string().min(1).max(100).required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  getCommentStatistics: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),

  getRecentComments: Joi.object({
    limit: Joi.number().integer().min(1).max(50).optional(),
  }),

  getPopularComments: Joi.object({
    limit: Joi.number().integer().min(1).max(50).optional(),
  }),

  getCommentActivity: Joi.object({
    days: Joi.number().integer().min(1).max(365).optional(),
  }),
};

export default commentSchemas;
