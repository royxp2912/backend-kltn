import { User } from "src/schemas/User.schema";
import { Tokens } from "./tokens.type";

export type LoginResponse = {
    user: object,
    tokens: Tokens,
}