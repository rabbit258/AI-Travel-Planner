"use client";

import { useMemo, useState } from "react";

export type Expense = {
	id: string;
	category: "交通" | "住宿" | "餐饮" | "门票" | "购物" | "其他";
	title: string;
	amountCNY: number;
	date?: string;
};

type Props = {
	initial?: Expense[];
	onChange?: (expenses: Expense[]) => void;
	className?: string;
	budgetCNY?: number;
};

const categories: Expense["category"][] = ["交通", "住宿", "餐饮", "门票", "购物", "其他"];

export default function ExpenseTracker({ initial = [], onChange, className, budgetCNY }: Props) {
	const [items, setItems] = useState<Expense[]>(initial);
	const [draft, setDraft] = useState<Partial<Expense>>({});

	const totals = useMemo(() => {
		const sum = items.reduce((acc, it) => acc + (it.amountCNY || 0), 0);
		return { sum };
	}, [items]);

	function addItem() {
		if (!draft.title || !draft.amountCNY || !draft.category) return;
		const next: Expense = {
			id: Math.random().toString(36).slice(2),
			category: draft.category,
			title: draft.title,
			amountCNY: Number(draft.amountCNY),
			date: draft.date,
		};
		const list = [next, ...items];
		setItems(list);
		onChange?.(list);
		setDraft({});
	}

	function removeItem(id: string) {
		const list = items.filter((i) => i.id !== id);
		setItems(list);
		onChange?.(list);
	}

	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-3">
				<h2 className="section-title">费用管理</h2>
				<div className="text-sm opacity-80">
					总支出：¥{Math.round(totals.sum)}
					{typeof budgetCNY === "number" && (
						<span className="ml-2">
							预算：¥{Math.round(budgetCNY)}（余：¥{Math.round((budgetCNY ?? 0) - totals.sum)}）
						</span>
					)}
				</div>
			</div>
			<div className="rounded-xl border border-slate-200 p-3 shadow-sm dark:border-slate-800">
				<div className="grid grid-cols-6 gap-2">
					<select
						className="col-span-1 select"
						value={draft.category ?? ""}
						onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Expense["category"] }))}
					>
						<option value="">类别</option>
						{categories.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
					<input
						className="col-span-2 input"
						placeholder="备注，例如：成田快线"
						value={draft.title ?? ""}
						onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
					/>
					<input
						className="col-span-1 input"
						placeholder="金额"
						type="number"
						inputMode="numeric"
						value={draft.amountCNY ?? ""}
						onChange={(e) => setDraft((d) => ({ ...d, amountCNY: Number(e.target.value) }))}
					/>
					<input
						className="col-span-1 input"
						type="date"
						value={draft.date ?? ""}
						onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
					/>
					<button className="col-span-1 btn-primary" onClick={addItem}>
						添加
					</button>
				</div>
				<ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
					{items.map((it) => (
						<li key={it.id} className="py-2 flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<span className="badge">{it.category}</span>
								<span className="font-medium">{it.title}</span>
								{it.date && <span className="opacity-70">{it.date}</span>}
							</div>
							<div className="flex items-center gap-4">
								<span className="font-medium">¥{Math.round(it.amountCNY)}</span>
								<button className="btn-outline text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={() => removeItem(it.id)}>
									删除
								</button>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}


