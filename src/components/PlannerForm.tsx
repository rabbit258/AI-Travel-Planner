"use client";

import MicButton from "@/components/MicButton";
import { useRef, type ChangeEvent } from "react";

type PlannerFormProps = {
	origin?: string;
	destination: string;
	days?: number;
	budget?: number;
	travelers?: number;
	startDate?: string;
	preferences: string;
	withChildren: boolean;
	language: "zh" | "en" | "ja";
	loading: boolean;
	onOriginChange: (value: string) => void;
	onDestinationChange: (value: string) => void;
	onDaysChange: (value: number | undefined) => void;
	onBudgetChange: (value: number | undefined) => void;
	onTravelersChange: (value: number | undefined) => void;
	onPreferencesChange: (value: string) => void;
	onWithChildrenChange: (value: boolean) => void;
	onStartDateChange: (value: string | undefined) => void;
	onLanguageChange: (value: "zh" | "en" | "ja") => void;
	onGenerate: () => void;
};

function toNumber(event: ChangeEvent<HTMLInputElement>): number | undefined {
	const value = event.target.value;
	return value ? Number(value) : undefined;
}

export default function PlannerForm(props: PlannerFormProps) {
	const {
		origin,
		destination,
		days,
		budget,
		travelers,
		startDate,
		preferences,
		withChildren,
		language,
		loading,
		onOriginChange,
		onDestinationChange,
		onDaysChange,
		onBudgetChange,
		onTravelersChange,
		onPreferencesChange,
		onWithChildrenChange,
		onStartDateChange,
		onLanguageChange,
		onGenerate,
	} = props;

	// Refs for input fields to support voice input
	const originRef = useRef<HTMLInputElement>(null);
	const destinationRef = useRef<HTMLInputElement>(null);
	const daysRef = useRef<HTMLInputElement>(null);
	const budgetRef = useRef<HTMLInputElement>(null);
	const travelersRef = useRef<HTMLInputElement>(null);
	const preferencesRef = useRef<HTMLTextAreaElement>(null);

	// Get the currently focused input element
	const getActiveElement = () => {
		const active = document.activeElement;
		if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
			if (active.type !== "date" && active.tagName !== "SELECT") {
				return active;
			}
		}
		return null;
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold">自定义行程需求</h2>
				<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
					填写目的地、预算、偏好等信息，AI 会为你生成最合适的路线。
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						出发地
					</label>
					<input
						ref={originRef}
						className="input"
						placeholder="湖南怀化"
						value={origin ?? ""}
						onChange={(e) => onOriginChange(e.target.value)}
					/>
				</div>
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						目的地
					</label>
					<input
						ref={destinationRef}
						className="input"
						placeholder="张家界"
						value={destination}
						onChange={(e) => onDestinationChange(e.target.value)}
					/>
				</div>
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						出发日期
					</label>
					<input
						type="date"
						value={startDate ?? ""}
						onChange={(e) => onStartDateChange(e.target.value || undefined)}
						className="input"
					/>
				</div>
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						旅行天数
					</label>
					<input
						ref={daysRef}
						type="number"
						min={1}
						value={days ?? ""}
						onChange={(e) => onDaysChange(toNumber(e))}
						className="input"
						placeholder="2"
					/>
				</div>
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						预算（人民币）
					</label>
					<input
						ref={budgetRef}
						type="number"
						min={0}
						value={budget ?? ""}
						onChange={(e) => onBudgetChange(toNumber(e))}
						className="input"
						placeholder="2000"
					/>
				</div>
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						同行人数
					</label>
					<input
						ref={travelersRef}
						type="number"
						min={1}
						value={travelers ?? ""}
						onChange={(e) => onTravelersChange(toNumber(e))}
						className="input"
						placeholder="3"
					/>
				</div>
				<div className="flex flex-col">
					<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
						语言偏好
					</label>
					<select
						value={language}
						onChange={(e) => onLanguageChange(e.target.value as "zh" | "en" | "ja")}
						className="select"
					>
						<option value="zh">中文</option>
						<option value="en">English</option>
						<option value="ja">日本語</option>
					</select>
				</div>
			</div>

			<div className="flex flex-col">
				<label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
					旅行偏好
				</label>
				<textarea
					ref={preferencesRef}
					rows={2}
					className="textarea"
					placeholder="例如：亲子、美食、温泉、博物馆、动漫打卡..."
					value={preferences}
					onChange={(e) => onPreferencesChange(e.target.value)}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
					<input
						type="checkbox"
						checked={withChildren}
						onChange={(e) => onWithChildrenChange(e.target.checked)}
						className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
					/>
					携带儿童出行
				</label>

				<MicButton
					onTranscript={() => {
						// 回调函数，但实际更新由 MicButton 内部处理
					}}
					onGetActiveElement={getActiveElement}
					className="btn-outline"
					lang={language === "zh" ? "zh-CN" : language === "ja" ? "ja-JP" : "en-US"}
				/>

				<button
					type="button"
					onClick={onGenerate}
					disabled={loading || !destination}
					className="btn-primary px-5"
				>
					{loading ? "生成中..." : "生成个性行程"}
				</button>
			</div>
		</div>
	);
}


