import { User } from "src/schemas/user.schema";
import { Tokens } from "./tokens.type";

export type LoginResponse = {
    user: object,
    tokens: Tokens,
}