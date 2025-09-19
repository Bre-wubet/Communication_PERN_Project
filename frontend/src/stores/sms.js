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

export const useSmsStore = create((set, get) => ({
	items: [],
	isLoading: false,
	error: null,
	page: 1,
	limit: 10,
	total: 0,

	async fetch({ status, phone } = {}) {
		set({ isLoading: true, error: null })
		try {
			const params = new URLSearchParams()
			params.set('page', get().page)
			params.set('limit', get().limit)
			if (status) params.set('status', status)
			if (phone) params.set('phone', phone)
			const json = await api(`/sms/logs?${params.toString()}`)
			set({ items: json.data.smsLogs ?? [], total: json.data?.pagination?.total || 0, isLoading: false })
		} catch (e) {
			set({ error: e.message || 'Failed', isLoading: false })
		}
	},

	async send({ phoneNumber, message, provider }) {
		const json = await api('/sms/send', { method: 'POST', body: JSON.stringify({ phoneNumber, message, provider }) })
		return json
	}
}))
