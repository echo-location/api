import express from "express";
import cors from "cors";
import "dotenv/config";
import routes from "./routes";

// configurations
const whitelist = [
  "http://localhost:3000",
  "http://localhost:8000, http://echolocation-api.herokuapp.com/",
];
const corsOPS = {
  origin: whitelist,
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOPS));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes.root);
app.use("/user", routes.user);
app.use("/item", routes.item);

export default app;
