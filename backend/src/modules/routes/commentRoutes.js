import { Router } from 'express';
import { commentController } from '../controllers/commentController.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { commentSchemas } from '../validations/commentValidation.js';
import { authenticateToken, authorize } from '../../middlewares/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post('/',
  validate(commentSchemas.createComment, 'body'),
  commentController.createComment
);

/**
 * @route   GET /api/comments
 * @desc    Get comments with pagination and filters
 * @access  Private
 */
router.get('/',
  validate(commentSchemas.getComments, 'query'),
  commentController.getComments
);

/**
 * @route   GET /api/comments/:id
 * @desc    Get comment by ID
 * @access  Private
 */
router.get('/:id',
  validate(commentSchemas.getCommentById, 'params'),
  commentController.getCommentById
);

/**
 * @route   PUT /api/comments/:id
 * @desc    Update comment
 * @access  Private
 */
router.put('/:id',
  validate(commentSchemas.getCommentById, 'params'),
  validate(commentSchemas.updateComment, 'body'),
  commentController.updateComment
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete comment
 * @access  Private
 */
router.delete('/:id',
  validate(commentSchemas.getCommentById, 'params'),
  commentController.deleteComment
);

/**
 * @route   POST /api/comments/:commentId/replies
 * @desc    Create a reply to a comment
 * @access  Private
 */
router.post('/:commentId/replies',
  validate(commentSchemas.createReply, 'body'),
  commentController.createReply
);

/**
 * @route   GET /api/comments/:commentId/replies
 * @desc    Get replies for a comment
 * @access  Private
 */
router.get('/:commentId/replies',
  validate(commentSchemas.getRepliesForComment, 'params'),
  validate(commentSchemas.getRepliesForComment, 'query'),
  commentController.getRepliesForComment
);

/**
 * @route   GET /api/comments/replies/:id
 * @desc    Get reply by ID
 * @access  Private
 */
router.get('/replies/:id',
  validate(commentSchemas.getReplyById, 'params'),
  commentController.getReplyById
);

/**
 * @route   PUT /api/comments/replies/:id
 * @desc    Update reply
 * @access  Private
 */
router.put('/replies/:id',
  validate(commentSchemas.getReplyById, 'params'),
  validate(commentSchemas.updateReply, 'body'),
  commentController.updateReply
);

/**
 * @route   DELETE /api/comments/replies/:id
 * @desc    Delete reply
 * @access  Private
 */
router.delete('/replies/:id',
  validate(commentSchemas.getReplyById, 'params'),
  commentController.deleteReply
);

/**
 * @route   GET /api/comments/mentions
 * @desc    Get mentions for a user
 * @access  Private
 */
router.get('/mentions',
  validate(commentSchemas.getMentionsForUser, 'query'),
  commentController.getMentionsForUser
);

/**
 * @route   GET /api/comments/search
 * @desc    Search comments and replies
 * @access  Private
 */
router.get('/search',
  validate(commentSchemas.searchComments, 'query'),
  commentController.searchComments
);

/**
 * @route   GET /api/comments/statistics
 * @desc    Get comment statistics
 * @access  Private
 */
router.get('/statistics',
  validate(commentSchemas.getCommentStatistics, 'query'),
  commentController.getCommentStatistics
);

/**
 * @route   GET /api/comments/recent
 * @desc    Get recent comments for a user
 * @access  Private
 */
router.get('/recent',
  validate(commentSchemas.getRecentComments, 'query'),
  commentController.getRecentComments
);

/**
 * @route   GET /api/comments/popular
 * @desc    Get popular comments (most replies)
 * @access  Private
 */
router.get('/popular',
  validate(commentSchemas.getPopularComments, 'query'),
  commentController.getPopularComments
);

/**
 * @route   GET /api/comments/activity
 * @desc    Get comment activity for a user
 * @access  Private
 */
router.get('/activity',
  validate(commentSchemas.getCommentActivity, 'query'),
  commentController.getCommentActivity
);

export default router;
