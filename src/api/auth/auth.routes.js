import express from "express";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../../utils/jwt.js";
import { addRefreshTokenToWhitelist } from "./auth.services.js";
import {
  createUserByEmailAndPassword,
  fiendUserByEmail,
  findUserById,
} from "../users/users.services.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req.body", email, password);

    if (!email || !password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }
    const existingUser = await fiendUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use.");
    }

    const user = await createUserByEmailAndPassword({ email, password });
    const generatedUuid = uuidv4();
    const jti = generatedUuid.replaceAll("-", "");

    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    // next(err);
    console.log("error in user register ", error);
    res.status(400).json({ message: "error", error });
  }
});

export { router };
