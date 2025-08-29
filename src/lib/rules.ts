import dayjs from "dayjs";
import type { IncomeEntry, UserProfile, CalcResult } from "@/types";

export function calculateWalls(
	profile: UserProfile,
	incomes: IncomeEntry[]
): CalcResult {
	const year = dayjs().year();
	const incomesThisYear = incomes.filter((i) => dayjs(i.date).year() === year);
	const totalIncomeYTD = incomesThisYear.reduce((sum, i) => sum + i.amount, 0);

	const limit = (profile.bracket ?? 103) * 10000; // 万円入力を円に
	const remainingToLimit = Math.max(0, limit - totalIncomeYTD);
	const percentUsed = Math.min(100, Math.round((totalIncomeYTD / limit) * 100));

	const hourly = profile.defaultHourlyWage || 0;
	const estimatedHoursLeftBy103 = hourly > 0 ? Math.floor(Math.max(0, 1030000 - totalIncomeYTD) / hourly) : 0;
	const estimatedHoursLeftBy130 = hourly > 0 ? Math.floor(Math.max(0, 1300000 - totalIncomeYTD) / hourly) : 0;

	return {
		totalIncomeYTD,
		remainingToLimit,
		percentUsed,
		estimatedHoursLeftBy103,
		estimatedHoursLeftBy130,
	};
}


