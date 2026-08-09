import { Router, type IRouter } from "express";
import { ListSyncActivityResponse } from "@workspace/api-zod";
import { resolveOrganizationId } from "../lib/tenant";
import { activityFor } from "./connections";

const router: IRouter = Router();

router.get("/activity", async (req, res): Promise<void> => {
  const organizationId = await resolveOrganizationId(req);
  res.json(ListSyncActivityResponse.parse(await activityFor(organizationId)));
});

export default router;