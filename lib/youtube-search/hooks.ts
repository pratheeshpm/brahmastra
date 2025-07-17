import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { SearchResponse, SortOption, TranscriptResponse, YouTubeSearchResult, YouTubeSearchState } from './types'
import { sanitizeKeywordForId, sortResults } from './utils'

// Initial state for the YouTube search
const initialState: YouTubeSearchState = {
	searchTerm: '',
	searchResults: [],
	originalSearchResults: [],
	sortOption: 'relevance',
	isSearching: false,
	selectedTranscript: null,
	isLoadingTranscript: false,
	selectedVideo: null,
	selectedVideos: new Set<string>(),
	lastTranscriptSource: null,
	expandedDescriptions: {},
	loadingDescriptions: {},
	showSummary: false,
	summary: null,
	isLoadingSummary: false,
	lastSummarySource: null,
	copiedVideoId: null,
	showManualInput: false,
	manualTranscript: '',
	isSavingManualTranscript: false,
	isEditingTranscript: false,
	editedTranscript: '',
	isSavingTranscript: false,
	isEditingSummary: false,
	editedSummary: '',
	isSavingSummary: false,
	keywords: [],
	isLoadingKeywords: false,
	copiedKeyword: null,
	showKeywordModal: false,
	selectedKeyword: null,
	keywordExplanation: null,
	isLoadingExplanation: false,
	showCustomKeywordInput: false,
	customKeywordQuery: '',
	showAddKeywordInput: false,
	newKeywordText: '',
	editingKeywordIndex: null,
	editingKeywordText: '',
	isRetryingMermaid: false,
	isEditingExplanation: false,
	editedExplanation: '',
	showGeneralTopicInput: false,
	generalTopicQuery: '',
	isLoadingGeneralExplanation: false,
	isAggregatingDocs: false,
	videoSummaryStatus: {},
}

