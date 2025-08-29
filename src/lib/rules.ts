import dayjs from "dayjs";
import { IncomeEntry, ShiftEntry, UserProfile } from "./store";

export type WallType = "103" | "130";

export type CalcResult = {
	totalIncomeYTD: number;
	remainingTo103: number;
	remainingTo130: number;
	estimatedHoursLeftBy103: number; // using default hourly wage
	estimatedHoursLeftBy130: number;
};

export function calculateWalls(
	profile: UserProfile,
	incomes: IncomeEntry[],
	_shifts: ShiftEntry[]
): CalcResult {
	const year = dayjs().year();
	const incomesThisYear = incomes.filter((i) => dayjs(i.date).year() === year);
	const totalIncomeYTD = incomesThisYear.reduce((sum, i) => sum + i.amount, 0);

	const limit103 = 1030000;
	const limit130 = 1300000;

	const remainingTo103 = Math.max(0, limit103 - totalIncomeYTD);
	const remainingTo130 = Math.max(0, limit130 - totalIncomeYTD);

	const hourly = profile.defaultHourlyWage || 0;
	const estimatedHoursLeftBy103 = hourly > 0 ? Math.floor(remainingTo103 / hourly) : 0;
	const estimatedHoursLeftBy130 = hourly > 0 ? Math.floor(remainingTo130 / hourly) : 0;

	return {
		totalIncomeYTD,
		remainingTo103,
		remainingTo130,
		estimatedHoursLeftBy103,
		estimatedHoursLeftBy130,
	};
}


