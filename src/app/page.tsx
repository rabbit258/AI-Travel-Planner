"use client";

import { useMemo, useState } from "react";
import PlannerForm from "@/components/PlannerForm";
import PlanSummary from "@/components/PlanSummary";
import MapView from "@/components/MapView";
import ItineraryView from "@/components/ItineraryView";
import ExpenseTracker, { type Expense } from "@/components/ExpenseTracker";
import type { PlanResult, BudgetBreakdown } from "@/types/plan";

const gradientBackground =
	"relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-100 via-white to-white p-8 shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950";

export default function Home() {
	const [destination, setDestination] = useState("");
	const [startDate, setStartDate] = useState<string | undefined>(undefined);
	const [days, setDays] = useState<number | undefined>(undefined);
	const [budget, setBudget] = useState<number | undefined>(undefined);
	const [travelers, setTravelers] = useState<number | undefined>(undefined);
	const [preferences, setPreferences] = useState<string>("");
	const [withChildren, setWithChildren] = useState(false);
	const [language, setLanguage] = useState<"zh" | "en" | "ja">("zh");
	const [loading, setLoading] = useState(false);
	const [plan, setPlan] = useState<PlanResult | null>(null);
	const [expenses, setExpenses] = useState<Expense[]>([]);

	const expenseTotal = useMemo(
		() => expenses.reduce((sum, item) => sum + (item.amountCNY || 0), 0),
		[expenses]
	);

	const allPOIs = useMemo(
		() => plan?.itineraryByDay?.flatMap((day) => day.mapPOIs) ?? [],
		[plan?.itineraryByDay]
	);

	async function generatePlan() {
		if (!destination) return;
		setLoading(true);
		try {
			const res = await fetch("/api/plan", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					destination,
					startDate,
					days,
					budget,
					travelers,
					preferences: preferences
						.split(/[，,、;]/)
						.map((s) => s.trim())
						.filter(Boolean),
					withChildren,
					language,
				}),
			});
			const raw = (await res.json()) as Partial<PlanResult>;
			const toStringArray = (value: PlanResult["transport"]) => {
				if (!value) return [];
				return Array.isArray(value) ? value.map((item) => String(item)) : [String(value)];
			};
			const normalizeBreakdown = (list?: BudgetBreakdown[]): BudgetBreakdown[] =>
				(list ?? []).map((item) => ({
					category: item.category,
					amount:
						typeof item.amount === "number"
							? item.amount
							: Number(item.amount) || 0,
				}));
			const normalized: PlanResult = {
				itineraryByDay: Array.isArray(raw.itineraryByDay) ? raw.itineraryByDay : [],
				transport: toStringArray(raw.transport),
				lodging: toStringArray(raw.lodging),
				restaurants: toStringArray(raw.restaurants),
				totalEstimatedCost:
					typeof raw.totalEstimatedCost === "number"
						? raw.totalEstimatedCost
						: raw.totalEstimatedCost
							? Number(raw.totalEstimatedCost)
							: undefined,
				tips: toStringArray(raw.tips),
				budgetBreakdown: normalizeBreakdown(raw.budgetBreakdown),
			};
			setPlan(normalized);
		} catch (e) {
			console.error(e);
			alert("规划失败，请稍后重试");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-10">
			<section className={gradientBackground}>
				<div className="absolute -top-24 right-8 size-48 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
				<div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />
				<div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-4 max-w-xl">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-sky-600 shadow dark:bg-slate-900/60 dark:text-sky-300">
							AI Travel Copilot
						</span>
						<h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
							告诉我你的旅行想法，剩下的交给 AI
						</h1>
						<p className="text-sm text-slate-600 dark:text-slate-300">
							一站式行程规划、预算分析、地图导航与实时提醒。语音或文字输入，一键生成个性化旅行方案，随时调整，轻松同步。
						</p>
					</div>
					<div className="grid w-full max-w-md gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">预计行程预算</span>
							<span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								{plan?.totalEstimatedCost ? `¥${Math.round(plan.totalEstimatedCost)}` : budget ? `¥${budget}` : "—"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">已记录支出</span>
							<span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
								{expenseTotal > 0 ? `¥${Math.round(expenseTotal)}` : "¥0"}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-slate-500 dark:text-slate-400">行程天数</span>
							<span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								{plan?.itineraryByDay?.length || days || "—"} 天
							</span>
						</div>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
					<PlannerForm
						destination={destination}
						startDate={startDate}
						days={days}
						budget={budget}
						travelers={travelers}
						preferences={preferences}
						withChildren={withChildren}
						language={language}
						loading={loading}
						onDestinationChange={setDestination}
						onStartDateChange={setStartDate}
						onDaysChange={setDays}
						onBudgetChange={setBudget}
						onTravelersChange={setTravelers}
						onPreferencesChange={setPreferences}
						onWithChildrenChange={setWithChildren}
						onLanguageChange={setLanguage}
						onGenerate={generatePlan}
					/>
				</div>

				<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
					{plan ? (
						<PlanSummary plan={plan} />
					) : (
						<div className="flex h-full flex-col items-start justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
							<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">等待你的旅行灵感</h2>
							<p>输入目的地和需求后，可以查看 AI 自动生成的交通、住宿、美食与贴士列表。</p>
							<p className="text-xs opacity-70">支持语音输入，适合快速记录突发的旅行想法。</p>
						</div>
					)}
				</div>
			</section>

			{plan && (
				<section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					<div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
						{allPOIs.length > 0 ? (
							<MapView pois={allPOIs} height={420} className="rounded-2xl overflow-hidden" />
						) : (
							<div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
								暂无定位信息，尝试再次生成行程获取地图推荐。
							</div>
						)}
					</div>
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
						<ItineraryView
							itineraryByDay={plan.itineraryByDay}
							totalEstimatedCost={plan.totalEstimatedCost}
						/>
					</div>
				</section>
			)}

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<ExpenseTracker
					initial={[]}
					budgetCNY={plan?.totalEstimatedCost ?? budget}
					onChange={setExpenses}
				/>
			</section>
		</div>
	);
}
