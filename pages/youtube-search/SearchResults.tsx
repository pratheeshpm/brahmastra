import React from 'react'

import { SearchResultsProps, SortOption } from '../../lib/youtube-search/types'
import { formatDescriptionWithLinks, getSortOptionLabel } from '../../lib/youtube-search/utils'

const SearchResults: React.FC<SearchResultsProps> = ({
	searchResults,
	sortOption,
	isSearching,
	selectedVideo,
	selectedVideos,
	expandedDescriptions,
	loadingDescriptions,
	copiedVideoId,
	isAggregatingDocs,
	videoSummaryStatus,
	onSortChange,
	onVideoClick,
	onVideoSelect,
	onSelectAll,
	onDeselectAll,
	onAggregateSelected,
	onExpandDescription,
	onCopyVideo,
}) => {
	// Helper function to render summary status indicator
	const getSummaryStatusIndicator = (videoId: string) => {
		const status = videoSummaryStatus[videoId]
		
		switch (status) {
			case 'valid':
				return (
					<div className="flex items-center gap-1 text-green-400 text-xs" title="Summary available">
						<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
							<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Summary Ready</span>
					</div>
				)
			case 'invalid':
				return (
					<div className="flex items-center gap-1 text-red-400 text-xs" title="Summary failed or rejected">
						<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
							<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Summary Failed</span>
					</div>
				)
			case 'missing':
				return (
					<div className="flex items-center gap-1 text-yellow-400 text-xs" title="No summary available">
						<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
						<span>No Summary</span>
					</div>
				)
			case 'checking':
				return (
					<div className="flex items-center gap-1 text-blue-400 text-xs" title="Checking summary status">
						<div className="animate-spin w-3 h-3 border border-blue-400 border-t-transparent rounded-full"></div>
						<span>Checking...</span>
					</div>
				)
			default:
				return null
		}
	}

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Search Results</h2>

				{/* Sort Dropdown */}
				{searchResults.length > 0 && (
					<div className="flex items-center gap-2">
						<label htmlFor="sort-select" className="text-sm text-gray-300">
							Sort by:
						</label>
						<select
							id="sort-select"
							value={sortOption}
							onChange={(e) => onSortChange(e.target.value as SortOption)}
							className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="relevance">Relevance</option>
							<option value="duration_desc">Duration (Longest First)</option>
							<option value="duration_asc">Duration (Shortest First)</option>
							<option value="views_desc">Most Views</option>
							<option value="recent_first">Most Recent</option>
							<option value="title_asc">Title (A-Z)</option>
							<option value="title_desc">Title (Z-A)</option>
						</select>
					</div>
				)}
			</div>

			{/* Multiselect Controls */}
			{searchResults.length > 0 && (
				<div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
					<div className="flex items-center justify-between flex-wrap gap-2">
						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-300">
								{selectedVideos.size > 0 ? `${selectedVideos.size} selected` : 'Select videos to aggregate summaries'}
							</span>
							<div className="flex items-center gap-2">
								<button
									onClick={onSelectAll}
									className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
								>
									Select All
								</button>
								<button
									onClick={onDeselectAll}
									className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors"
								>
									Clear
								</button>
							</div>
						</div>
						<button
							onClick={onAggregateSelected}
							disabled={selectedVideos.size === 0 || isAggregatingDocs}
							className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center gap-2"
						>
							{isAggregatingDocs ? (
								<>
									<div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full"></div>
									Aggregating...
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									Create Documentation
								</>
							)}
						</button>
					</div>
				</div>
			)}

			{searchResults.length === 0 && !isSearching && (
				<p className="text-gray-400">No results yet. Enter a search term to get started.</p>
			)}

			{/* Results Count and Sort Info */}
			{searchResults.length > 0 && (
				<div className="mb-3 text-sm text-gray-400 flex items-center justify-between">
					<span>
						{searchResults.length} video{searchResults.length !== 1 ? 's' : ''} found
					</span>
					<span className="flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
							/>
						</svg>
						{getSortOptionLabel(sortOption)}
					</span>
				</div>
			)}

			<div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
				{searchResults.map((video, index) => (
					<div
						key={index}
						className={`p-4 bg-gray-800 rounded-lg border-2 transition-all ${
							selectedVideo?.videoId === video.videoId ? 'border-blue-500 bg-gray-700' : 'border-transparent'
						} ${
							selectedVideos.has(video.videoId) ? 'ring-2 ring-green-500' : ''
						}`}
					>
						<div className="flex gap-4">
							{/* Checkbox for multiselect */}
							<div className="flex-shrink-0 flex items-start pt-2">
								<input
									type="checkbox"
									checked={selectedVideos.has(video.videoId)}
									onChange={(e) => onVideoSelect(video.videoId, e.target.checked)}
									className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
									onClick={(e) => e.stopPropagation()}
								/>
							</div>

							{/* Thumbnail */}
							<div className="flex-shrink-0 relative cursor-pointer" onClick={() => onVideoClick(video)}>
								<img
									src={video.thumbnailUrl}
									alt={video.title}
									className="w-32 h-24 object-cover rounded"
									onError={(e) => {
										const target = e.target as HTMLImageElement
										target.src = '/favicon.ico'
									}}
								/>
								{/* Duration badge */}
								<div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
									{video.duration}
								</div>
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0 cursor-pointer" onClick={() => onVideoClick(video)}>
								<h3 className="font-medium text-white mb-3 line-clamp-2">{video.title}</h3>

								{/* Complete Description with Links */}
								<div className="text-sm text-gray-300 mb-3 p-3 bg-gray-900 rounded border border-gray-700 max-h-48 overflow-y-auto">
									<div className="flex justify-between items-start mb-2">
										<span className="text-xs text-gray-400 font-medium">Description:</span>
										<button
											onClick={(e) => onExpandDescription(video, e)}
											disabled={loadingDescriptions[video.videoId]}
											className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
										>
											{loadingDescriptions[video.videoId] ? (
												<>
													<div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
													Loading...
												</>
											) : expandedDescriptions[video.videoId] ? (
												<>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
													</svg>
													Collapse
												</>
											) : (
												<>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
													</svg>
													Full Description
												</>
											)}
										</button>
									</div>
									<div
										className="leading-relaxed whitespace-pre-wrap"
										dangerouslySetInnerHTML={{
											__html: formatDescriptionWithLinks(expandedDescriptions[video.videoId] || video.description),
										}}
									/>
								</div>

								<div className="flex justify-between items-center text-xs">
									<span className="text-gray-500">{video.displayUrl}</span>
									<div className="flex items-center gap-2">
										<span className="text-gray-400">Duration: {video.duration}</span>
										<span className="text-gray-400">•</span>
										<span className="text-gray-400">Video ID: {video.videoId}</span>
										<button
											onClick={(e) => {
												e.stopPropagation()
												onCopyVideo(video.videoId, video.url)
											}}
											className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
												copiedVideoId === video.videoId
													? 'bg-green-600 text-green-100'
													: 'bg-gray-600 hover:bg-gray-700 text-white'
											}`}
											title="Copy YouTube video URL"
										>
											{copiedVideoId === video.videoId ? (
												<>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
													Copied!
												</>
											) : (
												<>
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
														/>
													</svg>
													Share
												</>
											)}
										</button>
										<a
											href={video.url}
											target="_blank"
											rel="noopener noreferrer"
											onClick={(e) => e.stopPropagation()}
											className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
										>
											<svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
												<path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.505A2.999 2.999 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 0 0 2.112 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.386-.505a2.999 2.999 0 0 0 2.112-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
											</svg>
											Watch
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default SearchResults
