import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import gameRoutes from "./routes/gameRoutes.js";
import userRoutes from "./routes/user.js";
import boardRoutes from "./routes/boardRoute.js";
import cardRoutes from "./routes/cardRoute.js";
import workspaceRoutes from "./routes/workspaceRoute.js"
import meetRoutes from "./routes/meetRoute.js";

import { NotFoundError, errorHandler } from "./middlewares/error-handler.js";
import morgan from "morgan";
import connectDb from "./config/db.js";
const app = express();

dotenv.config();
// badel hedhi ki bech taamel docker-compose up DOCKERSERVERURL
const hostname = process.env.SERVERURL;
const port = process.env.SERVERPORT;

//info on req : GET /route ms -25
app.use(morgan("tiny"));

app.use(cors());
connectDb();
//bech taati acces lel dossier media li fih les images, localhost:9095/media/fifa.jpg
app.use("/media", express.static("media"));
app.use("/pdp", express.static("pdp"));
app.use("/cards", express.static("cards"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/game", gameRoutes);
app.use("/user", userRoutes);
app.use("/board", boardRoutes)
app.use("/card", cardRoutes );
app.use("/workspace", workspaceRoutes);
app.use("/meet", meetRoutes);

app.use(NotFoundError);
app.use(errorHandler);

app.listen(port, hostname, () => {
  console.log(`Server running on ${hostname}:${port}`);
});
