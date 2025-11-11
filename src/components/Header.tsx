"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { LogIn, LogOut, User } from "lucide-react";

export default function Header() {
	const { user, signOut } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);

	return (
		<>
			<header className="sticky top-2 z-40 mb-4 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
				<div className="flex items-center justify-between">
					<div className="text-xl font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
						Travel AI Planner
					</div>
					<nav className="flex items-center gap-3">
						<span className="badge">Plan</span>
						<span className="badge">Map</span>
						<span className="badge">Budget</span>
						<span className="badge">Sync</span>
						{user ? (
							<div className="flex items-center gap-2">
								<span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
									<User size={14} />
									{user.email}
								</span>
								<button
									onClick={() => signOut()}
									className="btn-outline inline-flex items-center gap-1.5 text-xs"
								>
									<LogOut size={14} />
									登出
								</button>
							</div>
						) : (
							<button
								onClick={() => setAuthModalOpen(true)}
								className="btn-primary inline-flex items-center gap-1.5 text-xs"
							>
								<LogIn size={14} />
								登录
							</button>
						)}
					</nav>
				</div>
			</header>
			<AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
		</>
	);
}

