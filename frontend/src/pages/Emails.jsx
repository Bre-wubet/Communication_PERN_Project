import React, { useEffect, useState } from 'react'
import { useEmailsStore } from '../stores/emails.js'

export default function Emails() {
	const { items, isLoading, error, fetch, send } = useEmailsStore()
	const [to, setTo] = useState('user@example.com')
	const [subject, setSubject] = useState('Hello')
	const [body, setBody] = useState('This is a test email')

	useEffect(() => { fetch({}) }, [])

	const onSend = async (e) => {
		e.preventDefault()
		await send({ to, subject, body })
		await fetch({})
	}

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">Emails</h2>
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
					{error}
				</div>
			)}
			<form onSubmit={onSend} className="grid gap-3 max-w-2xl bg-white p-4 rounded-md border border-gray-200">
				<label className="text-sm">
					<span className="text-gray-700">To</span>
					<input className="mt-1 w-full border rounded-md px-3 py-2" value={to} onChange={e=>setTo(e.target.value)} required />
				</label>
				<label className="text-sm">
					<span className="text-gray-700">Subject</span>
					<input className="mt-1 w-full border rounded-md px-3 py-2" value={subject} onChange={e=>setSubject(e.target.value)} required />
				</label>
				<label className="text-sm">
					<span className="text-gray-700">Body</span>
					<textarea className="mt-1 w-full border rounded-md px-3 py-2" value={body} onChange={e=>setBody(e.target.value)} rows={4} required />
				</label>
				<button type="submit" className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">Send</button>
			</form>
			<div className="bg-white rounded-md border border-gray-200 overflow-hidden">
				<div className="px-4 py-2 font-medium">Logs</div>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr><th className="text-left p-2">ID</th><th className="text-left p-2">To</th><th className="text-left p-2">Subject</th><th className="text-left p-2">Status</th><th className="text-left p-2">Created</th></tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr><td className="p-2" colSpan={5}>Loading...</td></tr>
							) : items.length === 0 ? (
								<tr><td className="p-2" colSpan={5}>No data</td></tr>
							) : items.map(i => (
								<tr key={i.id} className="odd:bg-white even:bg-gray-50">
									<td className="p-2">{i.id}</td><td className="p-2">{i.to}</td><td className="p-2">{i.subject}</td><td className="p-2">{i.status}</td><td className="p-2">{new Date(i.createdAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
