export type User = {
    id: number;
    username: string;
    email: string;
  };
  
  export type Post = {
    id: number;
    content: string;
    user_id: number;
    username: string;
    likeCount: number;
    repostCount: number;
    created_at: string;
    isLiked: boolean;
    parent_id: number | null;
    replyToUsername?: string;
  };
  
  export type AuthResponse = {
    message: string;
    token: string;
    user: User;
  };