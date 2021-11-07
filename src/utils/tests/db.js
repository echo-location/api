const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongod = new MongoMemoryServer();

export const connect = async () => {
  await mongod.start();
  const uri = mongod.getUri();
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  await mongoose.connect(uri, options);
};

export const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

// module.exports.clear = async () => {
//     const uri = await mongod.getUri();
//     const options = {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         poolSize: 10
//     };
//     await mongoose.connect(uri, options);
// }
