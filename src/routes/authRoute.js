import { Router } from "express";
// import passport from "passport";
// import { genPassword } from "../utils/helpers/passwordUtils";
import models from "../models";
import util from "util";

// import mongoose from "mongoose";

const router = Router();

/*router.get("/logout", (req, res, next) => {
  req.logout();
  return res.redirect("/protected-route");
});
*/

/*router.post("/login", async (req, res, next) => {

});*/

router.post('/register', async (req, res) => {
  console.log(`Posted to register: ${util.inspect(req.body, false, null, true)}`);
  console.log(typeof (req.body.password), req.body.password);
  const { salt, hash } = genPassword(req.body.password); // pw is already hashed, create salt and 2nd hash from it
  const existingUser = await models.User.findOne({ username: req.body.username });
  if (!existingUser) {
    try {
      await models.User.create(new models.User({
        username: req.body.username,
        email: req.body.email,
        hash: hash,
        salt: salt,
      }));
      // newUser.save().then((user) => console.log(user));
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "There was an error with creating a user!",
      });
    }
    return res.status(201).json({ message: "User created.", success: true, });
  } else {
    return res.status(409).json({
      message: "Username taken.",
      success: false,
    });
  }
});

export default router;
