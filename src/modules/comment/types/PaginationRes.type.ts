import { Comment } from "src/schemas/comment.schema";

export type PaginationRes = {
    pages: number;
    data: Comment[];
    total?: number;
}