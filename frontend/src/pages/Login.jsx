import React, { useState } from 'react'
import { useAuthStore } from '../stores/auth.js'

export default function Login({ onLoggedIn }) {
	const login = useAuthStore((s) => s.login)
	const isLoading = useAuthStore((s) => s.isLoading)
	const error = useAuthStore((s) => s.error)
    const [email, setEmail] = useState('brwubet@gmail.com')

	const onSubmit = async (e) => {
		e.preventDefault()
		await login(email)
		onLoggedIn?.()
	}

	return (
		<div className="bg-white shadow rounded-lg p-6">
			<h1 className="text-xl font-semibold mb-4">Sign in</h1>
			<form onSubmit={onSubmit} className="space-y-4">
				<label className="block text-sm">
					<span className="text-gray-700">Email</span>
					<input className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
				</label>
				<button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 disabled:opacity-60">{isLoading ? 'Signing in...' : 'Sign In'}</button>
				{error && <div className="text-sm text-red-600">{error}</div>}
			</form>
		</div>
	)
}
