import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    "JWT_ACCESS_SECRET",
    { expiresIn: "5m" }
  );
};

export const generateRefreshToken = (user, jti) => {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    "JWT_ACCESS_SECRET",
    { expiresIn: "8h" }
  );
};

export const generateTokens = (user, jti) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return { accessToken, refreshToken };
};
