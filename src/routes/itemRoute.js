import { Router } from "express";
import mongoose from "mongoose";
import multiparty from "multiparty";
import FileType from "file-type";
import fs from "fs";

import models from "../models";
import { createItem } from "../utils/helpers/helpers";
import { getCoords } from "../utils/helpers/gcp";
import { uploadFile } from "../utils/helpers/s3";
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

const isDateValid = (dateString) => {
  const dateStringRegex = /^\d{4}-\d\d-\d\d$/
  if (dateStringRegex.test(dateString)) {
    let [year, month, day] = dateString.split('-');
    year = parseInt(year, 10);
    month = parseInt(month, 10);
    day = parseInt(day, 10);
    if (month > 0 && month < 13 && day > 0 && day < 32 && year >= 1969) { // UTC-N timezones' (eg PT) start year is in 1969
      // Make sure date is valid. eg. '2021-31-11' or Nov 31st is invalid
      // const date = new Date(dateString); // UTC but MDN discourages this parsing because it's inconsistent
      // const date = new Date(Date.UTC(year, month - 1, day)); // UTC
      const date = new Date(year, month - 1, day); // Local Time but at midnight so PT is
      if (date.getUTCDate() === day && date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year) {
        return true;
      }
    }
  }
  return false;
};

router.get("/search",
  validateParams([
    {
      param_key: "q",
      required: false,
      type: "string",
      validator_functions: [],
    }, {
      param_key: "lost",
      required: false,
      type: "boolean",
      validator_functions: [],
    }, {
      param_key: "start_date",
      required: false,
      type: "string",
      validator_functions: [(param) => isDateValid(param)],
    }, {
      param_key: "end_date",
      required: false,
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
        searchFilters.lost = queries[lost];
      } else if (param === 'photo') {
        searchFilters.photo = { $regex: /./ }; // > 0 char // $exists: true,
      } else if (param === 'start_date') {
        if (searchFilters.date === undefined) {
          searchFilters.date = {};
        }
        searchFilters[date][$gte] = queries.start_date;
      } else if (param === 'end_date') {
        if (searchFilters.date === undefined) {
          searchFilters.date = {};
        }
        searchFilters[date][$lte] = queries.end_date;
      } //else {}
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

  const exist = await models.User.exists({ _id: _id }).catch(next);
  if (!exist)
    return res.status(404).json({ message: "Can't find specified User." });

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

  const item = await models.Item.findByIdAndUpdate(
    _id,
    { $set: newFields },
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

        const item = await models.Item.findByIdAndUpdate(
          _id,
          {
            $set: {
              photo: `https://echo-location.s3.us-east-1.amazonaws.com/${fileName}.${type.ext}`,
            },
          },
          (error, newItem) => {
            if (error) {
              res.status(500).json({
                message: "Failed to update board.",
                newItem,
                success: false,
              });
            } else {
              res.json({
                message: "Updating a Item by ID!",
                newItem,
                success: true,
              });
            }
          }
        );
        return item;
      } catch (err) {
        return res.status(500).json({
          error: error,
          message: "There was an error with updating an item!",
        });
      }
    });
  };
});

export default router;
