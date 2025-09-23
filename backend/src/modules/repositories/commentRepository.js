import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

class CommentRepository {
  constructor() {
    this.dbConfig = dbConfig;
  }

  get prisma() {
    return this.dbConfig.getClient();
  }

  /**
   * Create a new comment
   */
  async createComment(commentData) {
    try {
      const comment = await this.prisma.comment.create({
        data: {
          tenantId: commentData.tenantId,
          userId: commentData.userId,
          content: commentData.content,
        },
        include: {
          user: true,
          replies: {
            include: {
              user: true,
              mentions: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      logger.debug('Comment created:', { id: comment.id, userId: comment.userId });
      return comment;
    } catch (error) {
      logger.error('Failed to create comment:', error);
      throw error;
    }
  }

  /**
   * Get comment by ID
   */
  async getCommentById(id) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        include: {
          user: true,
          tenant: true,
          replies: {
            include: {
              user: true,
              mentions: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return comment;
    } catch (error) {
      logger.error('Failed to get comment by ID:', error);
      throw error;
    }
  }

  /**
   * Get comments with pagination and filters
   */
  async getComments(filters = {}, pagination = {}) {
    try {
      const {
        tenantId,
        userId,
        startDate,
        endDate,
        search,
      } = filters;

      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const where = {
        ...(tenantId && { tenantId }),
        ...(userId && { userId }),
        ...(search && { content: { contains: search, mode: 'insensitive' } }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [comments, total] = await Promise.all([
        this.prisma.comment.findMany({
          where,
          include: {
            user: true,
            tenant: true,
            replies: {
              include: {
                user: true,
                mentions: {
                  include: {
                    user: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
            _count: {
              select: { replies: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.comment.count({ where }),
      ]);

      return {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get comments:', error);
      throw error;
    }
  }

  /**
   * Update comment
   */
  async updateComment(id, content) {
    try {
      const comment = await this.prisma.comment.update({
        where: { id },
        data: {
          content,
          updatedAt: new Date(),
        },
        include: {
          user: true,
          replies: {
            include: {
              user: true,
              mentions: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      logger.debug('Comment updated:', { id });
      return comment;
    } catch (error) {
      logger.error('Failed to update comment:', error);
      throw error;
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(id) {
    try {
      // Delete all replies and mentions first
      await this.prisma.mention.deleteMany({
        where: {
          reply: {
            commentId: id,
          },
        },
      });

      await this.prisma.reply.deleteMany({
        where: { commentId: id },
      });

      // Delete the comment
      await this.prisma.comment.delete({
        where: { id },
      });

      logger.debug('Comment deleted:', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete comment:', error);
      throw error;
    }
  }

  /**
   * Create a reply to a comment
   */
  async createReply(replyData) {
    try {
      const reply = await this.prisma.reply.create({
        data: {
          tenantId: replyData.tenantId,
          commentId: replyData.commentId,
          userId: replyData.userId,
          content: replyData.content,
        },
        include: {
          user: true,
          comment: {
            include: {
              user: true,
            },
          },
          mentions: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.debug('Reply created:', { id: reply.id, commentId: reply.commentId });
      return reply;
    } catch (error) {
      logger.error('Failed to create reply:', error);
      throw error;
    }
  }

  /**
   * Get reply by ID
   */
  async getReplyById(id) {
    try {
      const reply = await this.prisma.reply.findUnique({
        where: { id },
        include: {
          user: true,
          comment: {
            include: {
              user: true,
            },
          },
          mentions: {
            include: {
              user: true,
            },
          },
        },
      });

      return reply;
    } catch (error) {
      logger.error('Failed to get reply by ID:', error);
      throw error;
    }
  }

  /**
   * Get replies for a comment
   */
  async getRepliesForComment(commentId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const [replies, total] = await Promise.all([
        this.prisma.reply.findMany({
          where: { commentId },
          include: {
            user: true,
            mentions: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
        }),
        this.prisma.reply.count({ where: { commentId } }),
      ]);

      return {
        replies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get replies for comment:', error);
      throw error;
    }
  }

  /**
   * Update reply
   */
  async updateReply(id, content) {
    try {
      const reply = await this.prisma.reply.update({
        where: { id },
        data: {
          content,
          updatedAt: new Date(),
        },
        include: {
          user: true,
          comment: {
            include: {
              user: true,
            },
          },
          mentions: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.debug('Reply updated:', { id });
      return reply;
    } catch (error) {
      logger.error('Failed to update reply:', error);
      throw error;
    }
  }

  /**
   * Delete reply
   */
  async deleteReply(id) {
    try {
      // Delete all mentions first
      await this.prisma.mention.deleteMany({
        where: { replyId: id },
      });

      // Delete the reply
      await this.prisma.reply.delete({
        where: { id },
      });

      logger.debug('Reply deleted:', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete reply:', error);
      throw error;
    }
  }

  /**
   * Create a mention
   */
  async createMention(mentionData) {
    try {
      const mention = await this.prisma.mention.create({
        data: {
          tenantId: mentionData.tenantId,
          replyId: mentionData.replyId,
          userId: mentionData.userId,
        },
        include: {
          user: true,
          reply: {
            include: {
              user: true,
              comment: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      logger.debug('Mention created:', { id: mention.id, userId: mention.userId });
      return mention;
    } catch (error) {
      logger.error('Failed to create mention:', error);
      throw error;
    }
  }

  /**
   * Get mentions for a user
   */
  async getMentionsForUser(userId, tenantId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const [mentions, total] = await Promise.all([
        this.prisma.mention.findMany({
          where: {
            userId,
            tenantId,
          },
          include: {
            user: true,
            reply: {
              include: {
                user: true,
                comment: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.mention.count({
          where: {
            userId,
            tenantId,
          },
        }),
      ]);

      return {
        mentions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get mentions for user:', error);
      throw error;
    }
  }

  /**
   * Get comment statistics
   */
  async getCommentStatistics(tenantId, startDate, endDate) {
    try {
      const where = {
        tenantId,
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [
        totalComments,
        totalReplies,
        totalMentions,
        commentsByUser,
      ] = await Promise.all([
        this.prisma.comment.count({ where }),
        this.prisma.reply.count({ where }),
        this.prisma.mention.count({ where }),
        this.prisma.comment.groupBy({
          by: ['userId'],
          where,
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        }),
      ]);

      return {
        totalComments,
        totalReplies,
        totalMentions,
        commentsByUser,
      };
    } catch (error) {
      logger.error('Failed to get comment statistics:', error);
      throw error;
    }
  }

  /**
   * Search comments and replies
   */
  async searchComments(query, tenantId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const [comments, replies, total] = await Promise.all([
        this.prisma.comment.findMany({
          where: {
            tenantId,
            content: { contains: query, mode: 'insensitive' },
          },
          include: {
            user: true,
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.reply.findMany({
          where: {
            tenantId,
            content: { contains: query, mode: 'insensitive' },
          },
          include: {
            user: true,
            comment: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.comment.count({
          where: {
            tenantId,
            content: { contains: query, mode: 'insensitive' },
          },
        }) + this.prisma.reply.count({
          where: {
            tenantId,
            content: { contains: query, mode: 'insensitive' },
          },
        }),
      ]);

      return {
        comments,
        replies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to search comments:', error);
      throw error;
    }
  }
}

// Create singleton instance
const commentRepository = new CommentRepository();

export { commentRepository };
export default commentRepository;
