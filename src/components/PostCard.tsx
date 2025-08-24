import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';
import Comments from './Comments';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
  onLike: (postId: string, isLiked: boolean) => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const handleNextImage = () => {
    if (post.media && imageIndex < post.media.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  };

  return (
    <article className={styles.postCard}>
      <header className={styles.header}>
        <Link to={`/profile/${post.user_id}`} className={styles.userInfo}>
          <div className={styles.avatar}>
            {post.user_profile?.profile_picture_url ? (
              <img src={post.user_profile.profile_picture_url} alt="" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {post.user_profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className={styles.username}>
              {post.user_profile?.username || post.user_profile?.display_name || 'Anonymous'}
            </div>
            {post.location && (
              <div className={styles.location}>{post.location}</div>
            )}
          </div>
        </Link>
        <button className={styles.moreBtn}>
          <MoreHorizontal size={20} />
        </button>
      </header>

      {post.media && post.media.length > 0 && (
        <div className={styles.mediaContainer}>
          <div className={styles.mediaWrapper}>
            {post.media[imageIndex]?.media_type === 'video' ? (
              <video
                src={post.media[imageIndex].media_url}
                controls
                className={styles.media}
              />
            ) : (
              <img
                src={post.media[imageIndex]?.media_url}
                alt=""
                className={styles.media}
                onDoubleClick={() => onLike(post.id, post.liked_by_user || false)}
              />
            )}
          </div>
          
          {post.media.length > 1 && (
            <>
              {imageIndex > 0 && (
                <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrevImage}>
                  ‹
                </button>
              )}
              {imageIndex < post.media.length - 1 && (
                <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNextImage}>
                  ›
                </button>
              )}
              <div className={styles.indicators}>
                {post.media.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.indicator} ${idx === imageIndex ? styles.active : ''}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <div className={styles.leftActions}>
          <button
            className={`${styles.actionBtn} ${post.liked_by_user ? styles.liked : ''}`}
            onClick={() => onLike(post.id, post.liked_by_user || false)}
          >
            <Heart size={24} fill={post.liked_by_user ? 'currentColor' : 'none'} />
          </button>
          <button className={styles.actionBtn} onClick={() => setShowComments(true)}>
            <MessageCircle size={24} />
          </button>
          <button className={styles.actionBtn}>
            <Send size={24} />
          </button>
        </div>
        <button className={styles.actionBtn}>
          <Bookmark size={24} />
        </button>
      </div>

      <div className={styles.content}>
        {localPost.likes_count > 0 && (
          <div className={styles.likes}>
            {localPost.likes_count} {localPost.likes_count === 1 ? 'like' : 'likes'}
          </div>
        )}
        
        {post.caption && (
          <div className={styles.caption}>
            <Link to={`/profile/${post.user_id}`} className={styles.captionUsername}>
              {post.user_profile?.username || post.user_profile?.display_name || 'Anonymous'}
            </Link>
            {' '}
            {post.caption}
          </div>
        )}
        
        {localPost.comments_count > 0 && (
          <button className={styles.viewComments} onClick={() => setShowComments(true)}>
            View all {localPost.comments_count} comments
          </button>
        )}
        
        <time className={styles.time}>
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </time>
      </div>

      <Comments
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setLocalPost({ ...localPost, comments_count: localPost.comments_count + 1 })}
      />
    </article>
  );
}