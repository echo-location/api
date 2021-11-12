import { Router } from "express";
import models from "../models";
const router = Router();

// [GET] Retrieve all items
router.get("/", async (req, res, next) => {
  const items = await models.Item.find().catch(next);
  console.log(items);
  res.json({ message: "Collecting all ITEMS!", items: items });
});

router.get("/lost", async (req, res, next) => {
  const items = await models.Item.find({ lost: true }).catch(next);
  console.log(items);
  res.json({ message: "Collecting lost ITEMS!", items: items });
});

export default router;
