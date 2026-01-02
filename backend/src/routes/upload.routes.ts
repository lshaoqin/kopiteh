import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
router.post("/uploads/presign", authenticateToken, UploadController.presign);
export default router;
