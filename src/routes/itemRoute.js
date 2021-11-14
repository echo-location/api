import { Router } from "express";
import models from "../models";
import { createItem } from "../utils/helpers/helpers";
import { validateParams } from "../middleware/validateParams";
import mongoose from "mongoose";

const router = Router();

// [GET] Retrieve all items
router.get(
  "/",
  validateParams([
    {
      param_key: "lost",
      required: false,
      type: "boolean",
      validator_functions: [],
    },
  ]),
  async (req, res, next) => {
    const queries = req.query;
    console.log(queries);
    let items;
    if (Object.keys(queries).length === 0)
      items = await models.Item.find().catch(next);
    else items = await models.Item.find({ lost: queries.lost }).catch(next);
    res.json({ message: "Collecting all ITEMS!", items: items });
  }
);

// [POST] Create a new item
router.post(
  "/create",
  validateParams([
    {
      param_key: "uid",
      required: true,
      type: "string",
      validator_functions: [(param) => mongoose.Types.ObjectId.isValid(param)],
    },
  ]),
  async (req, res, next) => {
    const queries = req.query;
    console.log(queries);

    // verifying uid
    const userExists = await models.User.exists({ _id: queries.uid });
    if (!userExists) {
      res.status(404).json({
        message: "Uh oh! This user does not exist!",
        uid: queries.uid,
      });
    }

    // create item
    const item = Object.assign(req.body, { user: queries.uid });

    const newItem = await createItem(queries.uid, item);
    await newItem.save();
    res.status(201).json({
      message: "Creating an item!",
      user: newItem,
    });
    return newItem;
  }
);

// [PUT] Update an existing item
router.put("/:id", async (req, res, next) => {
  const { id: _id } = req.params;

  // [TODO] should only support these
  const { name, description, date, location, found } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(500).json({ message: "Invalid User Object ID!" });

  const exist = await models.User.exists({ _id: _id }).catch(next);
  if (!exist)
    return res.status(404).json({ message: "Can't find specified User." });

  const item = await models.Item.findByIdAndUpdate(
    _id,
    { $set: req.body },
    (error, newItem) => {
      if (error) {
        res.status(500).json({
          message: "Failed to update board.",
          newItem,
          success: false,
        });
      } else {
        res.json({ message: "Updating a Item by ID!", newItem, success: true });
      }
    }
  );
  return item;
});

export default router;
