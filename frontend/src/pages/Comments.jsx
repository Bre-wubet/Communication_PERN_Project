import React, { useEffect, useState } from 'react'
import { useCommentsStore } from '../stores/comments.js'

export default function Comments() {
	const { comments, isLoading, fetch, create } = useCommentsStore()
	const [content, setContent] = useState('This is a comment')

	useEffect(() => { fetch({}) }, [])

	const onCreate = async (e) => {
		e.preventDefault()
		await create({ content })
		setContent('')
		await fetch({})
	}

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">Comments</h2>
			<form onSubmit={onCreate} className="grid gap-3 max-w-2xl bg-white p-4 rounded-md border border-gray-200">
				<label className="text-sm">
					<span className="text-gray-700">Content</span>
					<textarea className="mt-1 w-full border rounded-md px-3 py-2" value={content} onChange={e=>setContent(e.target.value)} rows={3} required />
				</label>
				<button type="submit" className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">Create</button>
			</form>
			<div className="bg-white rounded-md border border-gray-200">
				<div className="px-4 py-2 font-medium">Recent</div>
				<ul className="divide-y">
					{isLoading ? (
						<li className="p-3">Loading...</li>
					) : comments.length === 0 ? (
						<li className="p-3">No data</li>
					) : comments.map(c => (
						<li className="p-3" key={c.id}><strong className="mr-2">#{c.id}</strong> {c.content} <em className="text-gray-500 ml-2">{new Date(c.createdAt).toLocaleString()}</em></li>
					))}
				</ul>
			</div>
		</div>
	)
}
