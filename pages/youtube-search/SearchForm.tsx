import React from 'react';
import Link from 'next/link';

import { SearchFormProps } from '../../lib/youtube-search/types'

const SearchForm: React.FC<SearchFormProps> = ({
	searchTerm,
	isSearching,
	onSearchTermChange,
	onSearch,
	onGeneralTopicClick,
}) => {
	return (
		<div className="mb-4 flex-shrink-0">
			<div className="flex items-center justify-between mb-2">
				<h1 className="text-2xl font-bold">YouTube Video Search</h1>
				<div className="flex items-center gap-3">
					<button
						onClick={onGeneralTopicClick}
						className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
						title="Ask AI"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
						Ask AI
					</button>
					<Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
						← Back to Chat
					</Link>
				</div>
			</div>
			<p className="text-gray-300 text-sm mb-4">
				Search for YouTube videos and view their transcripts
				<span className="text-xs text-gray-400 ml-2">
					💡 Tip: Use URL parameters like <code className="bg-gray-800 px-1 rounded">?q=your+search+term</code>
				</span>
			</p>

			<form onSubmit={onSearch} className="flex gap-4">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => onSearchTermChange(e.target.value)}
					placeholder="Enter search term..."
					className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
					disabled={isSearching}
				/>
				<button
					type="submit"
					disabled={isSearching || !searchTerm.trim()}
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
				>
					{isSearching ? 'Searching...' : 'Search'}
				</button>
			</form>
		</div>
	)
}

export default SearchForm
