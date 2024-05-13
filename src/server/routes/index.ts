import { Router } from "express";
import { clientRoutes } from "./clients";

const router = Router();

router.use("/clients", clientRoutes);

export const baseRouter = router;
