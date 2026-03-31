if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não definido')

export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d' as const,
  },
  bcrypt: {
    saltRounds: 10,
  },
}
