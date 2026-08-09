import { Router, type IRouter } from "express";
import healthRouter from "./health";
import connectionsRouter from "./connections";
import importsRouter from "./imports";
import activityRouter from "./activity";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(connectionsRouter);
router.use(importsRouter);
router.use(activityRouter);
router.use(webhooksRouter);

export default router;
