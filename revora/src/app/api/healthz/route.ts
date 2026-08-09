import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@workspace/api-zod";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(HealthCheckResponse.parse({ status: "ok" }));
}
