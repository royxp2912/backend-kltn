import { User } from "src/schemas/user.schema";

export type GetAllRes = {
    pages: number;
    data: User[];
};