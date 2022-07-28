import express from "express";
import { router as auth } from "./auth/auth.routes.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", auth);

app.listen(5000, () => {
  console.log("🚀 listening on port 5000 ");
});
