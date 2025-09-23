import React, { useEffect, useState } from 'react'
import Protected from './components/Protected.jsx'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Emails from './pages/Emails.jsx'
import Sms from './pages/Sms.jsx'
import Push from './pages/Push.jsx'
import Comments from './pages/Comments.jsx'
import { useAuthStore } from './stores/auth.js'

function App() {
	const { accessToken, user, fetchMe } = useAuthStore()
	const [tab, setTab] = useState('dashboard')

	useEffect(() => { if (accessToken && !user) fetchMe() }, [accessToken, user, fetchMe])

	return (
		<Protected onLoggedIn={() => setTab('dashboard')}>
			<Header tab={tab} setTab={setTab} />
			<main style={{ padding: 16 }}>
				{tab === 'dashboard' && <Dashboard />}
				{tab === 'emails' && <Emails />}
				{tab === 'sms' && <Sms />}
				{tab === 'push' && <Push />}
				{tab === 'comments' && <Comments />}
			</main>
		</Protected>
	)
}

export default App
