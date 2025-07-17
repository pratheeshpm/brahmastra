import React from 'react'

interface KeywordsSectionProps {
	keywords: string[]
	showAddKeywordInput: boolean
	newKeywordText: string
	editingKeywordIndex: number | null
	editingKeywordText: string
	onKeywordClick: (keyword: string) => void
	onAddKeyword: () => void
	onEditKeyword: (index: number) => void
	onDeleteKeyword: (index: number) => void
	onSaveKeywordEdit: () => void
	onNewKeywordTextChange: (value: string) => void
	onEditingKeywordTextChange: (value: string) => void
	onShowAddKeywordInput: () => void
	onCancelKeywordEdit: () => void
}

const KeywordsSection: React.FC<KeywordsSectionProps> = ({
	keywords,
	showAddKeywordInput,
	newKeywordText,
	editingKeywordIndex,
	editingKeywordText,
	onKeywordClick,
	onAddKeyword,
	onEditKeyword,
	onDeleteKeyword,
	onSaveKeywordEdit,
	onNewKeywordTextChange,
	onEditingKeywordTextChange,
	onShowAddKeywordInput,
	onCancelKeywordEdit,
}) => {
	const handleCustomKeywordClick = () => {
		onKeywordClick('Custom')
	}

	return (
		<div className="p-4 bg-gray-700 rounded-lg border border-gray-600 mb-4">
			<h4 className="text-sm font-medium text-indigo-400 mb-3 flex items-center gap-2">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
					/>
				</svg>
				Keywords
			</h4>
			<div className="flex flex-wrap gap-2">
				{keywords.map((keyword, index) => (
					<div key={index} className="flex items-center gap-1">
						{editingKeywordIndex === index ? (
							<div className="flex items-center gap-1">
								<input
									type="text"
									value={editingKeywordText}
									onChange={(e) => onEditingKeywordTextChange(e.target.value)}
									className="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
									onKeyPress={(e) => e.key === 'Enter' && onSaveKeywordEdit()}
									autoFocus
								/>
								<button
									onClick={onSaveKeywordEdit}
									className="px-1 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
									title="Save"
								>
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</button>
								<button
									onClick={onCancelKeywordEdit}
									className="px-1 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
									title="Cancel"
								>
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						) : (
							<div className="flex items-center gap-1 group">
								<button
									onClick={() => onKeywordClick(keyword)}
									className="px-3 py-1 text-sm rounded-full transition-all cursor-pointer flex items-center gap-1 hover:scale-105 transform bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg"
									title={`Click to learn more about "${keyword}"`}
								>
									<span>{keyword}</span>
									<svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</button>
								<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
									<button
										onClick={() => onEditKeyword(index)}
										className="px-1 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
										title="Edit keyword"
									>
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
									<button
										onClick={() => onDeleteKeyword(index)}
										className="px-1 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
										title="Delete keyword"
									>
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>
						)}
					</div>
				))}

				{/* Custom Keyword Button */}
				<button
					onClick={handleCustomKeywordClick}
					className="px-3 py-1 text-sm rounded-full transition-all cursor-pointer flex items-center gap-1 hover:scale-105 transform bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg"
					title="Ask a custom question"
				>
					<span>Custom</span>
					<svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</button>

				{/* Add Keyword Button */}
				{showAddKeywordInput ? (
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={newKeywordText}
							onChange={(e) => onNewKeywordTextChange(e.target.value)}
							placeholder="Enter keywords (separate with , ; or newline)"
							className="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-green-500 min-w-48"
							onKeyPress={(e) => e.key === 'Enter' && onAddKeyword()}
							autoFocus
						/>
						<button
							onClick={onAddKeyword}
							className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
						>
							Add
						</button>
						<button
							onClick={() => {
								onShowAddKeywordInput()
								onNewKeywordTextChange('')
							}}
							className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={onShowAddKeywordInput}
						className="px-3 py-1 text-sm rounded-full transition-all cursor-pointer flex items-center gap-1 hover:scale-105 transform bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
						title="Add a new keyword"
					>
						<span>Add</span>
						<svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
					</button>
				)}
			</div>
			<p className="text-xs text-gray-400 mt-2">
				💡 Click keywords for explanations • Hover to edit/delete • "Custom" for queries • "Add" to create new (supports
				multiple: word1, word2; word3)
			</p>
		</div>
	)
}

export default KeywordsSection
