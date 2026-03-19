import type { BlogPostMetadata } from "./types";
import {
  fetchPaginatedSanityPostSummaries,
  fetchSanityPostCount,
  mapSanityPostSummaryToBlogMetadata,
} from "@/sanity/lib/post-schema";

export const BLOG_POSTS_PAGE_SIZE = 9;

export async function getAllPosts(page = 1): Promise<BlogPostMetadata[]> {
  const posts = await fetchPaginatedSanityPostSummaries({
    page,
    pageSize: BLOG_POSTS_PAGE_SIZE,
  });

  return posts.map(mapSanityPostSummaryToBlogMetadata);
}

export async function getBlogPagination(page = 1): Promise<{
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}> {
  const totalPosts = await fetchSanityPostCount();
  const totalPages = Math.max(1, Math.ceil(totalPosts / BLOG_POSTS_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return {
    currentPage,
    totalPages,
    totalPosts,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}
