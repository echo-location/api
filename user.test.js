import User from "./src/models/userModel";
import { connect, disconnect } from "./src/utils/tests/db";
const userData = { username: "tLoon" };

beforeAll(async () => await connect());
afterAll(async () => await disconnect());

describe("/users", () => {
  it("should get all users", async () => {
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    expect(savedUser._id).toBeDefined();
  });
});
