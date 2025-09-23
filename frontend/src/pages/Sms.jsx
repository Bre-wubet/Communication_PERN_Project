import React, { useEffect, useState } from 'react'
import { useSmsStore } from '../stores/sms.js'

export default function Sms() {
	const { items, isLoading, fetch, send } = useSmsStore()
	const [phoneNumber, setPhoneNumber] = useState('+10000000000')
	const [message, setMessage] = useState('Hello via SMS')

	useEffect(() => { fetch({}) }, [])

	const onSend = async (e) => {
		e.preventDefault()
		await send({ phoneNumber, message })
		await fetch({})
	}

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">SMS</h2>
			<form onSubmit={onSend} className="grid gap-3 max-w-2xl bg-white p-4 rounded-md border border-gray-200">
				<label className="text-sm">
					<span className="text-gray-700">Phone</span>
					<input className="mt-1 w-full border rounded-md px-3 py-2" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} required />
				</label>
				<label className="text-sm">
					<span className="text-gray-700">Message</span>
					<textarea className="mt-1 w-full border rounded-md px-3 py-2" value={message} onChange={e=>setMessage(e.target.value)} rows={3} required />
				</label>
				<button type="submit" className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">Send</button>
			</form>
			<div className="bg-white rounded-md border border-gray-200 overflow-hidden">
				<div className="px-4 py-2 font-medium">Logs</div>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600">
							<tr><th className="text-left p-2">ID</th><th className="text-left p-2">Phone</th><th className="text-left p-2">Message</th><th className="text-left p-2">Status</th><th className="text-left p-2">Created</th></tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr><td className="p-2" colSpan={5}>Loading...</td></tr>
							) : items.length === 0 ? (
								<tr><td className="p-2" colSpan={5}>No data</td></tr>
							) : items.map(i => (
								<tr key={i.id} className="odd:bg-white even:bg-gray-50">
									<td className="p-2">{i.id}</td><td className="p-2">{i.phone}</td><td className="p-2">{i.message}</td><td className="p-2">{i.status}</td><td className="p-2">{new Date(i.createdAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
