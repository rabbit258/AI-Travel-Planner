"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";

type AuthModalProps = {
	isOpen: boolean;
	onClose: () => void;
	mode?: "signin" | "signup";
};

export default function AuthModal({ isOpen, onClose, mode: initialMode = "signin" }: AuthModalProps) {
	const [mode, setMode] = useState<"signin" | "signup">(initialMode);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { signIn, signUp } = useAuth();

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error: authError } = mode === "signin" ? await signIn(email, password) : await signUp(email, password);

		if (authError) {
			setError(authError.message || "操作失败，请重试");
		} else {
			onClose();
			setEmail("");
			setPassword("");
		}
		setLoading(false);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
				>
					<X size={20} />
				</button>

				<div className="mb-6">
					<h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
						{mode === "signin" ? "登录" : "注册"}
					</h2>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						{mode === "signin" ? "登录以同步和管理你的旅行计划" : "创建账户以保存你的旅行计划"}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
							邮箱
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input w-full"
							placeholder="your@email.com"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
							密码
						</label>
						<input
							type="password"
							required
							minLength={6}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="input w-full"
							placeholder="至少 6 个字符"
						/>
					</div>

					{error && (
						<div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					)}

					<button type="submit" disabled={loading} className="btn-primary w-full">
						{loading ? "处理中..." : mode === "signin" ? "登录" : "注册"}
					</button>
				</form>

				<div className="mt-4 text-center text-sm">
					<button
						type="button"
						onClick={() => {
							setMode(mode === "signin" ? "signup" : "signin");
							setError(null);
						}}
						className="text-brand hover:underline"
					>
						{mode === "signin" ? "还没有账户？注册" : "已有账户？登录"}
					</button>
				</div>
			</div>
		</div>
	);
}

