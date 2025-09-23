import { commentService } from '../services/commentService.js';
import { logger } from '../../utils/logger.js';
import { asyncHandler } from '../../middlewares/errorMiddleware.js';

class CommentController {
  constructor() {
    this.commentService = commentService;
  }

  /**
   * Create a new comment
   */
  createComment = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const commentData = {
        ...req.body,
        tenantId,
        userId,
      };

      const result = await this.commentService.createComment(commentData);

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Create comment controller error:', error);
      throw error;
    }
  });

  /**
   * Get comment by ID
   */
  getCommentById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.commentService.getCommentById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Comment retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get comment by ID controller error:', error);
      throw error;
    }
  });

  /**
   * Get comments with pagination and filters
   */
  getComments = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const filters = {
        ...req.query,
        tenantId,
      };
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.commentService.getComments(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get comments controller error:', error);
      throw error;
    }
  });

  /**
   * Update comment
   */
  updateComment = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { content } = req.body;

      const result = await this.commentService.updateComment(
        parseInt(id),
        content,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Update comment controller error:', error);
      throw error;
    }
  });

  /**
   * Delete comment
   */
  deleteComment = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await this.commentService.deleteComment(parseInt(id), userId);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Delete comment controller error:', error);
      throw error;
    }
  });

  /**
   * Create a reply to a comment
   */
  createReply = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const replyData = {
        ...req.body,
        tenantId,
        userId,
      };

      const result = await this.commentService.createReply(replyData);

      res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Create reply controller error:', error);
      throw error;
    }
  });

  /**
   * Get reply by ID
   */
  getReplyById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.commentService.getReplyById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reply retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get reply by ID controller error:', error);
      throw error;
    }
  });

  /**
   * Get replies for a comment
   */
  getRepliesForComment = asyncHandler(async (req, res) => {
    try {
      const { commentId } = req.params;
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.commentService.getRepliesForComment(
        parseInt(commentId),
        pagination
      );

      res.status(200).json({
        success: true,
        message: 'Replies retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get replies for comment controller error:', error);
      throw error;
    }
  });

  /**
   * Update reply
   */
  updateReply = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { content } = req.body;

      const result = await this.commentService.updateReply(
        parseInt(id),
        content,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Reply updated successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Update reply controller error:', error);
      throw error;
    }
  });

  /**
   * Delete reply
   */
  deleteReply = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await this.commentService.deleteReply(parseInt(id), userId);

      res.status(200).json({
        success: true,
        message: 'Reply deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Delete reply controller error:', error);
      throw error;
    }
  });

  /**
   * Get mentions for a user
   */
  getMentionsForUser = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.commentService.getMentionsForUser(
        userId,
        tenantId,
        pagination
      );

      res.status(200).json({
        success: true,
        message: 'Mentions retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get mentions for user controller error:', error);
      throw error;
    }
  });

  /**
   * Search comments and replies
   */
  searchComments = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { q: query } = req.query;
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const result = await this.commentService.searchComments(
        query,
        tenantId,
        pagination
      );

      res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Search comments controller error:', error);
      throw error;
    }
  });

  /**
   * Get comment statistics
   */
  getCommentStatistics = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { startDate, endDate } = req.query;

      const result = await this.commentService.getCommentStatistics(
        tenantId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: 'Comment statistics retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get comment statistics controller error:', error);
      throw error;
    }
  });

  /**
   * Get recent comments for a user
   */
  getRecentComments = asyncHandler(async (req, res) => {
    try {
      const { userId } = req;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { limit } = req.query;

      const result = await this.commentService.getRecentComments(
        userId,
        tenantId,
        parseInt(limit) || 10
      );

      res.status(200).json({
        success: true,
        message: 'Recent comments retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get recent comments controller error:', error);
      throw error;
    }
  });

  /**
   * Get popular comments (most replies)
   */
  getPopularComments = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { limit } = req.query;

      const result = await this.commentService.getPopularComments(
        tenantId,
        parseInt(limit) || 10
      );

      res.status(200).json({
        success: true,
        message: 'Popular comments retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get popular comments controller error:', error);
      throw error;
    }
  });

  /**
   * Get comment activity for a user
   */
  getCommentActivity = asyncHandler(async (req, res) => {
    try {
      const { userId } = req;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { days } = req.query;

      const result = await this.commentService.getCommentActivity(
        userId,
        tenantId,
        parseInt(days) || 30
      );

      res.status(200).json({
        success: true,
        message: 'Comment activity retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get comment activity controller error:', error);
      throw error;
    }
  });
}

// Create singleton instance
const commentController = new CommentController();

export { commentController };
export default commentController;
