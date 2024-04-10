import { DateUtilRes } from "../types";

export const StartEndOfWeek = (day: number, month: number, year: number): DateUtilRes => {
    const today = new Date(year, month, day);
    let startOfWeek = new Date(today);
    let endOfWeek = new Date(today);;

    if (today.getDay() === 0) {
        startOfWeek.setDate(today.getDate() - 6);
        endOfWeek.setDate(today.getDate() + 1);
    }

    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(0, 0, 0, 0);

    return {
        start: startOfWeek,
        end: endOfWeek,
    }
}