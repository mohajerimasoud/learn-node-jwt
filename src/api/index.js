import express from "express";
import { router as auth } from "./auth/auth.routes.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", auth);


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 listening on port ${PORT}`);
});
