import { Router, type IRouter } from "express";
import {
  CreateManualImportBody,
  CreateManualImportResponse,
  ImportCsvRowsBody,
  ImportCsvRowsResponse,
} from "@workspace/api-zod";
import { resolveOrganizationId } from "../lib/tenant";
import {
  importNormalizedRows,
  normalizeRevenueRow,
} from "../lib/revenue-data";

const router: IRouter = Router();

router.post("/imports/manual", async (req, res): Promise<void> => {
  const parsed = CreateManualImportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const summary = await importNormalizedRows(
    organizationId,
    [
      {
        customer: parsed.data.customer,
        product: parsed.data.product,
        orderValue: parsed.data.orderValue,
        channel: parsed.data.channel,
        orderDate: parsed.data.orderDate,
        status: parsed.data.status,
      },
    ],
    "manual",
  );
  res.status(201).json(CreateManualImportResponse.parse(summary));
});

router.post("/imports/csv", async (req, res): Promise<void> => {
  const parsed = ImportCsvRowsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const organizationId = await resolveOrganizationId(req);
  const rows = parsed.data.rows.map((row) =>
    normalizeRevenueRow(row, parsed.data.mappings),
  );
  const summary = await importNormalizedRows(organizationId, rows, "csv");
  res.status(201).json(ImportCsvRowsResponse.parse(summary));
});

export default router;