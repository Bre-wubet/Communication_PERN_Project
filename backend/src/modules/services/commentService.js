import { commentRepository } from '../repositories/commentRepository.js';
import { notifier } from '../../utils/notifier.js';
import { logger } from '../../utils/logger.js';

class CommentService {
  constructor() {
    this.commentRepository = commentRepository;
    this.notifier = notifier;
  }

  /**
   * Create a new comment
   */
  async createComment(commentData) {
    try {
      const { tenantId, userId, content, ...options } = commentData;

      // Create comment
      const comment = await this.commentRepository.createComment({
        tenantId,
        userId,
        content,
      });

      // Extract mentions from content
      const mentions = this.extractMentions(content);
      
      // Send notifications for mentions
      if (mentions.length > 0) {
        try {
          await this.notifier.sendCommentNotification({
            comment: {
              id: comment.id,
              commenterName: comment.user.name,
              commentContent: content,
              mentionedUsers: mentions,
            },
          });
        } catch (error) {
          logger.error('Failed to send mention notifications:', error);
          // Don't fail the comment creation if notifications fail
        }
      }

      logger.info('Comment created successfully', {
        commentId: comment.id,
        userId,
        mentionsCount: mentions.length,
      });

      return comment;
    } catch (error) {
      logger.error('Create comment service error:', error);
      throw error;
    }
  }

  /**
   * Get comment by ID
   */
  async getCommentById(id) {
    try {
      return await this.commentRepository.getCommentById(id);
    } catch (error) {
      logger.error('Get comment by ID service error:', error);
      throw error;
    }
  }

  /**
   * Get comments with pagination and filters
   */
  async getComments(filters, pagination) {
    try {
      return await this.commentRepository.getComments(filters, pagination);
    } catch (error) {
      logger.error('Get comments service error:', error);
      throw error;
    }
  }

