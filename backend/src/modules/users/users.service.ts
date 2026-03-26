import { prisma } from "../../utils/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "../../config/auth";

export const usersService = {
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { code: 404, message: "Usuário não encontrado" };
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  async updateProfile(
    userId: number,
    name: string,
    email: string,
    avatar: string,
  ) {
    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (emailTaken) throw { code: 409, message: "Email já está em uso" };

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, avatar },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
  },

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { code: 404, message: "Usuário não encontrado" };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw { code: 422, message: "Senha atual incorreta" };

    const hashed = await bcrypt.hash(newPassword, authConfig.bcrypt.saltRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  },

  async getAll() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return users;
  },

  async updateUser(userId: number, name: string, email: string, role: string) {
    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (emailTaken) throw { code: 409, message: "Email já está em uso" };

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, role: role as "ADMIN" | "USER" },
    });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  async deleteUser(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { code: 404, message: "Usuário não encontrado" };
    await prisma.user.delete({ where: { id: userId } });
  },
};
