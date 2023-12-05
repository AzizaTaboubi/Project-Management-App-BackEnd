import express from "express";
import {
  getAll,
  getById,
  updateOnce,
  addOnce,
  deleteOnce,
  getByUserID,
}  from '../controllers/workspaceController.js';
import { body } from "express-validator";
const router = express.Router();

router
  .route("/workspaces")
  .get(getAll)
  .post(
    body("Name").isLength({ min: 5 }),
    addOnce
  );

router.route("/workspaces/:id").get(getById).delete(deleteOnce);
router.route("/workspaces/user/:userID").get(getByUserID);
router.route("/workspaces/update/:ID").put(updateOnce);


export default router;
