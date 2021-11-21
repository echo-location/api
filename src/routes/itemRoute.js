import { Router } from "express";
import mongoose from "mongoose";
import multiparty from "multiparty";
import FileType from "file-type";
import fs from "fs";

import models from "../models";
import { createItem } from "../utils/helpers/helpers";
import { getCoords } from "../utils/helpers/gcp";
import { uploadFile } from "../utils/helpers/s3";
import { isDateValid } from "../utils/helpers/validDateString";
import { validateParams } from "../middleware/validateParams";

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

router.get("/search",
  validateParams([
    {
      param_key: "q",
      // required: false,
      type: "string",
      // validator_functions: [],
    }, {
      param_key: "lost",
      // required: false,
      type: "boolean",
      // validator_functions: [],
    }, {
      param_key: "start_date",
      // required: false,
      type: "string",
      // validator_functions: [(param) => isDateValid(param)],
    }, {
      param_key: "end_date",
      //required: false,
      type: "string",
      validator_functions: [(param) => isDateValid(param)],
    }, {
      param_key: "photo",
      required: false,
      type: "boolean",
      validator_functions: [],
    },
  ]),
  async (req, res, next) => {
    const queries = req.query;
    console.log(queries);
    let searchFilters = {};
    // TODO add to Search Filter, maybe need to change validateParams to only accept params in array
    // or need an array like below
    for (const param in queries) {
      if (param === "q") {
        searchFilters.name = {}; // $text/search https://docs.mongodb.com/manual/reference/operator/query/text/
      } else if (param === 'lost') {
        searchFilters.lost = queries.lost; // queries['lost']
      } else if (param === 'photo') {
        searchFilters.photo = { $regex: /./ }; // > 0 char // $exists: true,
      } else if (param === 'start_date') {
        if (searchFilters.date === undefined) {
          searchFilters.date = {};
        }
        searchFilters.date.$gte = queries.start_date;
      } else if (param === 'end_date') {
        if (searchFilters.date === undefined) {
          searchFilters.date = {};
        }
        searchFilters.date.$lte = queries.end_date;
      } // else {}
    }

    let items = await models.Item.find(searchFilters).catch(next); // .where() maybe?
    res.json({ message: "Searched for items!", items: items });
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

    // verifying uid
    const userExists = await models.User.exists({ _id: queries.uid });
    if (!userExists) {
      res.status(404).json({
        message: "Uh oh! This user does not exist!",
        uid: queries.uid,
      });
    }

    // parse multipart form
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        return res.status(500).json({
          error: error,
          message: "There was an error with parsing the query!",
        });
      }
      try {
        const params = JSON.parse(fields.json[0]);

        // lookup coordinates
        const coords = await getCoords(params.location);
        const meta = Object.assign({}, coords);

        let item = Object.assign(params, {
          user: queries.uid,
          meta: meta,
        });
        let imageData = null;
        if ("file" in files) {
          // lookup image if passed
          const path = files.file[0].path;
          const buffer = fs.readFileSync(path);
          const type = await FileType.fromBuffer(buffer);
          const fileName = `${queries.uid}_${Date.now().toString()}`;
          imageData = await uploadFile(buffer, fileName, type);
          item = Object.assign(item, {
            photo: `https://echo-location.s3.us-east-1.amazonaws.com/${fileName}.${type.ext}`,
          });
        }

        const newItem = await createItem(queries.uid, item);
        await newItem.save();

        res.status(201).json({
          message: "Creating an item!",
          data: imageData || null,
          user: newItem,
        });
        return newItem;
      } catch (err) {
        return res.status(500).json({
          error: error,
          message: "There was an error with creating an item!",
        });
      }
    });
  }
);

// [PUT] Update an existing item
router.put("/:id", async (req, res, next) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(500).json({ message: "Invalid User Object ID!" });

  /**
   * This checks User ID but query below expects an Item ID.
   * const exist = await models.User.exists({ _id: _id }).catch(next);
   * if (!exist)
   *  return res.status(404).json({ message: "Can't find specified User." });
   */

  let newFields = {};
  const allowedFields = ["name", "description", "date", "location", "lost"];
  let acceptedFieldsPresent = false;
  for (let i = 0; i < allowedFields.length; i++) {
    if (req.body.hasOwnProperty(allowedFields[i])) {
      newFields[allowedFields[i]] = req.body[allowedFields[i]];
      acceptedFieldsPresent = true;
    }
  }
  if (!acceptedFieldsPresent) {
    return res.status(400).json({
      message: "No valid fields found.",
      success: false,
    });
  }

  /**
   * callback way
   * 
   * const item = models.Item.findByIdAndUpdate(
   *   _id,
   *   newFields,
   *   { new: true, },
   *   (error, newItem) => { // https://mongoosejs.com/docs/queries.html#queries-are-not-promises
   *     // console.log(error, newItem);
   *     if (!newItem || error) {
   *       res.status(500).json({
   *         message: "Failed to update item.",
   *         newItem,
   *         success: false,
   *       });
   *     } else {
   *       res.json({ message: "Updating a Item by ID!", newItem, success: true });
   *     }
   *   }
   * );
   *  // return item; // calls query again = 3rd time if that was possible.
   */

  try {
    const newItem = await models.Item.findByIdAndUpdate(_id, newFields, { new: true, });
    if (!newItem) {
      return res.status(404).json({
        message: "Item Not Found.", newItem, success: false,
      });
    }
    return res.json({ message: "Updating an Item by ID!", newItem, success: true });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update item.",
      newItem,
      success: false,
    });
  }
});

// [PUT] Update an image
router.put("/:id/upload", async (req, res, next) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(500).json({ message: "Invalid User Object ID!" });

  const exist = await models.User.exists({ _id: _id }).catch(next);
  if (!exist)
    return res.status(404).json({ message: "Can't find specified User." });

  async (req, res, next) => {
    const queries = req.query;

    // verifying uid
    const userExists = await models.User.exists({ _id: queries.uid });
    if (!userExists) {
      res.status(404).json({
        message: "Uh oh! This user does not exist!",
        uid: queries.uid,
      });
    }

    // parse multipart form
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        return res.status(500).json({
          error: error,
          message: "There was an error with parsing the query!",
        });
      }
      try {
        if (!("file" in files))
          return res.status(500).json({
            error: error,
            message: "No image data found in request body!",
          });

        // lookup image if passed
        const path = files.file[0].path;
        const buffer = fs.readFileSync(path);
        const type = await FileType.fromBuffer(buffer);
        const fileName = `${queries.uid}_${Date.now().toString()}`;
        const imageData = await uploadFile(buffer, fileName, type);

        const newItem = await models.Item.findByIdAndUpdate(
          _id,
          {
            // $set: { // not needed
            photo: `https://echo-location.s3.us-east-1.amazonaws.com/${fileName}.${type.ext}`,
            // },
          },
          { new: true, });

        if (!newItem) {
          res.status(404).json({
            message: "Item Not Found.",
            newItem,
            success: false,
          });
        } else {
          res.json({
            message: "Updating an Item by ID!",
            newItem,
            success: true,
          });
        }
      } catch (err) {
        return res.status(500).json({
          error: err,
          message: "There was an error with updating an item!",
        });
      }
    });
  };
});

export default router;
