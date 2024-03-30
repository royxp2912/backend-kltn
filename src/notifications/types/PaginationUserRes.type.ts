import { Notification } from "src/schemas/Notification.schema";

export type PaginationUserRes = {
    pages: number,
    data: Notification[],
}