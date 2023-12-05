import express from 'express'
const router = express.Router()
import passport from 'passport'
import { body } from "express-validator";
import multer from "../middlewares/multer-config.js";
import * as UserController from '../controllers/userController.js'


router.get('/', UserController.index)
//router.post('/user', UserController.show)
router.post('/userget', UserController.getuser)
router.post('/login', UserController.login)
router.post('/logout', UserController.logout);
router.route("/register").post(
  multer,
  UserController.register)
router.post('/signup',
  multer,
  body("fullname").isLength({ min: 5 }),
  body("email").isEmail,
  body("password").isStrongPassword,
  UserController.addOnce
);
router.post('/update', UserController.updateProfile)
router.delete('/delete/{_id}', UserController.deletee)
router.post("/send-confirmation-email", UserController.sendConfirmationEmail)
router.get("/confirmation/:token", UserController.confirmation)
router.post('/forgotPassword', UserController.forgotPassword)
router.post("/confirmationOtp", UserController.confirmationOTP)
//router.post("/confirmationOtp1",UserController.confirmationOTP1)
router.post("/resetPassword", UserController.resetPassword)


export default router