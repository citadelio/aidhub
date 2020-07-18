const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const protectedRoute = require("../middleware/auth");
const passportSetup = require("../config/passport");

// Models
const UserModel = require("../models/User");
const Activation = require("../models/Activation");
const Reset = require("../models/PasswordReset");
//Send mail
const sendEmail = require("../middleware/sendEmail");
const activationEmailTemplate = require("../middleware/emails/activation");
const {
  makeTitleCase,
  createUsername,
  createUniqueid,
} = require("../middleware/helperFunctions");



/* LOCAL AUTHENTICATION */

router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      //Check if user exist
      let user = await UserModel.findOne({ email });

      if (!user) {
        return res.json({
          errors: [
            {
              statuscode: "E1",
              msg: "This email/password is incorrect",
            },
          ],
        });
      }

      if (user.authType == "local") {
        //compare passwords to see if it matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.json({
            errors: [
              {
                statuscode: "E1",
                msg: "This email/password is incorrect",
              },
            ],
          });
        }
        let token = jwt.sign({ userid: user.id }, process.env.jwtSecret, {
          expiresIn: 72000,
        });
        return res
          .status(200)
          .cookie("X-TOKEN", token, {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
          })
          .json({ token, statuscode: "S1" });
      } else {
        return res.json({
          errors: [
            {
              msg: `A ${makeTitleCase(
                user.authType
              )} account already exist with this email, Login with ${makeTitleCase(
                user.authType
              )} instead `,
            },
          ],
        });
      }
    } catch (err) {
      return res.json({
        errors: [
          {
            err,
            msg: "An error occurred, try again",
          },
        ],
      });
    }
  }
);

/*
# method       POST
# route         /auth/register
*/
router.post(
  "/register",
  [
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
    check("name").not().isEmpty(),
    check("phone").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    try {
      //Check for already existing email
      const existingUser = await UserModel.findOne({ email });
   
      if (existingUser) {
        if (existingUser.authType != "local") {
          return res.json({
            errors: [
              {
                msg: `A ${makeTitleCase(
                  existingUser.authType
                )} account already exist with this email, Login with ${makeTitleCase(
                  existingUser.authType
                )} instead `,
              },
            ],
          });
        } else {
          return res.json({
            errors: [
              {
                msg: "An account already exist with this email, Login instead",
              },
            ],
          });
        }
      }

      //Initialize a new User
      const user = new UserModel({
        name,
        email,
        phone,
        username: createUsername(name),
        uniqueid: createUniqueid(),
        password,
        authType: "local",
      });
  
      //Encrypt password
      let salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //Save new User
      user.save();
      //generate and save activation link
      const hash = crypto
        .createHmac("sha256", process.env.jwtSecret)
        .update(new Date().valueOf().toString())
        .digest("hex");
      //activation link expires in 3 hours
      let now = new Date();
      let expiry = now.setHours(now.getHours() + 3);

      const activationLink = new Activation({
        expiry,
        userid: user.id,
        code: hash,
      });

      activationLink.save();

      // send activation mail to user
      const from = `${process.env.SITE_DOMAIN} <activation@${process.env.SITE_DOMAIN}>`;
      const subject = `Verify your ${process.env.SITE_NAME} account`;
      const messageBody = activationEmailTemplate(user, activationLink);
      const verifyEmailSent = await sendEmail(
        from,
        user.email,
        subject,
        messageBody
      );

      // Generate token
      const token = jwt.sign({ userid: user.id }, process.env.jwtSecret, {
        expiresIn: 720000,
      });

      //return token
      return res.status(200).json({ token });
    } catch (err) {
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err,
          },
        ],
      });
    }
  }
);

router.get("/send-activation", protectedRoute, async (req, res) => {
  const userid = req.userid;
  try {
    const user = await UserModel.findById(userid);
    if (!user) {
      return res.json({ status: false });
    }

    //generate and save activation link
    const hash = crypto
      .createHmac("sha256", "random-secret")
      .update(new Date().valueOf().toString())
      .digest("hex");

    let now = new Date();
    let expiry = now.setHours(now.getHours() + 3);

    const activationLink = new Activation({
      expiry,
      userid: user.id,
      code: hash,
    });

    activationLink.save();

    //send activation mail to user
    const from = `${process.env.SITE_DOMAIN} <activation@${process.env.SITE_DOMAIN}>`;
    const subject = `Activate your ${process.env.SITE_NAME} account`;
    const messageBody = activationEmailTemplate(user, activationLink);
    const emailSent = await sendEmail(from, user.email, subject, messageBody);
    return res.status(200).json({ emailSent });
  } catch (err) {
    return res.json({
      errors: [
        {
          msg: "An error occurred, try again",
          err,
        },
      ],
    });
  }
});

router.get("/activate-account/:code", async (req, res) => {
  try {
    //check if code is still valid
    const activationDetails = await Activation.findOne({
      code: req.params.code,
    });
    if (!activationDetails) {
      return res.json({
        errors: [
          {
            msg: "Activation code is invalid",
          },
        ],
      });
    }

    if (new Date() > activationDetails.expiry) {
      return res.json({
        errors: [
          {
            msg: "Activation link is expired",
          },
        ],
      });
    }

    const userid = activationDetails.userid;
    const user = await UserModel.updateOne(
      { _id: userid },
      { activated: true }
    );
    if (user.n > 0) {
      //get User 
      const thisUser = await UserModel.findOne({ _id: userid })
      //send welcome mail
      const from = `"${process.env.SITE_DOMAIN}" <accounts@${process.env.SITE_DOMAIN}>`;
      const subject = `Welcome to ${process.env.SITE_NAME}`;
      const welcomeEmailTemplate = require("../middleware/Emails/welcome");
      const messageBody = welcomeEmailTemplate( thisUser);
      const emailSent = sendEmail(from, thisUser.email, subject, messageBody);
        //generate token
      const token = jwt.sign({ userid}, process.env.jwtSecret, {
        expiresIn: 720000,
      });

      //return token
      return res.status(201).json({ token, success: [{ msg: "Account activated" }] });
    } else {
      return res.json({
        errors: [
          {
            msg: "An error occured while activating account. Try again",
          },
        ],
      });
    }
  } catch (err) {
    return res.json({
      errors: [
        {
          msg: "An error occurred, try again",
          err,
        },
      ],
    });
  }
});

