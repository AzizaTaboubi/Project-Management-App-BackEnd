import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
import hbs from 'nodemailer-express-handlebars'
import { validationResult } from "express-validator";
import * as dotenv from 'dotenv'
import passport from 'passport'










export async function addOnce(req, res) {
  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ errors: validationResult(req).array() });
  } else {
    User.create({
      fullname: req.body.fullname,
      // facon dynamique bech tkhabi lien el image : req.protocol = http , req host = localhost 
      image: `${req.protocol}://${req.get("host")}${process.env.IMGURL1}/${req.file.filename
        }`,
      email: req.body.email,
      password: req.body.password,
    })
      .then((docs) => {
        res.status(200).json(docs);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
}


//Add User

export async function register(req, res) {
  const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  try {
    const { fullname, email, password } = req.body


    console.log(fullname, email)

    if (!(
      fullname &&
      email &&
      password
    )) {
      console.log("inputs required")
      return res.status(400).send({ message: 'Required Inputs' })
    }

    if (emailValid.test(email) == false) {
      console.log("email invalid")
      return res.status(400).send({ message: 'email invalid' })
    }

    //checking the existance of user
    if (await User.findOne({ email })) {
      return res.status(403).send({ message: "User already exists !" })
    } else {

      let user = new User({
        fullname,

        image: `${req.protocol}://${req.get("host")}${process.env.IMGURL1}/${req.file.filename
          }`,
        email,
        password: await bcrypt.hash(password, 10),
        otp: parseInt(Math.random() * 10000),
      })
      user.save()
        .then(user => {
          sendEmailtest(user.email, user.otp)
          return res.json({
            message: 'User added successfully!'
          })
        })
        .catch(error => {
          return res.json({
            message: 'An error occured!'
          })
        })
    }
    //res.send(user)
  } catch (err) {
    console.log(err)
    return res.send(err)
  }
}


//Login
export async function login(req, res) {
  const { email, password } = req.body
  if (!(email && password)) {
    res.status(400).send('Inputs required')
  }

  const user = await User.findOne({ email })

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, 'token');
    return res.status(200).send({ user, token, message: 'Success' })

  } else {
    return res.status(403).send({ message: 'Wrong email or password' })
  }
}

// Logout
export async function logout(req, res) {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send({ message: 'Error logging out' });
        } else {
          return res.status(200).send({ message: 'Logged out successfully' });
        }
      });
    } else {
      return res.status(200).send({ message: 'Already logged out' });
    }
  } catch (err) {
    console.error('Error logging out:', err);
    return res.status(500).send({ message: 'Error logging out' });
  }
}


//Show the list of Users

export function index(req, res, next) {
  User.find()
    .then(response => {
      res.json({
        response
      })
    })
    .catch(error => {
      res.json({
        message: 'An error occured. '
      })
    })
}

// Show single user
/*export async function show (req, res, next ) {
    let userID = req.body._id  
    let token = req.body.token
   let user = await User.findOne(token)
    .then(response => {
      return response.send({ message: "Success", user })
    })
    .catch(error => {
        res.json()
        message: 'An error occured'
    })

}*/

//const jwt = require('jsonwebtoken');

function getUserIdFromToken(token) {
  try {
    const decoded = jwt.verify(token, 'token');
    return decoded.userId;
  } catch (error) {
    // Token verification failed
    return null;
  }
}

