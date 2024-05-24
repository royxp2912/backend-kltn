import { Comment } from "src/schemas/Comment.schema";

export type PaginationRes = {
    pages: number;
    data: Comment[];
    total?: number;
}