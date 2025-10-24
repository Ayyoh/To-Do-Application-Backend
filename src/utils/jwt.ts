import * as jwt from "jsonwebtoken";
import "dotenv/config";

const secret = process.env.JWT_SECRET!;

export const signToken = (payload: object) => {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
