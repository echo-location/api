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
    email: "jdoe@gmail.com",
  });

  const u2 = await createUser({
    username: "beilish",
    email: "beilish@outlook.com",
    phone: "699-699-6999",
  });

  const i1 = await createItem(u1._id, {
    name: "Black notebook",
    description: "70 page notebook used for CS35L",
    location: "Young Hall 24",
    user: u1,
    meta: {
      coordinates: [34.06874719772689, -118.4414202073267],
    },
  });

  const i2 = await createItem(u1._id, {
    name: "iPhone 12 with black case",
    description: "Found it near salad bar",
    location: "Bruin Plate",
    user: u1,
    meta: {
      coordinates: [34.07181551814718, -118.44985843682255],
    },
  });

  const i3 = await createItem(u2._id, {
    name: "Airpods",
    description: "",
    location: "Pauley Pavillion",
    user: u2,
    meta: {
      coordinates: [34.07057334749834, -118.44688961520164],
    },
  });

  const i4 = await createItem(u2._id, {
    name: "Bruin Card",
    description: "Message me ID to check",
    location: "Westwood Movie Theater",
    user: u2,
    meta: {
      coordinates: [34.0627958582108, -118.44681216186402],
    },
  });

  await u1.save();
  await u2.save();
  await i1.save();
  await i2.save();
  await i3.save();
  await i4.save();
};

export { createUser, createItem, repopulate };