router.post(
  "/forgot-password",
  [check("email").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }

    try {
      //check if email exist
      let user = await UserModel.findOne({
        email: req.body.email,
        authType: "local",
      });
      if (!user) {
        return res.json({
          errors: [
            {
              msg: "This email does not exist on our database",
            },
          ],
        });
      }

      //generate and save reset link
      const hash = crypto
        .createHmac("sha256", "random-secret")
        .update(new Date().valueOf().toString())
        .digest("hex");

      let now = new Date();
      let expiry = now.setHours(now.getHours() + 1);

      const resetPasswordLink = new Reset({
        expiry,
        userid: user.id,
        email: req.body.email,
        code: hash,
      });

      const savedResetDetails = await resetPasswordLink.save();

      //send reset email to user
      const from = `"${process.env.SITE_DOMAIN}" <activation@${process.env.SITE_DOMAIN}>`;
      const subject = `Reset your ${process.env.SITE_NAME} password`;
      const resetPasswordEmailTemplate = require("../middleware/Emails/resetpassword");
      const messageBody = resetPasswordEmailTemplate(
        user,
        savedResetDetails,
        req.header("User-Agent")
      );
      const emailSent = sendEmail(from, user.email, subject, messageBody);

      return res
        .status(200)
        .json({ success: [{ msg: "Reset link sent to email" }] });
    } catch (err) {
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err,
          },
        ],
      });
    }
  }
);

router.get("/reset-password/:code", async (req, res) => {
  try {
    //check the code
    const resetDetails = await Reset.findOne({ code: req.params.code });
    if (!resetDetails) {
      return res.json({
        errors: [
          {
            msg: "Reset code is invalid",
          },
        ],
      });
    }
    return res.status(200).json({ success: [{ resetDetails }] });
  } catch (err) {
    return res.json({
      errors: [
        {
          msg: "An error occurred, try again",
          err,
        },
      ],
    });
  }
});

router.post(
  "/reset-password/:code",
  [
    check("password").not().isEmpty().isLength({ min: 6 }),
    check("confirmpassword").not().isEmpty().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }

    try {
      const resetDetails = await Reset.findOne({ code: req.params.code });
      if (!resetDetails) {
        return res.json({
          errors: [
            {
              msg: "Reset code is invalid",
            },
          ],
        });
      }

      const { password, confirmpassword } = req.body;
      //check if passwords match
      if (password !== confirmpassword) {
        return res.json({
          errors: [
            {
              msg: "Passwords do not match",
            },
          ],
        });
      }
      //Encrypt password
      let salt = await bcrypt.genSalt(10),
        hashedpassword = await bcrypt.hash(password, salt);
      //update user detail
      const updatedUser = await UserModel.updateOne(
        { _id: resetDetails.userid },
        {
          password: hashedpassword,
        }
      );
      if (updatedUser.n > 0) {
        res.status(200).json({
          success: [
            { msg: "Password has been changed, Kindly sign in to continue." },
          ],
        });
      } else {
        return res.json({
          errors: [
            {
              msg: "Couldn't update user details, Try again.",
            },
          ],
        });
      }
    } catch (err) {
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err,
          },
        ],
      });
    }
  }
);

router.post(
  "/change-password",
  [
    check("oldpassword").not().isEmpty().isLength({ min: 6 }),
    check("password").not().isEmpty().isLength({ min: 6 }),
    check("confirmpassword").not().isEmpty().isLength({ min: 6 }),
  ],
  protectedRoute,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }

    const userid = req.userid;
    const { oldpassword, password, confirmpassword } = req.body;
    // console.log(req.body);
    try {
      //get user's current password
      const user = await UserModel.findOne({ _id: userid, authType: "local" });
      // console.log(user)
      //check to see if old password is correct
      const comparePasswords = await bcrypt.compare(oldpassword, user.password);
      //  console.log(comparePasswords)
      if (!comparePasswords) {
        return res.json({
          errors: [
            {
              msg: "The password you entered is incorrect",
            },
          ],
        });
      }
      //check if passwords match
      if (password !== confirmpassword) {
        return res.json({
          errors: [
            {
              msg: "New passwords do not match",
            },
          ],
        });
      }
      //Encrypt password
      let salt = await bcrypt.genSalt(10),
        hashedpassword = await bcrypt.hash(password, salt);
      //update user detail
      const updatedUser = await UserModel.updateOne(
        { _id: userid },
        {
          password: hashedpassword,
        }
      );
      if (updatedUser.n > 0) {
        res.status(200).json({
          msg: "Password has been changed, successfully!",
          status: true,
        });
      } else {
        return res.json({
          errors: [
            {
              msg: "Couldn't update user details, Try again.",
            },
          ],
        });
      }
    } catch (err) {
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err,
          },
        ],
      });
    }
  }
);

module.exports = router;
