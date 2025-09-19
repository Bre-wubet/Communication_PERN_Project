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

export const useCommentsStore = create((set, get) => ({
	comments: [],
	isLoading: false,
	error: null,
	page: 1,
	limit: 10,
	total: 0,

	async fetch({ search } = {}) {
		set({ isLoading: true, error: null })
		try {
			const params = new URLSearchParams()
			params.set('page', get().page)
			params.set('limit', get().limit)
			if (search) params.set('search', search)
			const json = await api(`/comments?${params.toString()}`)
			set({ comments: json.data.comments ?? [], total: json.data?.pagination?.total || 0, isLoading: false })
		} catch (e) {
			set({ error: e.message || 'Failed', isLoading: false })
		}
	},

	async create({ content }) {
		const json = await api('/comments', { method: 'POST', body: JSON.stringify({ content }) })
		return json
	}
}))
