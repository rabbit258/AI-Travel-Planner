export type Activity = {
	time?: string;
	title: string;
	desc?: string;
	costCNY?: number;
};

export type POI = {
	name: string;
	lat: number;
	lng: number;
};

export type DayPlan = {
	title: string;
	date?: string;
	activities: Activity[];
	mapPOIs: POI[];
};

export type BudgetBreakdown = {
	category: string;
	amount: number;
};

export type RouteInfo = {
	distance: number; // 距离（米）
	duration: number; // 时间（秒）
	steps: Array<{
		instruction: string; // 路线说明
		distance: number; // 路段距离（米）
		duration: number; // 路段时间（秒）
	}>;
};

export type LocationInfo = {
	name: string;
	lat: number;
	lng: number;
};

export type PlanResult = {
	itineraryByDay: DayPlan[];
	transport?: string[];
	lodging?: string[];
	restaurants?: string[];
	totalEstimatedCost?: number;
	tips?: string[];
	budgetBreakdown?: BudgetBreakdown[];
	// 路径信息（从出发地到目的地）
	routeInfo?: RouteInfo;
	originLocation?: LocationInfo;
	destinationLocation?: LocationInfo;
};


