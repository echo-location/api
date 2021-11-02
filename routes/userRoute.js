import { Router } from "express";
import models from "../models";
import mongoose from "mongoose";
const router = Router();

// [GET] Retrieve all users
router.get("/", async (req, res, next) => {
  const users = await models.User.find().catch(next);
  console.log(users);
  res.json({ message: "Collecting all USERS!", users: users });
});

// [GET] Retrieve specific user
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(500).json({ message: "Invalid User Object ID!" });

  const user = await models.User.find({ _id: req.params.id }).catch(next);
  console.log(user);
  res.json({
    message: "Searching a USER by ID!",
    id: req.params.id,
    user: user,
  });
});

// [POST] Create a new user
router.post("/", async (req, res, next) => {
  console.log(req.body);
  return models.User.create(
    new models.User({
      username: req.body.username,
    })
  ).then((newUser) => {
    console.info("[INFO]: New user added to database.", newUser);
    newUser.save();
    res.json({ message: "Creating a USER!", user: newUser });
    return newUser;
  });
});

// [PUT] Update a user's properties (by ID)
router.put("/:id", async (req, res, next) => {
  const { id: _id } = req.params;
  const { username } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(500).json({ message: "Invalid User Object ID!" });

  const exist = await models.User.exists({ _id: _id }).catch(next);
  if (!exist)
    return res.status(404).json({ message: "Can't find specified User." });

  const user = await models.User.findByIdAndUpdate(
    _id,
    { $set: { username: username } },
    (error, newUser) => {
      if (error) {
        res.status(500).json({
          message: "Failed to update board.",
          newUser,
          success: false,
        });
      } else {
        res.json({ message: "Updating a USER by ID!", newUser, success: true });
      }
    }
  );
});

// [DELETE] Delete a user
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(500).json({ message: "Invalid User Object ID!" });

  const user = await models.User.deleteOne({ _id: req.params.id }).catch(next);
  res.status(204).json({ message: "Deleting a USER by ID!", user: user });
});

export default router;
