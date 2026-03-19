import type { BlogPost } from "./types";
import { fetchSanityPostBySlug, mapSanityPostToBlogPost } from "@/sanity/lib/post-schema";

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await fetchSanityPostBySlug(slug);
  return post ? mapSanityPostToBlogPost(post) : null;
}
