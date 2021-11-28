import models from "../../models";
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
    location: "In someone's stomach.",
    user: u2,
  });

  const i4 = await createItem(u2._id, {
    name: "orange",
    description: "A great fruit.",
    location: "In someone else's stomach.",
    user: u2,
  });
  await u1.save();
  await u2.save();
  await i1.save();
  await i2.save();
  await i3.save();
  await i4.save();
};

export { createUser, createItem, repopulate };
