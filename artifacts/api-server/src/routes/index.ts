import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import streaksRouter from "./streaks";
import progressRouter from "./progress";
import vocabularyRouter from "./vocabulary";
import contactRouter from "./contact";
import aiRouter from "./ai";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(streaksRouter);
router.use(progressRouter);
router.use(vocabularyRouter);
router.use(contactRouter);
router.use(aiRouter);
router.use(adminRouter);

export default router;
