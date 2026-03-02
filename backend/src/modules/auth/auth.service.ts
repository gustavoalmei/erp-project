import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/auth";

export const authService = {
  async register(name: string, email: string, password: string) {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      authConfig.bcrypt.saltRounds,
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error("Credenciais inválidas");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};