// Main hook for YouTube search functionality
export const useYouTubeSearch = () => {
	const router = useRouter()
	const [state, setState] = useState<YouTubeSearchState>(initialState)

	// Helper function to update state
	const updateState = useCallback((updates: Partial<YouTubeSearchState>) => {
		setState((prev) => ({ ...prev, ...updates }))
	}, [])

	// Handle URL query parameters on component mount
	useEffect(() => {
		if (router.isReady) {
			const { q, query } = router.query
			const searchQuery = (q || query) as string

			if (searchQuery && searchQuery.trim()) {
				updateState({ searchTerm: searchQuery })
				performSearch(searchQuery)
			}
		}
	}, [router.isReady, router.query])

	// Helper function to check summary status for a video
	const checkSummaryStatus = useCallback(async (videoId: string) => {
		setState((prev: YouTubeSearchState) => ({
			...prev,
			videoSummaryStatus: {
				...prev.videoSummaryStatus,
				[videoId]: 'checking'
			}
		}))

		try {
			const summaryResponse = await fetch(`/api/youtube/summary-cache?videoId=${videoId}`)
			if (summaryResponse.ok) {
				const summaryData = await summaryResponse.json()
				if (summaryData.cached && summaryData.cached.length > 0) {
					const cacheData = summaryData.cached[0]
					if (cacheData.summary && cacheData.summary.trim()) {
						const summaryText = cacheData.summary.trim()
						const status = (summaryText.includes("I'm sorry, I cannot assist") || 
						               summaryText.includes("Failed to generate summary") ||
						               summaryText.length < 50) ? 'invalid' : 'valid'
						
						setState((prev: YouTubeSearchState) => ({
							...prev,
							videoSummaryStatus: {
								...prev.videoSummaryStatus,
								[videoId]: status
							}
						}))
						return status
					}
				}
			}
			
			setState((prev: YouTubeSearchState) => ({
				...prev,
				videoSummaryStatus: {
					...prev.videoSummaryStatus,
					[videoId]: 'missing'
				}
			}))
			return 'missing'
		} catch (error) {
			console.error(`Error checking summary status for video ${videoId}:`, error)
			setState((prev: YouTubeSearchState) => ({
				...prev,
				videoSummaryStatus: {
					...prev.videoSummaryStatus,
					[videoId]: 'missing'
				}
			}))
			return 'missing'
		}
	}, [])

	// Batch check summary status for multiple videos
	const batchCheckSummaryStatus = useCallback(async (videos: YouTubeSearchResult[]) => {
		for (const video of videos) {
			// Don't check if we already have a status for this video
			if (!state.videoSummaryStatus[video.videoId]) {
				checkSummaryStatus(video.videoId)
			}
		}
	}, [state.videoSummaryStatus, checkSummaryStatus])

	// Sort results whenever sortOption changes
	useEffect(() => {
		if (state.originalSearchResults.length > 0) {
			const sortedResults = sortResults(state.originalSearchResults, state.sortOption)
			updateState({ searchResults: sortedResults })
			
			// Check summary status for all videos
			batchCheckSummaryStatus(sortedResults)
		}
	}, [state.sortOption, state.originalSearchResults, batchCheckSummaryStatus])

	// Auto-generate keywords when summary view is shown and no keywords exist
	useEffect(() => {
		const shouldAutoGenerateKeywords =
			state.showSummary &&
			state.summary &&
			state.summary.trim() &&
			state.selectedVideo &&
			state.keywords.length === 0 &&
			!state.isLoadingKeywords &&
			!state.summary.includes('Failed to generate summary')

		if (shouldAutoGenerateKeywords) {
			console.log('🤖 Auto-generating keywords for summary view...')
			handleGenerateKeywords()
		}
	}, [state.showSummary, state.summary, state.selectedVideo, state.keywords.length, state.isLoadingKeywords])

	// Perform search function
	const performSearch = useCallback(
		async (query: string) => {
			if (!query.trim()) return

			updateState({
				isSearching: true,
				selectedTranscript: null,
				selectedVideo: null,
			})

			try {
				const response = await fetch(`/api/bing-search?query=${encodeURIComponent(query)}`)
				const data: SearchResponse = await response.json()

				if (data.webPages && data.webPages.value) {
					updateState({
						originalSearchResults: data.webPages.value,
						searchResults: sortResults(data.webPages.value, state.sortOption),
					})
				} else {
					console.error('Search failed:', data)
					updateState({
						searchResults: [],
						originalSearchResults: [],
					})
				}
			} catch (error) {
				console.error('Search error:', error)
				updateState({
					searchResults: [],
					originalSearchResults: [],
				})
			} finally {
				updateState({ isSearching: false })
			}
		},
		[state.sortOption],
	)

	// Handle search form submission
	const handleSearch = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault()
			if (!state.searchTerm.trim()) return

			// Update URL with search query
			router.push(
				{
					pathname: '/youtube-search',
					query: { q: state.searchTerm },
				},
				undefined,
				{ shallow: true },
			)

			// Perform the search
			await performSearch(state.searchTerm)
		},
		[state.searchTerm, router, performSearch],
	)

	// Handle video click
	const handleVideoClick = useCallback(async (video: YouTubeSearchResult) => {
		updateState({
			selectedVideo: video,
			isLoadingTranscript: true,
			selectedTranscript: null,
			summary: null,
			showSummary: false,
			lastSummarySource: null,
			showManualInput: false,
			manualTranscript: '',
			isEditingTranscript: false,
			editedTranscript: '',
			isEditingSummary: false,
			editedSummary: '',
			keywords: [],
			isLoadingKeywords: false,
			copiedKeyword: null,
			showKeywordModal: false,
			selectedKeyword: null,
			keywordExplanation: null,
			isLoadingExplanation: false,
			showCustomKeywordInput: false,
			customKeywordQuery: '',
			showAddKeywordInput: false,
			newKeywordText: '',
			editingKeywordIndex: null,
			editingKeywordText: '',
			isRetryingMermaid: false,
			isEditingExplanation: false,
			editedExplanation: '',
		})

		// Check summary status in background
		checkSummaryStatus(video.videoId)

		// Check for cached summary first
		let hasCachedSummary = false
		try {
			const summaryResponse = await fetch(`/api/youtube/summary-cache?videoId=${video.videoId}`)
			if (summaryResponse.ok) {
				const summaryData = await summaryResponse.json()
				if (summaryData.cached && summaryData.cached.length > 0) {
					const cacheData = summaryData.cached[0]
					if (cacheData.summary && cacheData.summary.trim()) {
						updateState({
							summary: cacheData.summary,
							lastSummarySource: 'cache',
							showSummary: true,
						})
						hasCachedSummary = true

						if (cacheData.keywords && Array.isArray(cacheData.keywords)) {
							updateState({ keywords: cacheData.keywords })
							console.log(`✅ Loaded ${cacheData.keywords.length} keywords from cache`)
						}

						console.log('✅ Found cached summary, showing summary view first')
					}
				}
			}
		} catch (error) {
			console.error('Error checking cached summary:', error)
		}

		// Fetch transcript
		try {
			const encodedTitle = encodeURIComponent(video.title)
			const response = await fetch(
				`/api/youtube/transcript?video_id=${video.videoId}&format=text&title=${encodedTitle}`,
			)
			const data: TranscriptResponse = await response.json()

			console.log('Transcript API response:', data)

			if (data.text) {
				updateState({
					selectedTranscript: data.text,
					lastTranscriptSource: data.source || 'api',
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else if (data.success && data.text) {
				updateState({
					selectedTranscript: data.text,
					lastTranscriptSource: data.source || 'api',
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else if (data.transcript && Array.isArray(data.transcript)) {
				const transcriptText = data.transcript.map((item) => item.text).join(' ')
				updateState({
					selectedTranscript: transcriptText,
					lastTranscriptSource: data.source || 'api',
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else if (data.error === 'rate_limited') {
				updateState({
					selectedTranscript: `⚠️ Rate Limited by YouTube\n\n${
						data.message || 'YouTube is blocking transcript requests from your network.'
					}\n\nSuggestions:\n• Switch to a different WiFi network\n• Use mobile data instead of WiFi\n• Wait 15-30 minutes and try again\n• Try a VPN if available\n\nThis is a temporary limitation imposed by YouTube's anti-bot measures.`,
					lastTranscriptSource: null,
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else if (data.error === 'timeout') {
				updateState({
					selectedTranscript: `⏱️ Request Timed Out\n\n${
						data.message || 'Transcript extraction took too long and was cancelled.'
					}\n\nThis usually happens when:\n• YouTube is blocking your network\n• The video has very long transcripts\n• Network connection is slow\n\nSuggestions:\n• Try switching networks\n• Wait a few minutes and retry\n• Try a different video first`,
					lastTranscriptSource: null,
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else if (data.error) {
				updateState({
					selectedTranscript: `Error: ${data.error}`,
					lastTranscriptSource: null,
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else {
				updateState({
					selectedTranscript: 'Transcript not available for this video.',
					lastTranscriptSource: null,
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			}
		} catch (error) {
			console.error('Transcript error:', error)

			if (error instanceof Error && error.message.includes('429')) {
				updateState({
					selectedTranscript: `⚠️ Rate Limited by YouTube\n\nYouTube is blocking transcript requests from your network.\n\nSuggestions:\n• Switch to a different WiFi network\n• Use mobile data instead of WiFi\n• Wait 15-30 minutes and try again\n• Try a VPN if available\n\nThis is a temporary limitation imposed by YouTube's anti-bot measures.`,
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			} else {
				updateState({
					selectedTranscript: 'Failed to load transcript.',
					// Preserve showSummary state if we have a cached summary
					...(hasCachedSummary && { showSummary: true }),
				})
			}
		} finally {
			updateState({ 
				isLoadingTranscript: false,
				// Preserve showSummary state if we have a cached summary
				...(hasCachedSummary && { showSummary: true }),
			})
		}
	}, [])

	// Handle keyword generation
	const handleGenerateKeywords = useCallback(async () => {
		if (!state.summary || !state.summary.trim() || !state.selectedVideo) return

		updateState({ isLoadingKeywords: true })
		try {
			const response = await fetch('/api/youtube/keywords', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					summary: state.summary.trim(),
					model_id: 'gpt-4o-mini',
					max_keywords: 8,
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
				}),
			})

			if (response.ok) {
				const data = await response.json()
				if (data.success && data.keywords) {
					updateState({ keywords: data.keywords })
					console.log('✅ Keywords generated and cached successfully')
				} else {
					console.error('❌ Failed to generate keywords:', data.error)
				}
			} else {
				console.error('❌ Keywords API request failed')
			}
		} catch (error) {
			console.error('❌ Error generating keywords:', error)
		} finally {
			updateState({ isLoadingKeywords: false })
		}
	}, [state.summary, state.selectedVideo])

	// Handle summarize transcript
	const handleSummarizeTranscript = useCallback(async (forceRefresh = false) => {
		if (!state.selectedTranscript || state.selectedTranscript.includes('Error:') || state.selectedTranscript.includes('Transcript not available') || !state.selectedVideo) {
			return
		}

		updateState({
			isLoadingSummary: true,
			summary: null,
			lastSummarySource: null,
		})

		try {
			const response = await fetch('/api/youtube/summarize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					transcript: state.selectedTranscript,
					model_id: 'gpt-4o',
					video_id: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					force_refresh: forceRefresh,
				}),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			// Check if this was from cache
			const cacheStatus = response.headers.get('X-Cache-Status')
			updateState({ lastSummarySource: cacheStatus === 'hit' ? 'cache' : 'api' })

			// Handle Server-Sent Events streaming
			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error('No response body')
			}

			let summaryText = ''
			const decoder = new TextDecoder()
			let buffer = ''

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split('\n')
				buffer = lines.pop() || '' // Keep incomplete line in buffer

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6))
							
							if (data.content) {
								summaryText += data.content
								updateState({ summary: summaryText })
							} else if (data.done) {
								// Stream completed
								break
							} else if (data.error) {
								throw new Error(data.error)
							}
						} catch (parseError) {
							console.warn('Failed to parse SSE data:', line)
						}
					}
				}
			}
		} catch (error) {
			console.error('Summarization error:', error)
			updateState({
				summary: 'Failed to generate summary. Please try again.',
				lastSummarySource: null,
			})
		} finally {
			updateState({ isLoadingSummary: false })
		}
	}, [state.selectedTranscript, state.selectedVideo])

	// Handle manual transcript submit
	const handleManualTranscriptSubmit = useCallback(async () => {
		if (!state.manualTranscript.trim() || !state.selectedVideo) return

		const cleanTranscript = state.manualTranscript.trim()
		updateState({ isSavingManualTranscript: true })
		
		try {
			const cacheResponse = await fetch('/api/youtube/cache', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					transcript: cleanTranscript,
					method: 'manual_input',
					source: 'manual'
				}),
			})

			if (cacheResponse.ok) {
				console.log('✅ Manual transcript saved to cache')
				updateState({ 
					lastTranscriptSource: 'cache',
					selectedTranscript: cleanTranscript,
					showManualInput: false,
					manualTranscript: '',
				})
			} else {
				console.warn('⚠️ Failed to save manual transcript to cache')
				updateState({ 
					lastTranscriptSource: null,
					selectedTranscript: cleanTranscript,
					showManualInput: false,
					manualTranscript: '',
				})
			}
		} catch (error) {
			console.error('❌ Error saving manual transcript to cache:', error)
			updateState({ 
				lastTranscriptSource: null,
				selectedTranscript: cleanTranscript,
				showManualInput: false,
				manualTranscript: '',
			})
		} finally {
			updateState({ isSavingManualTranscript: false })
		}
	}, [state.manualTranscript, state.selectedVideo])

	// Handle save transcript
	const handleSaveTranscript = useCallback(async () => {
		if (!state.selectedVideo || !state.editedTranscript.trim()) return

		updateState({ isSavingTranscript: true })
		try {
			const response = await fetch('/api/youtube/cache', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					transcript: state.editedTranscript.trim(),
				}),
			})

			if (response.ok) {
				console.log('✅ Transcript updated successfully')
				updateState({
					selectedTranscript: state.editedTranscript.trim(),
					lastTranscriptSource: 'cache',
					isEditingTranscript: false,
					summary: null,
					lastSummarySource: null,
				})
			} else {
				console.error('❌ Failed to update transcript')
			}
		} catch (error) {
			console.error('❌ Error updating transcript:', error)
		} finally {
			updateState({ isSavingTranscript: false })
		}
	}, [state.selectedVideo, state.editedTranscript])

	// Handle save summary
	const handleSaveSummary = useCallback(async () => {
		if (!state.selectedVideo || !state.editedSummary.trim()) return

		updateState({ isSavingSummary: true })
		try {
			const response = await fetch('/api/youtube/summary-cache', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					summary: state.editedSummary.trim(),
					model: 'gpt-4o-mini',
				}),
			})

			if (response.ok) {
				console.log('✅ Summary updated successfully')
				updateState({
					summary: state.editedSummary.trim(),
					lastSummarySource: 'cache',
					isEditingSummary: false,
				})
			} else {
				console.error('❌ Failed to update summary')
			}
		} catch (error) {
			console.error('❌ Error updating summary:', error)
		} finally {
			updateState({ isSavingSummary: false })
		}
	}, [state.selectedVideo, state.editedSummary])

	// Handle video selection for multiselect
	const handleVideoSelect = useCallback((videoId: string, selected: boolean) => {
		setState((prevState: YouTubeSearchState) => {
			const newSelectedVideos = new Set(prevState.selectedVideos)
			if (selected) {
				newSelectedVideos.add(videoId)
			} else {
				newSelectedVideos.delete(videoId)
			}
			return { ...prevState, selectedVideos: newSelectedVideos }
		})
	}, [])

	// Handle select all videos
	const handleSelectAll = useCallback(() => {
		const allVideoIds = new Set(state.searchResults.map(video => video.videoId))
		updateState({ selectedVideos: allVideoIds })
	}, [state.searchResults])

	// Handle deselect all videos
	const handleDeselectAll = useCallback(() => {
		updateState({ selectedVideos: new Set<string>() })
	}, [])

	// Handle aggregating selected summaries
	const handleAggregateSelected = useCallback(async () => {
		if (state.selectedVideos.size === 0) {
			alert('Please select at least one video to aggregate summaries.')
			return
		}

		updateState({ isAggregatingDocs: true })

		try {
			console.log(`🔄 Aggregating summaries from ${state.selectedVideos.size} selected videos...`)
			
			// Fetch summaries for all selected videos
			const summaries: Array<{ title: string; summary: string; videoId: string }> = []
			const videosWithoutSummaries: Array<{ title: string; videoId: string; reason?: string }> = []
			
			for (const videoId of Array.from(state.selectedVideos)) {
				const video = state.searchResults.find(v => v.videoId === videoId)
				if (!video) continue

				try {
					console.log(`📋 Checking summary for video: ${videoId} - ${video.title}`)
					
					// First check if we have cached summaryimage.pnghere is the screenshot
					const summaryResponse = await fetch(`/api/youtube/summary-cache?videoId=${videoId}`)
					if (summaryResponse.ok) {
						const summaryData = await summaryResponse.json()
						console.log(`📋 Summary cache response for ${videoId}:`, {
							hasCached: summaryData.cached && summaryData.cached.length > 0,
							count: summaryData.count
						})
						
						if (summaryData.cached && summaryData.cached.length > 0) {
							const cacheData = summaryData.cached[0]
							
							// Check if the cached data has a summary field
							if (cacheData.summary && cacheData.summary.trim()) {
								const summaryText = cacheData.summary.trim()
								
								// Check if it's a valid summary (not an error message)
								const isValidSummary = !summaryText.includes("I'm sorry, I cannot assist") && 
													   !summaryText.includes("I cannot provide") &&
													   !summaryText.includes("I'm not able to") &&
													   summaryText.length > 50 // Reasonable minimum length
								
								if (isValidSummary) {
									summaries.push({
										title: video.title,
										summary: summaryText,
										videoId: videoId
									})
									console.log(`✅ Found valid cached summary for ${videoId}`)
									continue
								} else {
									console.log(`❌ Invalid cached summary for ${videoId}: ${summaryText.substring(0, 100)}...`)
									videosWithoutSummaries.push({
										title: video.title,
										videoId: videoId,
										reason: 'Summary was rejected by AI (inappropriate content)'
									})
									continue
								}
							} else {
								console.log(`❌ No summary content in cached data for ${videoId}`)
								videosWithoutSummaries.push({
									title: video.title,
									videoId: videoId,
									reason: 'Cached metadata exists but summary content is missing'
								})
								continue
							}
						}
					}
					
					// If no cached summary, add to missing list
					console.log(`❌ No cached summary found for ${videoId}`)
					videosWithoutSummaries.push({
						title: video.title,
						videoId: videoId,
						reason: 'No cached summary available'
					})
					
				} catch (error) {
					console.error(`❌ Error checking summary for ${videoId}:`, error)
					videosWithoutSummaries.push({
						title: video.title,
						videoId: videoId,
						reason: `Error fetching summary: ${error instanceof Error ? error.message : String(error)}`
					})
				}
			}

			console.log(`📊 Summary aggregation results:`)
			console.log(`✅ Videos with valid summaries: ${summaries.length}`)
			console.log(`❌ Videos without summaries: ${videosWithoutSummaries.length}`)

			// Show detailed results to user
			if (videosWithoutSummaries.length > 0) {
				const missingVideosList = videosWithoutSummaries
					.map(v => `• ${v.title} (${v.reason})`)
					.join('\n')
				
				if (summaries.length === 0) {
					alert(`❌ Cannot create documentation - no valid summaries found!\n\nVideos missing summaries:\n${missingVideosList}\n\nTip: Try generating summaries for these videos first by clicking on them and using "Generate AI Summary".`)
					return
				} else {
					const proceed = confirm(`⚠️ Found summaries for ${summaries.length} out of ${state.selectedVideos.size} selected videos.\n\nVideos missing summaries:\n${missingVideosList}\n\nDo you want to proceed with creating documentation from the available summaries?`)
					if (!proceed) {
						return
					}
				}
			}

			if (summaries.length === 0) {
				alert('❌ No valid summaries found. Please generate summaries for the selected videos first.')
				return
			}

			console.log(`🚀 Creating aggregate documentation from ${summaries.length} summaries...`)

			// Create aggregate documentation using AI
			const aggregatePrompt = `Please create a comprehensive technical documentation by aggregating and organizing the following YouTube video summaries. Remove any duplicate information and create a well-structured, cohesive document that would be useful for learning and reference.

Videos included:
${summaries.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

Summaries to aggregate:
${summaries.map((s, i) => `\n--- VIDEO ${i + 1}: ${s.title} ---\n${s.summary}`).join('\n')}

Please organize this into a comprehensive technical document with:
1. An executive summary
2. Key concepts and technologies covered
3. Detailed technical explanations
4. Best practices and recommendations
5. Links and resources (if mentioned in the summaries)
6. Conclusion

Make sure to:
- Remove duplicate information
- Organize content logically
- Maintain technical accuracy
- Create a cohesive narrative
- Include all important details from each summary`

			const response = await fetch('/api/ai/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt: aggregatePrompt,
					model_id: 'gpt-4o',
					response_format: 'text',
					max_tokens: 4000,
					temperature: 0.3,
				}),
			})

			if (!response.ok) {
				throw new Error(`Failed to generate aggregate documentation: ${response.statusText}`)
			}

			const aiData = await response.json()
			if (!aiData.success) {
				throw new Error(`AI generation failed: ${aiData.error}`)
			}

			const aggregatedDoc = aiData.data

			console.log(`📝 Generated aggregate documentation (${aggregatedDoc.length} characters)`)

			// Save to notes
			const notesResponse = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					topic: state.searchTerm,
					content: aggregatedDoc,
					keywords: ['youtube', 'aggregated', 'documentation'],
				}),
			})

			if (!notesResponse.ok) {
				throw new Error(`Failed to save documentation: ${notesResponse.statusText}`)
			}

			const notesData = await notesResponse.json()
			console.log(`💾 Saved aggregate documentation to notes:`, notesData)

			alert(`✅ Successfully created aggregate documentation from ${summaries.length} videos and saved to notes!\n\n${videosWithoutSummaries.length > 0 ? `Note: ${videosWithoutSummaries.length} videos were skipped due to missing summaries.` : ''}`)

		} catch (error) {
			console.error('❌ Error aggregating summaries:', error)
			alert(`❌ Error creating aggregate documentation: ${error instanceof Error ? error.message : String(error)}`)
		} finally {
			updateState({ isAggregatingDocs: false })
		}
	}, [state.selectedVideos, state.searchResults, state.searchTerm])

	return {
		state,
		updateState,
		handleSearch,
		handleVideoClick,
		handleVideoSelect,
		handleSelectAll,
		handleDeselectAll,
		handleAggregateSelected,
		handleGenerateKeywords,
		handleSummarizeTranscript,
		handleManualTranscriptSubmit,
		handleSaveTranscript,
		handleSaveSummary,
		performSearch,
	}
}

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (handlers: { onEscape?: () => void; onEnter?: () => void }) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && handlers.onEscape) {
				handlers.onEscape()
			}
			if (event.key === 'Enter' && handlers.onEnter) {
				handlers.onEnter()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [handlers])
}

// Hook for clipboard operations
export const useClipboard = () => {
	const [copiedItem, setCopiedItem] = useState<string | null>(null)

	const copyToClipboard = useCallback(async (text: string, itemId: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopiedItem(itemId)
			setTimeout(() => setCopiedItem(null), 2000)
		} catch (error) {
			console.error('Failed to copy to clipboard:', error)
		}
	}, [])

	return {
		copiedItem,
		copyToClipboard,
	}
}
