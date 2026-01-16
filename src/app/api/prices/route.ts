import { getStripeServicePrices } from "@/lib/stripe-prices";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const prices = await getStripeServicePrices();

  return NextResponse.json(
    { prices },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
