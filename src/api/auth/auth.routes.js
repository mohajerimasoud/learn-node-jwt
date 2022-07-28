import express from "express";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../../utils/jwt.js";
import { addRefreshTokenToWhitelist } from "./auth.services.js";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
} from "../users/users.services.js";
import bcrypt from "bcrypt";

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

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403).json({ message: "Invalid login credentials." });
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

export { router };
