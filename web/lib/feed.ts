import { api } from "./api";

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  images: string[];
  authorId: string;
  hostelId?: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  hostel?: {
    id: string;
    name: string;
    images: string[];
    city: string;
  };
  room?: {
    id: string;
    name: string;
    pricePerTerm: number;
  };
  _count: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export interface FeedResponse {
  posts: Post[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const feedApi = {
  getPosts: (page: number = 1, limit: number = 10) =>
    api.get<FeedResponse>("/feed", { params: { page, limit } }).then((res) => res.data),

  getPost: (id: string) =>
    api.get<Post>(`/feed/${id}`).then((res) => res.data),

  createPost: (data: { content: string; images?: string[]; hostelId?: string; roomId?: string }) =>
    api.post<Post>("/feed", data).then((res) => res.data),

  updatePost: (id: string, data: { content?: string; images?: string[] }) =>
    api.patch<Post>(`/feed/${id}`, data).then((res) => res.data),

  deletePost: (id: string) =>
    api.delete(`/feed/${id}`).then((res) => res.data),

  likePost: (id: string) =>
    api.post(`/feed/${id}/like`).then((res) => res.data),

  unlikePost: (id: string) =>
    api.delete(`/feed/${id}/like`).then((res) => res.data),

  addComment: (id: string, content: string) =>
    api.post<Comment>(`/feed/${id}/comments`, { content }).then((res) => res.data),

  deleteComment: (commentId: string) =>
    api.delete(`/feed/comments/${commentId}`).then((res) => res.data),

  sharePost: (id: string) =>
    api.post(`/feed/${id}/share`).then((res) => res.data),
};
