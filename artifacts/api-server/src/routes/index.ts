import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import streaksRouter from "./streaks";
import progressRouter from "./progress";
import vocabularyRouter from "./vocabulary";
import contactRouter from "./contact";
import aiRouter from "./ai";
import practiceAiRouter from "./practiceAi";
import adminRouter from "./admin";
import subscriptionRouter from "./subscription";
import stripeRouter from "./stripe";
import revenuecatWebhookRouter from "./revenuecatWebhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(streaksRouter);
router.use(progressRouter);
router.use(vocabularyRouter);
router.use(contactRouter);
router.use(aiRouter);
router.use(practiceAiRouter);
router.use(adminRouter);
router.use(subscriptionRouter);
router.use(stripeRouter);
router.use("/revenuecat/webhook", revenuecatWebhookRouter);

export default router;