  /**
   * Update comment
   */
  async updateComment(id, content, userId) {
    try {
      // Check if user owns the comment
      const comment = await this.commentRepository.getCommentById(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new Error('Unauthorized to update this comment');
      }

      return await this.commentRepository.updateComment(id, content);
    } catch (error) {
      logger.error('Update comment service error:', error);
      throw error;
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(id, userId) {
    try {
      // Check if user owns the comment
      const comment = await this.commentRepository.getCommentById(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new Error('Unauthorized to delete this comment');
      }

      return await this.commentRepository.deleteComment(id);
    } catch (error) {
      logger.error('Delete comment service error:', error);
      throw error;
    }
  }

  /**
   * Create a reply to a comment
   */
  async createReply(replyData) {
    try {
      const { tenantId, commentId, userId, content, ...options } = replyData;

      // Check if parent comment exists
      const parentComment = await this.commentRepository.getCommentById(commentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      // Create reply
      const reply = await this.commentRepository.createReply({
        tenantId,
        commentId,
        userId,
        content,
      });

      // Extract mentions from content
      const mentions = this.extractMentions(content);
      
      // Create mention records
      for (const mention of mentions) {
        try {
          await this.commentRepository.createMention({
            tenantId,
            replyId: reply.id,
            userId: mention.id,
          });
        } catch (error) {
          logger.error('Failed to create mention:', error);
          // Continue with other mentions
        }
      }

      // Send notifications for mentions
      if (mentions.length > 0) {
        try {
          await this.notifier.sendCommentNotification({
            comment: {
              id: reply.id,
              commenterName: reply.user.name,
              commentContent: content,
              mentionedUsers: mentions,
            },
          });
        } catch (error) {
          logger.error('Failed to send mention notifications:', error);
          // Don't fail the reply creation if notifications fail
        }
      }

      // Send notification to original commenter
      try {
        await this.notifier.sendReplyNotification({
          reply: {
            id: reply.id,
            replierName: reply.user.name,
            replyContent: content,
            originalCommenter: parentComment.user,
          },
        });
      } catch (error) {
        logger.error('Failed to send reply notification:', error);
        // Don't fail the reply creation if notifications fail
      }

      logger.info('Reply created successfully', {
        replyId: reply.id,
        commentId,
        userId,
        mentionsCount: mentions.length,
      });

      return reply;
    } catch (error) {
      logger.error('Create reply service error:', error);
      throw error;
    }
  }

  /**
   * Get reply by ID
   */
  async getReplyById(id) {
    try {
      return await this.commentRepository.getReplyById(id);
    } catch (error) {
      logger.error('Get reply by ID service error:', error);
      throw error;
    }
  }

  /**
   * Get replies for a comment
   */
  async getRepliesForComment(commentId, pagination) {
    try {
      return await this.commentRepository.getRepliesForComment(commentId, pagination);
    } catch (error) {
      logger.error('Get replies for comment service error:', error);
      throw error;
    }
  }

  /**
   * Update reply
   */
  async updateReply(id, content, userId) {
    try {
      // Check if user owns the reply
      const reply = await this.commentRepository.getReplyById(id);
      if (!reply) {
        throw new Error('Reply not found');
      }

      if (reply.userId !== userId) {
        throw new Error('Unauthorized to update this reply');
      }

      return await this.commentRepository.updateReply(id, content);
    } catch (error) {
      logger.error('Update reply service error:', error);
      throw error;
    }
  }

  /**
   * Delete reply
   */
  async deleteReply(id, userId) {
    try {
      // Check if user owns the reply
      const reply = await this.commentRepository.getReplyById(id);
      if (!reply) {
        throw new Error('Reply not found');
      }

      if (reply.userId !== userId) {
        throw new Error('Unauthorized to delete this reply');
      }

      return await this.commentRepository.deleteReply(id);
    } catch (error) {
      logger.error('Delete reply service error:', error);
      throw error;
    }
  }

  /**
   * Get mentions for a user
   */
  async getMentionsForUser(userId, tenantId, pagination) {
    try {
      return await this.commentRepository.getMentionsForUser(userId, tenantId, pagination);
    } catch (error) {
      logger.error('Get mentions for user service error:', error);
      throw error;
    }
  }

  /**
   * Search comments and replies
   */
  async searchComments(query, tenantId, pagination) {
    try {
      return await this.commentRepository.searchComments(query, tenantId, pagination);
    } catch (error) {
      logger.error('Search comments service error:', error);
      throw error;
    }
  }

  /**
   * Get comment statistics
   */
  async getCommentStatistics(tenantId, startDate, endDate) {
    try {
      return await this.commentRepository.getCommentStatistics(tenantId, startDate, endDate);
    } catch (error) {
      logger.error('Get comment statistics service error:', error);
      throw error;
    }
  }

  /**
   * Extract mentions from content
   */
  extractMentions(content) {
    // Simple mention extraction - looks for @username patterns
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push({
        username: match[1],
        // In a real implementation, you would look up the user ID here
        id: match[1], // Placeholder
      });
    }

    return mentions;
  }

  /**
   * Get recent comments for a user
   */
  async getRecentComments(userId, tenantId, limit = 10) {
    try {
      const { comments } = await this.commentRepository.getComments(
        { userId, tenantId },
        { page: 1, limit }
      );

      return comments;
    } catch (error) {
      logger.error('Get recent comments service error:', error);
      throw error;
    }
  }

  /**
   * Get popular comments (most replies)
   */
  async getPopularComments(tenantId, limit = 10) {
    try {
      const { comments } = await this.commentRepository.getComments(
        { tenantId },
        { page: 1, limit }
      );

      // Sort by reply count
      return comments.sort((a, b) => b._count.replies - a._count.replies);
    } catch (error) {
      logger.error('Get popular comments service error:', error);
      throw error;
    }
  }

  /**
   * Get comment activity for a user
   */
  async getCommentActivity(userId, tenantId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const [comments, replies, mentions] = await Promise.all([
        this.commentRepository.getComments(
          { userId, tenantId, startDate, endDate },
          { page: 1, limit: 100 }
        ),
        this.commentRepository.getMentionsForUser(userId, tenantId, { page: 1, limit: 100 }),
        // Get replies by user (this would need a new repository method)
      ]);

      return {
        comments: comments.comments,
        mentions: mentions.mentions,
        totalComments: comments.pagination.total,
        totalMentions: mentions.pagination.total,
      };
    } catch (error) {
      logger.error('Get comment activity service error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const commentService = new CommentService();

export { commentService };
export default commentService;
