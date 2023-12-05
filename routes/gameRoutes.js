import express from "express";
import {
  getAll,
  getById,
  updateOnce,
  addOnce,
  deleteOnce,
} from "../controllers/gameController.js";
import { body } from "express-validator";
import multer from "../middlewares/multer-config.js";

const router = express.Router();

router
  .route("/")
  .get(getAll)
  .post(
    multer,
    body("Name").isLength({ min: 5 }),
    body("Year").isNumeric(),
    addOnce
  );

router.route("/:id").get(getById).delete(deleteOnce);

router.route("/update/:ID").put(updateOnce);

export default router;
