import { Router } from "express";
import { employeeController } from "../controllers/employeeController";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  validateEmployeeBody,
  validateId,
  validateListQuery,
} from "../middleware/validateEmployee";

const router = Router();

router.get("/", validateListQuery, asyncHandler(employeeController.list));
router.post("/", validateEmployeeBody, asyncHandler(employeeController.create));
router.put("/:id", validateId, validateEmployeeBody, asyncHandler(employeeController.update));
router.delete("/:id", validateId, asyncHandler(employeeController.remove));

export default router;
