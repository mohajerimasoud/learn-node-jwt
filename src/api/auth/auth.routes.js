import express from "express";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../../utils/jwt.js";
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
} from "./auth.services.js";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
  findUserById,
} from "../users/users.services.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashToken } from "../../utils/hashToken.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req.body", email, password);

    if (!email || !password) {
      res.status(400);
      console.log("You must provide an email and a password.");
    }
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      console.log("Email already in use.");
    }

    const user = await createUserByEmailAndPassword({ email, password });
    const generatedUuid = uuidv4();
    const jti = generatedUuid.replaceAll("-", "");

    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.status(200).json({
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
      console.log("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403).json({ message: "Invalid login credentials." });
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      console.log("Invalid login credentials.");
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("error in login",err);

    res.status(400).json({ message: "error", error });  }
});

router.post("/refreshToken", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      console.log("Missing refresh token.");
    }
    const payload = jwt.verify(refreshToken, "JWT_ACCESS_SECRET");
    const decode = jwt.decode(refreshToken);
    console.log("=== here jti", payload.jti);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401).json({ message: "Unauthorized" });
      console.log("Unauthorized");
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      console.log("Unauthorized");
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      console.log("Unauthorized");
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti
    );
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.log("error in refresh :", err);
    res.status(400).json({ err });
  }
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post("/revokeRefreshTokens", async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});

export { router };
