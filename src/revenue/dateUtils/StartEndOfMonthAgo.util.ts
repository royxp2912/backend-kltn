import { DateUtilRes } from "../types";

export const StartEndOfMonthAgo = (day: number, month: number, year: number): DateUtilRes => {
    const today = new Date(year, month, day);
    const endDay = new Date(today);
    let startDay = new Date(today);

    startDay.setDate(today.getDate() - 30);

    return {
        start: startDay,
        end: endDay,
    }
}