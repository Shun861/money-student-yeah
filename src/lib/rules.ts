import dayjs from "dayjs";
import type { IncomeEntry, UserProfile, CalcResult, WorkSchedule, ShiftEntry } from "@/types";

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

// 勤務スケジュールから収入を計算
export function calculateIncomeFromSchedule(
	profile: UserProfile,
	schedules: WorkSchedule[],
	shifts: ShiftEntry[],
	year: number = dayjs().year()
): number {
	let totalIncome = 0;
	
	// スケジュールベースの収入計算
	schedules.forEach(schedule => {
		const startDate = dayjs(schedule.startDate);
		const endDate = schedule.endDate ? dayjs(schedule.endDate) : dayjs().endOf('year');
		
		if (startDate.year() <= year && endDate.year() >= year) {
			const yearStart = dayjs(`${year}-01-01`);
			const yearEnd = dayjs(`${year}-12-31`);
			
			const effectiveStart = startDate.isAfter(yearStart) ? startDate : yearStart;
			const effectiveEnd = endDate.isBefore(yearEnd) ? endDate : yearEnd;

			// 有効期間の週数・月数を算出
			const weeksInPeriod = effectiveEnd.diff(effectiveStart, 'week') + 1;
			const monthsInPeriod = effectiveEnd.endOf('month').diff(effectiveStart.startOf('month'), 'month') + 1;
			const monthlyIncome = (schedule.weeklyHours ?? 0) * (schedule.hourlyWage ?? 0) * 4.33; // 月平均4.33週
			
			if (schedule.frequency === 'weekly') {
				totalIncome += (schedule.weeklyHours ?? 0) * (schedule.hourlyWage ?? 0) * Math.max(0, weeksInPeriod);
			} else {
				totalIncome += monthlyIncome * Math.max(0, monthsInPeriod);
			}
		}
	});
	
	// シフトベースの収入計算
	shifts.forEach(shift => {
		if (dayjs(shift.date).year() === year) {
			const hourlyWage = (shift.hourlyWage ?? profile.default_hourly_wage) || 0;
			totalIncome += shift.hours * hourlyWage;
		}
	});
	
	return totalIncome;
}

// 扶養超過予測を計算
export function predictDependencyExceed(
	profile: UserProfile,
	incomes: IncomeEntry[],
	schedules: WorkSchedule[],
	shifts: ShiftEntry[]
): {
	exceedDate: string | null;
	exceedAmount: number;
	monthlyAverage: number;
	simulationData: Array<{
		month: string;
		cumulativeIncome: number;
		limit103: number;
		limit130: number;
		limit150: number;
	}>;
} {
	const currentYear = dayjs().year();
	const currentMonth = dayjs().month() + 1;
	
	// 現在までの収入を計算
	const currentIncome = calculateIncomeFromSchedule(profile, schedules, shifts, currentYear);
	const existingIncome = incomes
		.filter(i => dayjs(i.date).year() === currentYear)
		.reduce((sum, i) => sum + i.amount, 0);
	
	const totalCurrentIncome = currentIncome + existingIncome;
	const monthlyAverage = totalCurrentIncome / currentMonth;
	
	// シミュレーションデータを生成
	const simulationData = [];
	const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
	
	let cumulativeIncome = 0;
	for (let i = 0; i < 12; i++) {
		if (i < currentMonth - 1) {
			// 過去の月は実際の収入を使用
			cumulativeIncome += monthlyAverage;
		} else {
			// 将来の月は予測収入を使用
			cumulativeIncome += monthlyAverage;
		}
		
		simulationData.push({
			month: months[i],
			cumulativeIncome,
			limit103: 1030000,
			limit130: 1300000,
			limit150: 1500000,
		});
	}
	
	// 扶養制限額
	const limit = (profile.bracket ?? 103) * 10000;
	
	if (monthlyAverage * 12 <= limit) {
		return {
			exceedDate: null,
			exceedAmount: 0,
			monthlyAverage,
			simulationData
		};
	}
	
	// 超過する月を計算
	const remainingMonths = 12 - currentMonth;
	const remainingIncome = monthlyAverage * remainingMonths;
	const totalProjectedIncome = totalCurrentIncome + remainingIncome;
	
	if (totalProjectedIncome > limit) {
		const exceedMonth = Math.ceil((limit - totalCurrentIncome) / monthlyAverage) + currentMonth;
		const exceedDate = dayjs(`${currentYear}-${exceedMonth.toString().padStart(2, '0')}-01`);
		
		return {
			exceedDate: exceedDate.format('YYYY-MM-DD'),
			exceedAmount: totalProjectedIncome - limit,
			monthlyAverage,
			simulationData
		};
	}
	
	return {
		exceedDate: null,
		exceedAmount: 0,
		monthlyAverage,
		simulationData
	};
}


