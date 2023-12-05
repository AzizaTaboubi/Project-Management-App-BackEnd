import express from "express";
import {
  getAll,
  getById,
  updateOnce,
  addOnce,
  deleteOnce,
  getByIdUsers,
  getByUserID
} from '../controllers/cardController.js';
import { body } from "express-validator";
import multer from "../middlewares/multer1.js";
const router = express.Router();


router
  .route("/cards")
  .get(getAll)
  .post(
    multer,
    body("Name").isLength({ min: 5 }),
    addOnce
  );

router.route("/cards/:id").get(getById).delete(deleteOnce);
router.route("/cards/getusers/:id").get(getByIdUsers);
router.route("/cards/update/:id").put(updateOnce);
router.route("/cards/user/:id").get(getByUserID);


export default router;