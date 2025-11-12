import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const missingConfigError =
	"Supabase 环境变量未配置。请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY。";

const missingConfig = new Error(missingConfigError);

const placeholderBuilder: any = {
	select() {
		return this;
	},
	insert() {
		return this;
	},
	update() {
		return this;
	},
	delete() {
		return this;
	},
	eq() {
		return this;
	},
	order() {
		return this;
	},
	single() {
		return this;
	},
	maybeSingle() {
		return this;
	},
	throwOnError() {
		return this;
	},
	then(onFulfilled?: any, onRejected?: any) {
		return Promise.reject(missingConfig).then(onFulfilled, onRejected);
	},
	catch(onRejected?: any) {
		return Promise.reject(missingConfig).catch(onRejected);
	},
	finally(onFinally?: any) {
		return Promise.reject(missingConfig).finally(onFinally);
	},
};

const placeholderClient = {
	auth: {
		async getSession() {
			if (process.env.NODE_ENV !== "production") {
				console.warn(missingConfigError);
			}
			return { data: { session: null }, error: missingConfig };
		},
		async getUser() {
			if (process.env.NODE_ENV !== "production") {
				console.warn(missingConfigError);
			}
			return { data: { user: null }, error: missingConfig };
		},
		async signInWithPassword() {
			return { data: null, error: missingConfig };
		},
		async signUp() {
			return { data: null, error: missingConfig };
		},
		async signOut() {
			return { error: missingConfig };
		},
	},
	from() {
		if (process.env.NODE_ENV !== "production") {
			console.warn(missingConfigError);
		}
		return placeholderBuilder;
	},
} as unknown as SupabaseClient;

export async function createClient(): Promise<SupabaseClient> {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		console.error(missingConfigError);
		return placeholderClient;
	}

	const cookieStore = await cookies();

	return createServerClient(url, anonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options)
					);
				} catch {
					// ignore setAll errors in Server Components
				}
			},
		},
	});
}

