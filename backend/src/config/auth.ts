export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "projeto-erp-palavra-secreta",
    expiresIn: "7d" as const,
  },
  bcrypt: {
    saltRounds: 10,
  },
};
