import type { DayPlan } from "@/types/plan";

type Props = {
	itineraryByDay: DayPlan[];
	totalEstimatedCost?: number;
	className?: string;
};

export default function ItineraryView({ itineraryByDay, totalEstimatedCost, className }: Props) {
	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-3">
				<h2 className="section-title">行程安排</h2>
				{typeof totalEstimatedCost === "number" && (
					<div className="text-sm opacity-80">预计总费用：¥{Math.round(totalEstimatedCost)}</div>
				)}
			</div>
			<div className="space-y-4">
				{itineraryByDay.map((day, idx) => (
					<div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
						<div className="mb-3 font-medium text-slate-900 dark:text-slate-100">
							{day.title} {day.date ? `· ${day.date}` : ""}
						</div>
						{day.activities && day.activities.length > 0 ? (
							<ul className="relative ml-4 space-y-3 text-sm before:absolute before:left-[-13px] before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
								{day.activities.map((act, i) => (
									<li key={i} className="relative flex items-start gap-3 pl-2">
										<span className="absolute left-[-16px] top-2.5 z-10 size-2.5 shrink-0 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
										<span className="w-16 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
											{act.time ?? ""}
										</span>
										<div className="flex-1 min-w-0">
											<div className="font-medium text-slate-900 dark:text-slate-100">{act.title}</div>
											{act.desc && (
												<div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{act.desc}</div>
											)}
											{typeof act.costCNY === "number" && (
												<div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
													费用：¥{Math.round(act.costCNY)}
												</div>
											)}
										</div>
									</li>
								))}
							</ul>
						) : (
							<div className="text-sm text-slate-400 dark:text-slate-500">暂无活动安排</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}


