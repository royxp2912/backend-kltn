import { DateUtilRes } from "../types";

export const StartEndOfDay = (day: number, month: number, year: number): DateUtilRes => {
    const today = new Date(year, month, day);
    const tomorrow = new Date(year, month, day + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    return {
        start: today,
        end: tomorrow,
    }
}