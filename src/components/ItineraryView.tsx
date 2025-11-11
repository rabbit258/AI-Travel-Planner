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
					<div key={idx} className="rounded-xl border p-4 shadow-sm dark:border-slate-800">
						<div className="font-medium mb-2">
							{day.title} {day.date ? `· ${day.date}` : ""}
						</div>
						<ul className="relative ml-2 space-y-3 text-sm before:absolute before:left-[-9px] before:top-0 before:h-full before:w-px before:bg-slate-200 dark:before:bg-slate-800">
							{day.activities.map((act, i) => (
								<li key={i} className="relative flex items-start gap-3">
									<span className="absolute left-[-12px] top-2 size-2 rounded-full bg-sky-500" />
									<span className="w-16 shrink-0 text-xs opacity-70">{act.time ?? ""}</span>
									<div className="flex-1">
										<div className="font-medium">{act.title}</div>
										{act.desc && <div className="opacity-80">{act.desc}</div>}
										{typeof act.costCNY === "number" && (
											<div className="opacity-70">费用：¥{Math.round(act.costCNY)}</div>
										)}
									</div>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}


