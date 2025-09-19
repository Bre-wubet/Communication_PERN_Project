import React, { useEffect, useState } from 'react'
import { usePushStore } from '../stores/push.js'

export default function Push() {
	const { items, isLoading, fetch, sendToUser } = usePushStore()
	const [userId, setUserId] = useState('1')
	const [title, setTitle] = useState('Hello')
	const [message, setMessage] = useState('This is a push notification')

	useEffect(() => { fetch({}) }, [])

	const onSend = async (e) => {
		e.preventDefault()
		await sendToUser({ userId: Number(userId), title, message })
		await fetch({})
	}

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">Push</h2>
			<form onSubmit={onSend} className="grid gap-3 max-w-2xl bg-white p-4 rounded-md border border-gray-200">
				<label className="text-sm">
					<span className="text-gray-700">User ID</span>
					<input className="mt-1 w-full border rounded-md px-3 py-2" value={userId} onChange={e=>setUserId(e.target.value)} required />
				</label>
				<label className="text-sm">
					<span className="text-gray-700">Title</span>
					<input className="mt-1 w-full border rounded-md px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} required />
				</label>
				<label className="text-sm">
					<span className="text-gray-700">Message</span>
					<textarea className="mt-1 w-full border rounded-md px-3 py-2" value={message} onChange={e=>setMessage(e.target.value)} rows={3} required />
				</label>
				<button type="submit" className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">Send</button>
			</form>
			<div className="bg-white rounded-md border border-gray-200 overflow-hidden">
				<div className="px-4 py-2 font-medium">Notifications</div>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr><th className="text-left p-2">ID</th><th className="text-left p-2">UserId</th><th className="text-left p-2">Title</th><th className="text-left p-2">Message</th><th className="text-left p-2">Read</th><th className="text-left p-2">Created</th></tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr><td className="p-2" colSpan={6}>Loading...</td></tr>
							) : items.length === 0 ? (
								<tr><td className="p-2" colSpan={6}>No data</td></tr>
							) : items.map(i => (
								<tr key={i.id} className="odd:bg-white even:bg-gray-50">
									<td className="p-2">{i.id}</td><td className="p-2">{i.userId}</td><td className="p-2">{i.title}</td><td className="p-2">{i.message}</td><td className="p-2">{String(i.isRead)}</td><td className="p-2">{new Date(i.createdAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
