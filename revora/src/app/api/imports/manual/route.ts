import { NextResponse } from "next/server";
import { resolveOrganizationId } from "@/lib/tenant";
import { importNormalizedRows } from "@/lib/revenue-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.customer || !body.product || body.orderValue == null || !body.channel || !body.orderDate || !body.status) {
    return NextResponse.json({ error: "customer, product, orderValue, channel, orderDate, status are required" }, { status: 400 });
  }
  const organizationId = await resolveOrganizationId(request);
  const summary = await importNormalizedRows(organizationId, [{
    customer: body.customer,
    product: body.product,
    orderValue: Number(body.orderValue),
    channel: body.channel,
    orderDate: body.orderDate,
    status: body.status,
  }], "manual");
  return NextResponse.json(summary, { status: 201 });
}
