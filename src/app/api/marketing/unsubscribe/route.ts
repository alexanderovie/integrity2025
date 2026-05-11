import { NextRequest, NextResponse } from "next/server";
import { unsubscribeMarketingSubscription } from "@/lib/marketing/subscriptions";

function getRedirectUrl(request: NextRequest, status: "success" | "invalid"): string {
  return new URL(`/unsubscribe?status=${status}`, request.nextUrl.origin).toString();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(getRedirectUrl(request, "invalid"));
  }

  const unsubscribed = await unsubscribeMarketingSubscription(token).catch(() => false);
  return NextResponse.redirect(getRedirectUrl(request, unsubscribed ? "success" : "invalid"));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const queryToken = request.nextUrl.searchParams.get("token")?.trim();

  if (queryToken) {
    const unsubscribed = await unsubscribeMarketingSubscription(queryToken).catch(() => false);
    return new NextResponse(null, { status: unsubscribed ? 200 : 404 });
  }

  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token) {
    return NextResponse.json({ error: "Unsubscribe token is required." }, { status: 400 });
  }

  const unsubscribed = await unsubscribeMarketingSubscription(token);

  if (!unsubscribed) {
    return NextResponse.json({ error: "Invalid unsubscribe token." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
