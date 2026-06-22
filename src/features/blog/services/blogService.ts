import api from "@/lib/api";

export interface BlogAuthor {
  _id: string;
  name: string;
  profilePicture?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: BlogAuthor;
  coverImage?: string;
  tags: string[];
  status: "draft" | "published";
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBlogs {
  success: boolean;
  message: string;
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface BlogResponse {
  success: boolean;
  message: string;
  data: Blog;
}

export const blogService = {
  getBlogs: async (page = 1, limit = 10): Promise<PaginatedBlogs> => {
    const { data } = await api.get<PaginatedBlogs>(`/blogs?page=${page}&limit=${limit}`);
    return data;
  },

  getBlogBySlug: async (slug: string): Promise<BlogResponse> => {
    const { data } = await api.get<BlogResponse>(`/blogs/${slug}`);
    return data;
  },

  createBlog: async (blogData: Partial<Blog>): Promise<BlogResponse> => {
    const { data } = await api.post<BlogResponse>("/blogs", blogData);
    return data;
  },
};
