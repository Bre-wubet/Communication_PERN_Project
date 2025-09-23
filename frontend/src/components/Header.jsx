import React from 'react'
import { useAuthStore } from '../stores/auth.js'

export default function Header({ tab, setTab }) {
	const { user, logout } = useAuthStore()
	const tabBtn = (key, label) => (
		<button className={`px-3 py-2 rounded-md text-sm font-medium ${tab===key?'bg-blue-600 text-white':'hover:bg-gray-100'}`} onClick={() => setTab(key)}>{label}</button>
	)
	return (
		<header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 bg-white">
			<strong className="text-lg">Communication Dashboard</strong>
			<nav className="flex gap-1">
				{tabBtn('dashboard','Dashboard')}
				{tabBtn('emails','Emails')}
				{tabBtn('sms','SMS')}
				{tabBtn('push','Push')}
				{tabBtn('comments','Comments')}
			</nav>
			<div className="flex-1" />
			<div className="flex items-center gap-2">
				{user && <span className="text-sm text-gray-600">{user.email} ({user.role})</span>}
				{user && <button className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200" onClick={logout}>Logout</button>}
			</div>
		</header>
	)
}
