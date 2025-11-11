import type { RouteInfo, LocationInfo } from "@/types/plan";

type RouteInfoProps = {
	routeInfo?: RouteInfo;
	originLocation?: LocationInfo;
	destinationLocation?: LocationInfo;
};

export default function RouteInfo({
	routeInfo,
	originLocation,
	destinationLocation,
}: RouteInfoProps) {
	if (!routeInfo) return null;

	return (
		<div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
			<h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
				路线信息
				{originLocation && destinationLocation && (
					<span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 ml-2">
						({originLocation.name} → {destinationLocation.name})
					</span>
				)}
			</h3>
			<div className="space-y-2 text-sm">
				<div className="flex items-center justify-between">
					<span className="text-slate-600 dark:text-slate-300">总距离</span>
					<span className="font-semibold text-emerald-700 dark:text-emerald-300">
						{routeInfo.distance >= 1000
							? `${(routeInfo.distance / 1000).toFixed(1)} 公里`
							: `${routeInfo.distance} 米`}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-slate-600 dark:text-slate-300">预计时间</span>
					<span className="font-semibold text-emerald-700 dark:text-emerald-300">
						{routeInfo.duration >= 3600
							? `${Math.floor(routeInfo.duration / 3600)} 小时 ${Math.floor((routeInfo.duration % 3600) / 60)} 分钟`
							: `${Math.floor(routeInfo.duration / 60)} 分钟`}
					</span>
				</div>
				{routeInfo.steps && routeInfo.steps.length > 0 ? (
					<div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
						<p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">路线指引</p>
						<ul className="space-y-1.5 max-h-32 overflow-y-auto">
							{routeInfo.steps.slice(0, 5).map((step, idx) => {
								// 处理路线指引文本，移除 HTML 标签和多余空白
								const instruction = step.instruction
									? String(step.instruction)
											.replace(/<[^>]*>/g, "") // 移除 HTML 标签
											.replace(/\s+/g, " ") // 合并多个空白
											.trim()
									: "";
								
								if (!instruction) return null;
								
								return (
									<li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
										<span className="text-emerald-500 mt-0.5 shrink-0">→</span>
										<span className="flex-1">{instruction}</span>
									</li>
								);
							})}
							{routeInfo.steps.length > 5 && (
								<li className="text-xs text-slate-500 dark:text-slate-500 italic">
									还有 {routeInfo.steps.length - 5} 个步骤...
								</li>
							)}
						</ul>
					</div>
				) : (
					<div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
						<p className="text-xs text-slate-500 dark:text-slate-500 italic">
							暂无详细路线指引
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

