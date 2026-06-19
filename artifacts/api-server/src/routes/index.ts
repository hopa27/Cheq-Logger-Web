import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import accountsRouter from "./accounts";
import departmentsRouter from "./departments";
import chequesRouter from "./cheques";
import reportsRouter from "./reports";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(accountsRouter);
router.use(departmentsRouter);
router.use(chequesRouter);
router.use(reportsRouter);
router.use(dashboardRouter);

export default router;
