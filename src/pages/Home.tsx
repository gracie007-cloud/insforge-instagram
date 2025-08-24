import React, { useState, useEffect } from 'react';
import { postsService } from '../services/posts';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import styles from './Home.module.css';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsService.getPosts();
      
      // Check which posts are liked by current user
      const userId = localStorage.getItem('user_id');
      if (userId && data.length > 0) {
        const postIds = data.map(p => p.id);
        try {
          const likesResponse = await postsService.getUserLikes(userId, postIds);
          const likedPostIds = new Set(likesResponse.map((like: any) => like.post_id));
          
          data.forEach(post => {
            post.liked_by_user = likedPostIds.has(post.id);
          });
        } catch (err) {
          console.error('Failed to load likes:', err);
        }
      }
      
      setPosts(data);
    } catch (err: any) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await postsService.unlikePost(postId);
      } else {
        await postsService.likePost(postId);
      }
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              liked_by_user: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={loadPosts}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <div className={styles.mainColumn}>
          <Stories />
          
          <div className={styles.posts}>
            {posts.length === 0 ? (
              <div className={styles.noPosts}>
                <p>No posts yet</p>
                <p>Follow people to see their posts here!</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onLike={handleLike}
                />
              ))
            )}
          </div>
        </div>
        
        <aside className={styles.sidebar}>
          <div className={styles.suggestions}>
            <h3>Suggestions For You</h3>
            <p className={styles.placeholder}>Coming soon...</p>
          </div>
        </aside>
      </div>
    </div>
  );
}