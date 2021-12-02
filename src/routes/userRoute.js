import { Router } from "express";
import models from "../models";
import mongoose from "mongoose";
import { validateBody } from "../middleware/validateRequestBody";

const router = Router();

// [GET] Retrieve all users
router.get("/", async (req, res, next) => {
  const users = await models.User.find().catch(next);
  console.log(users);
  return res.json({
    message: "Collecting all USERS!",
    users: users,
    success: true,
  });
});

router.get("/email/:email", async (req, res, next) => {
  const user = await models.User.findOne({ email: req.params.email }).catch(next);
  if (user)
    return res.json({
      message: "Found user.",
      user: user,
      success: true,
    });
  return res.status(404).json({
    message: "Found no user.",
    success: false,
  });
});

// [GET] Retrieve specific user
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res
      .status(500)
      .json({ message: "Invalid User Object ID!", success: false });

  const user = await models.User.find({ _id: req.params.id }).catch(next);
  console.log(user);
  return res.json({
    message: "Searching a USER by ID!",
    id: req.params.id,
    user: user,
    success: true,
  });
});

/*
// [POST] Create a new user
router.post("/", async (req, res, next) => {
  //  await mongoose.collection.db.dropCollection('User');
  // console.log(req.body);
  // return;
  try {
    const newUser = await models.User.create(
      new models.User({
        username: req.body.username,
        // email: Math.random().toString(),
      })
    );
    if (newUser) {
      console.info("[INFO]: New user added to database.", newUser);
      // newUser.save();
      return res
        .status(201)
        .json({ message: "Creating a USER!", user: newUser, success: true });
    }
    return res.status(500).json({
      message: "There was an error with creating a user!",
      success: false,
    });
  } catch (err) {
    if (err.code === 11000) {
      // console.log(err.index, err.code, err.keyPattern, err.keyValue);
      return res
        .status(400)
        .json({ message: "Username already taken.", success: false });
    }
    return res.status(500).json({
      error: err,
      message: "There was an error with creating a user!",
      success: false,
    });
  }
});
*/

// [PUT] Update a user's properties (by ID)
router.put(
  "/:id",
  validateBody([
    { field_key: "username", type: "string" },
    { field_key: "phone", type: "string" },
    { field_key: "email", type: "string" },
  ]),
  async (req, res, next) => {
    const { id: _id } = req.params;
    // const { username, phone, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id))
      return res
        .status(500)
        .json({ message: "Invalid User Object ID!", success: false });

    const exist = await models.User.exists({ _id: _id }).catch(next);
    if (!exist)
      return res
        .status(404)
        .json({ message: "Can't find specified User.", success: false });
    try {
      const newUser = await models.User.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      if (!newUser) {
        return res.status(404).json({
          message: "User not found.",
          newUser,
          success: false,
        });
      }
      return res.json({
        message: "Updating a USER by ID!",
        newUser,
        success: true,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Failed to update user.",
        // newUser,
        error: err,
        success: false,
      });
    }
  }
);

// [DELETE] Delete a user
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res
      .status(500)
      .json({ message: "Invalid User Object ID!", success: false });

  const user = await models.User.deleteOne({ _id: req.params.id }).catch(next);
  console.log(await models.Item.find({ user: req.params.id }));
  const item = await models.Item.deleteMany({ user: req.params.id }).catch(
    next
  );

  return res.status(204).json({
    message: "Deleting a USER by ID!",
    user: user,
    item: item,
    success: true,
  });
});

export default router;
