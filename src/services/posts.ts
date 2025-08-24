import api from './api';
import { Post, PostMedia, Comment } from '../types';

export const postsService = {
  async getPosts(limit = 20, offset = 0) {
    const response = await api.get<Post[]>('/database/records/posts', {
      params: {
        order: 'created_at.desc',
        limit,
        offset
      },
      headers: {
        'Range': `${offset}-${offset + limit - 1}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (response.data.length === 0) return response.data;
    
    // Get unique user IDs and post IDs
    const postIds = response.data.map(p => p.id);
    const userIds = [...new Set(response.data.map(p => p.user_id))];
    
    // Load media for posts
    if (postIds.length > 0) {
      const mediaResponse = await api.get<PostMedia[]>(
        `/database/records/post_media?post_id=in.(${postIds.join(',')})`
      );
      
      // Group media by post
      const mediaByPost = mediaResponse.data.reduce((acc, media) => {
        if (!acc[media.post_id]) acc[media.post_id] = [];
        acc[media.post_id].push(media);
        return acc;
      }, {} as Record<string, PostMedia[]>);
      
      // Attach media to posts
      response.data.forEach(post => {
        post.media = mediaByPost[post.id] || [];
      });
    }
    
    // Load user profiles
    if (userIds.length > 0) {
      const profilesResponse = await api.get(
        `/database/records/user_profiles?user_id=in.(${userIds.join(',')})`
      );
      
      // Create a map of user profiles
      const profilesByUserId = profilesResponse.data.reduce((acc: any, profile: any) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {});
      
      // Attach user profiles to posts
      response.data.forEach(post => {
        post.user_profile = profilesByUserId[post.user_id];
      });
    }
    
    return response.data;
  },

  async createPost(caption: string, location: string | undefined, mediaFiles: File[]) {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User not authenticated');

    // Create post
    const postResponse = await api.post<Post[]>('/database/records/posts', [{
      user_id: userId,
      caption,
      location
    }], {
      headers: { 'Prefer': 'return=representation' }
    });
    
    const post = postResponse.data[0];
    
    // Upload media files
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      
      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${post.id}_${i}_${Date.now()}.${ext}`;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to storage with POST method (auto-generated key)
      const uploadResponse = await api.post(
        `/storage/buckets/instagram-media/objects`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Create media record with the returned URL
      await api.post('/database/records/post_media', [{
        post_id: post.id,
        media_url: uploadResponse.data.url || uploadResponse.data.path || `/api/storage/buckets/instagram-media/objects/${uploadResponse.data.key || filename}`,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
        order_index: i
      }], {
        headers: { 'Prefer': 'return=representation' }
      });
    }
    
    return post;
  },

  async likePost(postId: string) {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User not authenticated');

    await api.post('/database/records/likes', [{
      user_id: userId,
      post_id: postId
    }], {
      headers: { 'Prefer': 'return=representation' }
    });
  },

  async unlikePost(postId: string) {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User not authenticated');

    await api.delete(
      `/database/records/likes?user_id=eq.${userId}&post_id=eq.${postId}`,
      {
        headers: { 'Prefer': 'return=representation' }
      }
    );
  },

  async getComments(postId: string) {
    const response = await api.get<Comment[]>(
      `/database/records/comments?post_id=eq.${postId}&order=created_at.desc`
    );
    return response.data;
  },

  async addComment(postId: string, content: string) {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User not authenticated');

    const response = await api.post<Comment[]>('/database/records/comments', [{
      post_id: postId,
      user_id: userId,
      content
    }], {
      headers: { 'Prefer': 'return=representation' }
    });
    
    return response.data[0];
  },

  async getUserLikes(userId: string, postIds: string[]) {
    const response = await api.get(
      `/database/records/likes?user_id=eq.${userId}&post_id=in.(${postIds.join(',')})`
    );
    return response.data;
  }
};