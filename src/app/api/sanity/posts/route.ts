import { NextResponse } from "next/server";
import { fetchSanityPosts, mapSanityPostToApiContract } from "@/sanity/lib/post-schema";

export async function GET() {
  try {
    const posts = await fetchSanityPosts();
    return NextResponse.json(posts.map(mapSanityPostToApiContract));
  } catch (error) {
    console.error("Failed to fetch Sanity posts", error);
    return NextResponse.json(
      { error: "Sanity content is unavailable" },
      { status: 503 },
    );
  }
}
