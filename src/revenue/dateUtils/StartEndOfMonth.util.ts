import { DateUtilRes } from "../types";

export const StartEndOfMonth = (month: number, year: number): DateUtilRes => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfNextMonth = new Date(year, month, 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    firstDayOfNextMonth.setHours(0, 0, 0, 0);

    return {
        start: firstDayOfMonth,
        end: firstDayOfNextMonth,
    }
}