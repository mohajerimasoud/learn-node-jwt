import bycript from "bcrypt";
import { prisma } from "../../utils/db.js";

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUserByEmailAndPassword = (user) => {
  user.password = bycript.hashSync(user.password, 12);
  return prisma.user.create({
    data: user,
  });
};

export const findUserById = (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};
