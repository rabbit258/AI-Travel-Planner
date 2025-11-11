import type { PlanResult } from "@/types/plan";

type PlanSummaryProps = {
	plan: PlanResult;
};

export default function PlanSummary({ plan }: PlanSummaryProps) {
	const transport = plan.transport ?? [];
	const lodging = plan.lodging ?? [];
	const restaurants = plan.restaurants ?? [];
	const tips = plan.tips ?? [];
	const breakdown = plan.budgetBreakdown ?? [];

	const hasContent =
		transport.length > 0 ||
		lodging.length > 0 ||
		restaurants.length > 0 ||
		tips.length > 0 ||
		(plan.budgetBreakdown && plan.budgetBreakdown.length > 0);

	if (!hasContent) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold">行程亮点预览</h2>
				<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
					AI 已根据你的偏好生成推荐的交通、住宿、美食与贴士。
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{transport.length > 0 && (
					<div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
						<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">交通建议</h3>
						<ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
							{transport.map((item, idx) => (
								<li key={idx} className="flex items-start gap-2">
									<span className="text-sky-500 mt-0.5">•</span>
									<span className="flex-1">{typeof item === "string" ? item : String(item)}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{lodging.length > 0 && (
					<div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
						<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">住宿推荐</h3>
						<ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
							{lodging.map((item, idx) => (
								<li key={idx} className="flex items-start gap-2">
									<span className="text-sky-500 mt-0.5">•</span>
									<span className="flex-1">{typeof item === "string" ? item : String(item)}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{restaurants.length > 0 && (
					<div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
						<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">美食推荐</h3>
						<ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
							{restaurants.map((item, idx) => (
								<li key={idx} className="flex items-start gap-2">
									<span className="text-sky-500 mt-0.5">•</span>
									<span className="flex-1">{typeof item === "string" ? item : String(item)}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{tips.length > 0 && (
					<div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
						<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">旅行贴士</h3>
						<ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
							{tips.map((item, idx) => (
								<li key={idx} className="flex items-start gap-2">
									<span className="text-sky-500 mt-0.5">•</span>
									<span className="flex-1">{typeof item === "string" ? item : String(item)}</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>


			{breakdown.length > 0 && (
				<div className="rounded-xl border border-slate-200 bg-slate-900/5 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-100/5">
					<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">预算分配建议</h3>
					<div className="mt-3 grid gap-3 md:grid-cols-2">
						{breakdown.map((item, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"
							>
								<span className="font-medium text-slate-700 dark:text-slate-200">{item.category}</span>
								<span className="text-slate-500 dark:text-slate-300">¥{Math.round(item.amount)}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}


