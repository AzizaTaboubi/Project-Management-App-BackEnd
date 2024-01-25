import express from "express";
import {
  getAll,
  getById,
  getByUserID,
  updateOnce,
  addOnce,
  deleteOnce,
} from '../controllers/meetController.js';
import { body } from "express-validator";
const router = express.Router();


router
  .route("/meet")
  .get(getAll)
  .post(
    body("Day").isNumeric(),
    body("Year").isNumeric(),
    body("Month").isNumeric(),
    addOnce
  );
router.route("/meet/user/:userID").get(getByUserID);
router.route("/:id").get(getById).delete(deleteOnce);

router.route("/update/:ID").put(updateOnce);


export default router;