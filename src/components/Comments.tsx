import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, X } from 'lucide-react';
import { Comment } from '../types';
import { postsService } from '../services/posts';
import { authService } from '../services/auth';
import styles from './Comments.module.css';

interface CommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export default function Comments({ postId, isOpen, onClose, onCommentAdded }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await postsService.getComments(postId);
      
      // Load user profiles for each comment
      const enrichedComments = await Promise.all(data.map(async (comment) => {
        const profile = await authService.getUserProfile(comment.user_id);
        return { ...comment, user_profile: profile || undefined };
      }));
      
      setComments(enrichedComments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await postsService.addComment(postId, newComment);
      const profile = await authService.getUserProfile(comment.user_id);
      const enrichedComment = { ...comment, user_profile: profile || undefined };
      
      setComments([enrichedComment, ...comments]);
      setNewComment('');
      onCommentAdded();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Comments</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.commentsList}>
          {loading ? (
            <div className={styles.loading}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className={styles.noComments}>No comments yet. Be the first!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.avatar}>
                    {comment.user_profile?.profile_picture_url ? (
                      <img src={comment.user_profile.profile_picture_url} alt="" />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {comment.user_profile?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentText}>
                      <span className={styles.username}>
                        {comment.user_profile?.username || 'user'}
                      </span>
                      {' '}
                      {comment.content}
                    </div>
                    <div className={styles.commentMeta}>
                      <time className={styles.time}>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </time>
                      <span className={styles.likes}>
                        {comment.likes_count > 0 && `${comment.likes_count} likes`}
                      </span>
                    </div>
                  </div>
                  <button className={styles.likeBtn}>
                    <Heart size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <form className={styles.addComment} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            className={styles.commentInput}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className={styles.postBtn}
          >
            {submitting ? '...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}