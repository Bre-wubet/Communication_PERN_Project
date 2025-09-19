import { create } from 'zustand'

const apiBase = '/api'

export const useAuthStore = create((set, get) => ({
	accessToken: typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null,
	refreshToken: typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null,
	user: null,
	isLoading: false,
	error: null,

	_save(tokens) {
		if (tokens?.accessToken) localStorage.setItem('accessToken', tokens.accessToken)
		if (tokens?.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken)
	},

	clear() {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		set({ accessToken: null, refreshToken: null, user: null })
	},

	async login(email) {
		set({ isLoading: true, error: null })
		try {
			const res = await fetch(`${apiBase}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			})
			if (!res.ok) throw new Error('Login failed')
			const json = await res.json()
			set({ accessToken: json.data.tokens.accessToken, refreshToken: json.data.tokens.refreshToken, user: json.data.user, isLoading: false })
			get()._save(json.data.tokens)
		} catch (e) {
			set({ error: e.message || 'Login failed', isLoading: false })
			throw e
		}
	},

	async refresh() {
		const rt = get().refreshToken
		if (!rt) return
		try {
			const res = await fetch(`${apiBase}/auth/refresh`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken: rt })
			})
			if (!res.ok) throw new Error('Refresh failed')
			const json = await res.json()
			set({ accessToken: json.data.accessToken })
			localStorage.setItem('accessToken', json.data.accessToken)
		} catch (e) {
			get().clear()
		}
	},

	async fetchMe() {
		const at = get().accessToken
		if (!at) return
		const res = await fetch(`${apiBase}/auth/me`, {
			headers: { Authorization: `Bearer ${at}` }
		})
		if (res.ok) {
			const json = await res.json()
			set({ user: json.data })
		}
	},

	logout() {
		get().clear()
	}
}))
