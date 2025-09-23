import { create } from 'zustand'
import { useAuthStore } from './auth.js'

const api = async (path, init = {}) => {
	const at = useAuthStore.getState().accessToken
	const res = await fetch(`/api${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...(init.headers||{}), ...(at ? { Authorization: `Bearer ${at}` } : {}) }
	})
	if (!res.ok) throw new Error('Request failed')
	return res.json()
}

export const usePushStore = create((set, get) => ({
	items: [],
	isLoading: false,
	error: null,
	page: 1,
	limit: 10,
	total: 0,

	async fetch({ isRead } = {}) {
		set({ isLoading: true, error: null })
		try {
			const params = new URLSearchParams()
			params.set('page', get().page)
			params.set('limit', get().limit)
			if (typeof isRead === 'boolean') params.set('isRead', String(isRead))
			const json = await api(`/push/notifications?${params.toString()}`)
			set({ items: json.data.notifications ?? [], total: json.data?.pagination?.total || 0, isLoading: false })
		} catch (e) {
			set({ error: e.message || 'Failed', isLoading: false })
		}
	},

	async sendToUser({ userId, title, message, data }) {
		const json = await api('/push/send', { method: 'POST', body: JSON.stringify({ userId, title, message, data }) })
		return json
	}
}))