export async function getuser(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const userId = getUserIdFromToken(token);

    if (userId) {
      const user = await User.findById(userId);

      if (user) {
        res.json({ message: 'Success', user });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
}




// Update User

export async function updateProfile(req, res) {
  try {
    const { fullname, email, password } = req.body;

    let user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          email,
          fullname,
          password: await bcrypt.hash(password, 10),
          /* image: `${req.protocol}://${req.get("host")}${process.env.IMGURL1}/${
            req.file.filename
          }`,*/
        },
      },
      { new: true } // Return the updated user object
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.send({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).send({ message: "Error updating profile" });
  }
}




//update image
export async function updateImage(req, res) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        image: `${req.protocol}://${req.get("host")}${process.env.IMGURL1}/${req.file.filename
          }`,
      },
      { new: true } // return the updated user object
    );

    // save the updated user object
    await user.save();

    res.json({ message: "Image uploaded successfully", imageUrl: `http://localhost:9095/pdp/${req.file.filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}


// Delete a user

export async function deletee(req, res) {
  let user = await User.findById(req.body._id)
  if (user) {
    await user.remove()
    return res.send({ message: "User" + user._id + " has been deleted" })
  } else {
    return res.status(404).send({ message: "User does not exist" })
  }
}



// Delete all 

export async function deleteAll(req, res) {
  await User.remove({})
  res.send({ message: "All users have been deleted" })
}



//Update pwd 
export async function updatePassword(req, res) {
  const { email, newPassword } = req.body

  if (newPassword) {
    newPasswordEncrypted = await bcrypt.hash(newPassword, 10)

    let user = await user.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password: newPasswordEncrypted,
        },
      }
    )

    return res.send({ message: "Password updated successfully", user })
  } else {
    return res.status(403).send({ message: "Password should not be empty" })
  }
}


//send confirmation mail 

export async function sendConfirmationEmail(req, res) {
  //finding the user mail
  const user = await User.findOne({ email: req.body.email.toLowerCase() })
  //generating token
  if (user) {
    let token = ({
      userId: user._id,
      token: jwt.sign(
        { user },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1H' },
      ),
    })
    //sending mail
    await doSendConfirmationEmail(req.body.email, token.token)

    res.status(200).send({
      message: "Mail de confirmation a ete envoye à" + user.email,
    })
  } else {
    res.status(404).send({ message: 'User innexistant' })
  }
}

async function doSendConfirmationEmail(email, token) {
  let port = process.env.PORT || 9090

  sendEmail({
    from: process.env.savy_mail,
    to: email,
    subject: 'Confirm your email',
    template: 'email',
    context: {
      port: port,
      token: token
    }
  })
}

function sendEmail(mailOptions) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.savy_mail,
      pass: process.env.savy_password,
    },
  })
  const handlebarOptions = {
    viewEngine: {
      extName: ".html",
      partialsDir: path.resolve('./views'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views'),
    extName: ".html",
  }
  transporter.use('compile', hbs(handlebarOptions))

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error)
      console.log('Server not ready')
    } else {
      console.log('Server is ready to take our messages')
    }
  })

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

export async function confirmation(req, res) {
  if (req.params.token) {
    try {
      let token = jwt.verify(req.params.token, process.env.ACCESS_TOKEN_SECRET)
      console.log(token.user._id);
    } catch (err) {
      return res.status(200).json({ "error": "erreur" })
    }
  } else {
    return res.status(200).json({ "error": "erreur" })
  }
  let token = jwt.verify(req.params.token, process.env.ACCESS_TOKEN_SECRET)
  console.log(token);
  User.findById(token.user._id, function (err, user) {
    if (!user) {
      return res.status(200).json({ "error": "user does Not Exist" })
    } else if (user.verified) {
      return res.status(200).json({ "error": "user alerady verified" })
    } else {
      user.verified = true
      user.save(function (err) {
        if (err) {
          return res.status(400).json({ "error": "erreur" })
        } else {
          return res.status(200).json({ "success": "user verified" })
        }
      })
    }
  })
}


//FORGOT PASSWORD

export async function forgotPassword(req, res) {
  let OTP = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false })
  const user = await User.findOneAndUpdate({ email: req.body.email }, { otp: OTP })
  if (user) {
    sendEmailtest(req.body.email, OTP)
    res.status(200).send({
      message: "L'email de reinitialisation a été envoyé a " + user.email,
    })
  } else {
    res.status(404).send({ message: "User innexistant" })
  }
}
async function sendOTP(email) {
  const user = await User.findOne({ email: email })
  sendEmailOTP({
    from: process.env.savy_mail,
    to: email,
    subject: "Password reset",
    template: 'otp',
    context: {
      OTP: user.otp
    }
  })
}
function sendEmailOTP(mailOptions) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.savy_mail,
      pass: process.env.savy_password,
    },
  })
  const handlebarOptions = {
    viewEngine: {
      extName: ".html",
      partialsDir: path.resolve('./views'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views'),
    extName: ".html",
  }
  transporter.use('compile', hbs(handlebarOptions))
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error)
      console.log("Server not ready")
    } else {
      console.log("Server is ready to take our messages")
    }
  })

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log("Email sent: " + info.response)
    }
  })
}

export async function confirmationOTP(req, res) {
  const user = await User.findOne({ otp: req.body.otp })
  if (user) {
    res.status(200).json({ "message": "success" })
  } else {
    res.status(400).json({ "error": "error" })
  }
}

export async function confirmationOTP1(req, res) {
  const user = await User.findOne({ email: req.body.email, otp: req.body.otp })
  if (user) {
    res.status(200).json({ "message": "success" })
  } else {
    res.status(400).json({ "error": "error" })
  }
}
export async function resetPassword(req, res) {
  const email = req.body.email
  const newPass = req.body.newPass
  console.log("newPass = ", newPass)
  const otp = req.body.otp
  const user = await User.findOne({ email: email, otp: otp })
  if (user) {
    user.password = await bcrypt.hash(newPass, 10)
    user.save().then(() => {
      res.status(200).json({ "message": "user password changed" })
    }).catch(() => {
      res.status(400).json({ "error": "error" })
    })
  } else {
    res.status(400).json({ "error": "error" })
  }
}


///// FUNCTIONS ---------------------------------------------------------

function generateUserToken(user) {
  return jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "100000000",// in Milliseconds (3600000 = 1 hour)
  })
}

const sendEmailtest = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'savysy22@gmail.com',
      pass: 'elakojhhgycdbwuq' //Savy12345
    }
  });

  const mailOptions = {
    from: 'Esprit\'s Shelf',
    to: email,
    subject: 'Reset your password',
    text: `Here is your four digit code that will allow you to reset your password: ${otp}`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      // do something useful
    }
  });
}



