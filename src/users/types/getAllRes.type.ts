import { User } from "src/schemas/User.schema";

export type GetAllRes = {
    pages: number;
    data: User[];
};