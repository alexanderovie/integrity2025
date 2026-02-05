import { NextRequest, NextResponse } from "next/server";
import { hubspotRequest } from "@/lib/hubspot/client";

type HubSpotPipelineStage = {
  id: string;
  label: string;
  metadata?: Record<string, string>;
};

type HubSpotPipeline = {
  id: string;
  label: string;
  stages: HubSpotPipelineStage[];
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const objectType = request.nextUrl.searchParams.get("object") || "deals";

  try {
    const response = await hubspotRequest<{ results: HubSpotPipeline[] }>(
      `/crm/v3/pipelines/${objectType}`
    );

    return NextResponse.json({
      object: objectType,
      pipelines: response.results.map((pipeline) => ({
        id: pipeline.id,
        label: pipeline.label,
        stages: pipeline.stages.map((stage) => ({
          id: stage.id,
          label: stage.label,
        })),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load pipelines";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
