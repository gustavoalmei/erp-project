export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "projeto-erp-palavra-secreta",
    expiresIn: "7d",
  },
  bcrypt: {
    saltRounds: 10,
  },
};
