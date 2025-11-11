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

export type PlanResult = {
	itineraryByDay: DayPlan[];
	transport?: string[];
	lodging?: string[];
	restaurants?: string[];
	totalEstimatedCost?: number;
	tips?: string[];
	budgetBreakdown?: BudgetBreakdown[];
};


