import React from 'react'
import { useAuthStore } from '../stores/auth.js'
import Login from '../pages/Login.jsx'

export default function Protected({ children, onLoggedIn }) {
	const { accessToken } = useAuthStore()
	if (!accessToken) return (
		<div className="min-h-full flex items-center justify-center bg-gray-50 p-6">
			<div className="w-full max-w-md">
				<Login onLoggedIn={onLoggedIn} />
			</div>
		</div>
	)
	return <>{children}</>
}
