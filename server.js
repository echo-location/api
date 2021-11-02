import app from "./app";
import models, { connectDB } from "./models";

connectDB().then(async () => {
  if (process.env.ENABLE_SANDBOX) {
    await Promise.all([models.User.deleteMany({}), models.Item.deleteMany({})]);
    repopulate();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}!`)
  );
});

const createUser = async (user) => {
  return models.User.create(user).then((newUser) => {
    console.info("[INFO]: New user added to database.", newUser);
    return newUser;
  });
};

const createItem = async (userID, item) => {
  // Adopt normalization to item instead of embedding (see: Mongoose's one-to-many)
  // +: Flexibility for manipulation, mutually exclusive.
  return models.Item.create(item).then((newItem) => {
    console.info("[INFO]: New item added to database.", newItem);

    return models.User.findByIdAndUpdate(
      userID,
      { $push: { items: newItem._id } },
      { new: true, useFindAndModify: false }
    );
  });
};

const repopulate = async () => {
  const u1 = await createUser({
    username: "jdoe",
  });

  const u2 = await createUser({
    username: "beilish",
  });

  const i1 = await createItem(u1._id, {
    name: "apple",
    description: "A glorious fruit.",
    location: "An apple tree.",
    user: u1,
  });

  const i2 = await createItem(u2._id, {
    name: "banana",
    description: "A disgusting fruit.",
    location: "Who knows?",
    user: u2,
  });
  {
  }

  const i3 = await createItem(u2._id, {
    name: "orange",
    description: "A boring fruit.",
    location: "In some basic girl's stomach.",
    user: u2,
  });

  await u1.save();
  await u2.save();
  await i1.save();
  await i2.save();
  await i3.save();
};
