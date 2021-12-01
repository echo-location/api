import app from "./app";
import models, { connectDB } from "./models";
import { repopulate } from "./utils/helpers/helpers";
import mongoose from 'mongoose';
connectDB().then(async () => {
  // drop collection when needed (eg. changes of Schema)
  // await mongoose.connection.db.dropCollection('items');
  if (process.env.ENABLE_SANDBOX) {
    await Promise.all([models.User.deleteMany({}), models.Item.deleteMany({})]);
    repopulate();
  }
  app.listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}!`)
  );
});
