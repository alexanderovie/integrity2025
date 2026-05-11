import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Custom HubSpot property creation is disabled. Map CRM data to existing HubSpot properties instead.",
    },
    { status: 410 },
  );
}
