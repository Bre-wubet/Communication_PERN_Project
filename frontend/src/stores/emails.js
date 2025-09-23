import { create } from 'zustand'
import { useAuthStore } from './auth.js'

const api = async (path, init = {}) => {
	const at = useAuthStore.getState().accessToken
	const res = await fetch(`/api${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...(init.headers||{}), ...(at ? { Authorization: `Bearer ${at}` } : {}) }
	})
	if (!res.ok) {
		if (res.status === 401) {
			// Clear tokens and redirect to login
			useAuthStore.getState().clear()
			throw new Error('Authentication required. Please login again.')
		}
		throw new Error(`Request failed: ${res.status} ${res.statusText}`)
	}
	return res.json()
}

export const useEmailsStore = create((set, get) => ({
	items: [],
	isLoading: false,
	error: null,
	page: 1,
	limit: 10,
	total: 0,

	async fetch({ status, to } = {}) {
		set({ isLoading: true, error: null })
		try {
			const params = new URLSearchParams()
			params.set('page', get().page)
			params.set('limit', get().limit)
			if (status) params.set('status', status)
			if (to) params.set('to', to)
			const json = await api(`/emails/logs?${params.toString()}`)
			set({ items: json.data.emailLogs ?? json.data?.emailLogs ?? json.data?.notifications ?? [], total: json.data?.pagination?.total || 0, isLoading: false })
		} catch (e) {
			set({ error: e.message || 'Failed', isLoading: false })
		}
	},

	async send({ to, subject, body, html, provider }) {
		const json = await api('/emails/send', { method: 'POST', body: JSON.stringify({ to, subject, body, html, provider }) })
		return json
	}
}))
