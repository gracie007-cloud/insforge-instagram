export interface User {
  id: string;
  email: string;
  name?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  profile_picture_url?: string;
  is_private: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Post {
  id: string;
  user_id: string;
  caption?: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  media?: PostMedia[];
  user_profile?: UserProfile;
  liked_by_user?: boolean;
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_url: string;
  media_type: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
  liked_by_user?: boolean;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  expires_at: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
  viewed_by_user?: boolean;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}