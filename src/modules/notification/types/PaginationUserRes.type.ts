import { Notification } from "src/schemas/notification.schema";

export type PaginationUserRes = {
    pages: number,
    data: Notification[],
}