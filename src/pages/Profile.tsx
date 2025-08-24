import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid3x3, PlayCircle, Bookmark, Settings } from 'lucide-react';
import { authService } from '../services/auth';
import { UserProfile, Post } from '../types';
import api from '../services/api';
import styles from './Profile.module.css';

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('user_id');
  const isOwnProfile = userId === currentUserId;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      checkFollowStatus();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const profileData = await authService.getUserProfile(userId!);
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await api.get<Post[]>(
        `/database/records/posts?user_id=eq.${userId}&order=created_at.desc`
      );
      
      // Load media for posts
      const postIds = response.data.map(p => p.id);
      if (postIds.length > 0) {
        const mediaResponse = await api.get(
          `/database/records/post_media?post_id=in.(${postIds.join(',')})`
        );
        
        const mediaByPost = mediaResponse.data.reduce((acc: any, media: any) => {
          if (!acc[media.post_id]) acc[media.post_id] = [];
          acc[media.post_id].push(media);
          return acc;
        }, {});
        
        response.data.forEach(post => {
          post.media = mediaByPost[post.id] || [];
        });
      }
      
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUserId || currentUserId === userId) return;
    
    try {
      const response = await api.get(
        `/database/records/follows?follower_id=eq.${currentUserId}&following_id=eq.${userId}`
      );
      setIsFollowing(response.data.length > 0);
    } catch (err) {
      console.error('Failed to check follow status:', err);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) return;
    
    try {
      if (isFollowing) {
        await api.delete(
          `/database/records/follows?follower_id=eq.${currentUserId}&following_id=eq.${userId}`
        );
        setIsFollowing(false);
        if (profile) {
          setProfile({ ...profile, followers_count: profile.followers_count - 1 });
        }
      } else {
        await api.post('/database/records/follows', [{
          follower_id: currentUserId,
          following_id: userId,
          status: 'active'
        }]);
        setIsFollowing(true);
        if (profile) {
          setProfile({ ...profile, followers_count: profile.followers_count + 1 });
        }
      }
    } catch (err) {
      console.error('Failed to update follow:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.notFound}>
        <h2>User not found</h2>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.avatarSection}>
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          
          <div className={styles.info}>
            <div className={styles.topRow}>
              <h1 className={styles.username}>{profile.username}</h1>
              {isOwnProfile ? (
                <>
                  <button className={styles.editBtn}>Edit profile</button>
                  <button className={styles.settingsBtn}>
                    <Settings size={24} />
                  </button>
                </>
              ) : (
                <button 
                  className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>{profile.posts_count}</strong> posts
              </div>
              <div className={styles.stat}>
                <strong>{profile.followers_count}</strong> followers
              </div>
              <div className={styles.stat}>
                <strong>{profile.following_count}</strong> following
              </div>
            </div>
            
            {profile.display_name && (
              <div className={styles.displayName}>{profile.display_name}</div>
            )}
            {profile.bio && (
              <div className={styles.bio}>{profile.bio}</div>
            )}
          </div>
        </header>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid3x3 size={12} />
            <span>POSTS</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'reels' ? styles.active : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <PlayCircle size={12} />
            <span>REELS</span>
          </button>
          {isOwnProfile && (
            <button 
              className={`${styles.tab} ${activeTab === 'saved' ? styles.active : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={12} />
              <span>SAVED</span>
            </button>
          )}
        </div>
        
        <div className={styles.content}>
          {activeTab === 'posts' && (
            <div className={styles.postsGrid}>
              {posts.length === 0 ? (
                <div className={styles.noPosts}>
                  <p>No posts yet</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className={styles.postItem}>
                    {post.media?.[0] && (
                      post.media[0].media_type === 'video' ? (
                        <video src={post.media[0].media_url} className={styles.postMedia} />
                      ) : (
                        <img src={post.media[0].media_url} alt="" className={styles.postMedia} />
                      )
                    )}
                    <div className={styles.postOverlay}>
                      <span>❤️ {post.likes_count}</span>
                      <span>💬 {post.comments_count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'reels' && (
            <div className={styles.placeholder}>
              <p>No reels yet</p>
            </div>
          )}
          
          {activeTab === 'saved' && isOwnProfile && (
            <div className={styles.placeholder}>
              <p>No saved posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}