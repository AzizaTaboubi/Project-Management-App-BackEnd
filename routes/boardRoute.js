import express from "express";
import {
  getAll,
  getById,
  getByIdUsers,
  updateOnce,
  addOnce,
  deleteOnce,
  getByUserID
} from '../controllers/boardContoller.js';

import { body } from "express-validator";
const router = express.Router();


router
  .route("/boards")
  .get(getAll)
  .post(
    body("Name").isLength({ min: 5 }),
    addOnce
  );

router.route("/boards/:id").get(getById).delete(deleteOnce);
router.route("/boards/user/:id").get(getByUserID);
router.route("/boards/getusers/:id").get(getByIdUsers);
router.route("/boards/update/:id").put(updateOnce);

export default router;




















//export default router;