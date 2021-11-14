import app from "./app";
import models, { connectDB } from "./models";
import { repopulate } from "./utils/helpers/helpers";

connectDB().then(async () => {
  if (process.env.ENABLE_SANDBOX) {
    await Promise.all([models.User.deleteMany({}), models.Item.deleteMany({})]);
    repopulate();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}!`)
  );
});
