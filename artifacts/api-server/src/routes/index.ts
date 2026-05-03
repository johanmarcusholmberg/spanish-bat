import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import streaksRouter from "./streaks";
import progressRouter from "./progress";
import vocabularyRouter from "./vocabulary";
import contactRouter from "./contact";
import aiRouter from "./ai";
import practiceAiRouter from "./practiceAi";
import practiceItemsRouter from "./practiceItems";
import adminRouter from "./admin";
import subscriptionRouter from "./subscription";
import stripeRouter from "./stripe";
import revenuecatWebhookRouter from "./revenuecatWebhook";
import echoMemoryRouter from "./echoMemory";
import dailySessionsRouter from "./dailySessions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(streaksRouter);
router.use(progressRouter);
router.use(vocabularyRouter);
router.use(contactRouter);
router.use(aiRouter);
router.use(practiceAiRouter);
router.use(practiceItemsRouter);
router.use(adminRouter);
router.use(subscriptionRouter);
router.use(stripeRouter);
router.use("/revenuecat/webhook", revenuecatWebhookRouter);
router.use(echoMemoryRouter);
router.use(dailySessionsRouter);

export default router;
