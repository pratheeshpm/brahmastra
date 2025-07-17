import React from 'react'

import Head from 'next/head'

import GeneralTopicModal from './GeneralTopicModal'
import KeywordModal from './KeywordModal'
import SearchForm from './SearchForm'
import SearchResults from './SearchResults'
import TranscriptDisplay from './TranscriptDisplay'
import { useClipboard, useKeyboardShortcuts, useYouTubeSearch } from '../../lib/youtube-search/hooks'

const YouTubeSearchPage: React.FC = () => {
	const { 
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
		performSearch 
	} = useYouTubeSearch()

	const { copyToClipboard } = useClipboard()

	// Handle general topic functionality
	const handleGeneralTopicClick = () => {
		updateState({ showGeneralTopicInput: true, generalTopicQuery: '' })
	}

	const handleGeneralTopicSubmit = async () => {
		if (!state.generalTopicQuery.trim()) return

		updateState({
			isLoadingGeneralExplanation: true,
			selectedKeyword: state.generalTopicQuery.trim(),
			showKeywordModal: true,
			showGeneralTopicInput: false,
			isLoadingExplanation: true,
			keywordExplanation: null,
			isEditingExplanation: false,
		})

		try {
			const response = await fetch('/api/youtube/keyword-explanation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					keyword: state.generalTopicQuery.trim(),
					context: 'General topic explanation request',
					model_id: 'gpt-4o-mini',
					videoId: 'general-topic',
					title: 'General Topic Explanation',
				}),
			})

			if (response.ok) {
				const data = await response.json()
				if (data.success && data.explanation) {
					updateState({
						keywordExplanation: data.explanation,
						isLoadingExplanation: false,
						isLoadingGeneralExplanation: false,
					})
				} else {
					updateState({
						keywordExplanation: 'Failed to generate explanation. Please try again.',
						isLoadingExplanation: false,
						isLoadingGeneralExplanation: false,
					})
				}
			} else {
				updateState({
					keywordExplanation: 'Failed to generate explanation. Please try again.',
					isLoadingExplanation: false,
					isLoadingGeneralExplanation: false,
				})
			}
		} catch (error) {
			console.error('Error generating explanation:', error)
			updateState({
				keywordExplanation: 'Failed to generate explanation. Please try again.',
				isLoadingExplanation: false,
				isLoadingGeneralExplanation: false,
			})
		}
	}

	const handleCancelGeneralTopic = () => {
		updateState({
			showGeneralTopicInput: false,
			generalTopicQuery: '',
			isLoadingGeneralExplanation: false,
		})
	}

	// Handle video expansion
	const handleExpandDescription = async (video: any, e: React.MouseEvent) => {
		e.stopPropagation()

		if (state.expandedDescriptions[video.videoId]) {
			const newExpanded = { ...state.expandedDescriptions }
			delete newExpanded[video.videoId]
			updateState({ expandedDescriptions: newExpanded })
			return
		}

		updateState({
			loadingDescriptions: { ...state.loadingDescriptions, [video.videoId]: true },
		})

		try {
			const response = await fetch(`/api/youtube/details?video_id=${video.videoId}`)
			const data = await response.json()

			if (data.success && data.description) {
				updateState({
					expandedDescriptions: {
						...state.expandedDescriptions,
						[video.videoId]: data.description,
					},
					loadingDescriptions: { ...state.loadingDescriptions, [video.videoId]: false },
				})
			} else {
				console.error('Failed to fetch video details:', data)
				updateState({
					loadingDescriptions: { ...state.loadingDescriptions, [video.videoId]: false },
				})
			}
		} catch (error) {
			console.error('Error fetching video details:', error)
			updateState({
				loadingDescriptions: { ...state.loadingDescriptions, [video.videoId]: false },
			})
		}
	}

	// Handle copy video
	const handleCopyVideo = (videoId: string, url: string) => {
		copyToClipboard(url, videoId)
		updateState({ copiedVideoId: videoId })
		setTimeout(() => updateState({ copiedVideoId: null }), 2000)
	}

	// Handle keyword modal
	const handleKeywordClick = async (keyword: string) => {
		updateState({
			selectedKeyword: keyword,
			showKeywordModal: true,
			isLoadingExplanation: true,
			keywordExplanation: null,
			isEditingExplanation: false,
		})

		if (keyword === 'Custom') {
			updateState({
				showCustomKeywordInput: true,
				isLoadingExplanation: false,
			})
		} else {
			try {
				const response = await fetch('/api/youtube/keyword-explanation', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						keyword,
						context: state.summary || '',
						model_id: 'gpt-4o-mini',
						videoId: state.selectedVideo?.videoId,
						title: state.selectedVideo?.title,
					}),
				})

				if (response.ok) {
					const data = await response.json()
					if (data.success && data.explanation) {
						updateState({
							keywordExplanation: data.explanation,
							isLoadingExplanation: false,
						})
					} else {
						updateState({
							keywordExplanation: 'Failed to generate explanation. Please try again.',
							isLoadingExplanation: false,
						})
					}
				} else {
					updateState({
						keywordExplanation: 'Failed to generate explanation. Please try again.',
						isLoadingExplanation: false,
					})
				}
			} catch (error) {
				console.error('Error generating explanation:', error)
				updateState({
					keywordExplanation: 'Failed to generate explanation. Please try again.',
					isLoadingExplanation: false,
				})
			}
		}
	}

	const handleCloseModal = () => {
		updateState({
			showKeywordModal: false,
			selectedKeyword: null,
			keywordExplanation: null,
			isLoadingExplanation: false,
			showCustomKeywordInput: false,
			customKeywordQuery: '',
			isEditingExplanation: false,
			editedExplanation: '',
			isRetryingMermaid: false,
		})
	}

	// Handle custom keyword submit
	const handleCustomKeywordSubmit = async () => {
		if (!state.customKeywordQuery.trim()) return

		updateState({
			isLoadingExplanation: true,
			showCustomKeywordInput: false,
		})

		try {
			const response = await fetch('/api/youtube/keyword-explanation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					keyword: state.customKeywordQuery.trim(),
					context: state.summary || '',
					model_id: 'gpt-4o-mini',
					videoId: state.selectedVideo?.videoId,
					title: state.selectedVideo?.title,
				}),
			})

			if (response.ok) {
				const data = await response.json()
				if (data.success && data.explanation) {
					updateState({
						keywordExplanation: data.explanation,
						isLoadingExplanation: false,
					})
				} else {
					updateState({
						keywordExplanation: 'Failed to generate explanation. Please try again.',
						isLoadingExplanation: false,
					})
				}
			} else {
				updateState({
					keywordExplanation: 'Failed to generate explanation. Please try again.',
					isLoadingExplanation: false,
				})
			}
		} catch (error) {
			console.error('Error generating explanation:', error)
			updateState({
				keywordExplanation: 'Failed to generate explanation. Please try again.',
				isLoadingExplanation: false,
			})
		}
	}

	// Handle save explanation
	const handleSaveExplanation = async () => {
		if (!state.editedExplanation.trim() || !state.selectedVideo || !state.selectedKeyword) return

		try {
			const response = await fetch(`/api/youtube/keyword-explanations-cache?videoId=${encodeURIComponent(state.selectedVideo.videoId)}&keyword=${encodeURIComponent(state.selectedKeyword)}&title=${encodeURIComponent(state.selectedVideo.title)}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					explanation: state.editedExplanation.trim(),
				}),
			})

			if (response.ok) {
				updateState({
					keywordExplanation: state.editedExplanation.trim(),
					isEditingExplanation: false,
				})
				console.log(`✅ Updated explanation for keyword: ${state.selectedKeyword}`)
			} else {
				console.error('❌ Failed to update explanation')
			}
		} catch (error) {
			console.error('❌ Error updating explanation:', error)
		}
	}

	// Handle retry mermaid
	const handleRetryMermaid = async () => {
		if (!state.keywordExplanation) return

		updateState({ isRetryingMermaid: true })
		try {
			const mermaidMatch = state.keywordExplanation.match(/```mermaid\n([\s\S]*?)\n```/)
			const existingCode = mermaidMatch ? mermaidMatch[1] : ''
			
			const response = await fetch('/api/ai/mermaid-correction', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					originalCode: existingCode,
					description: `${state.selectedKeyword} in the context of: ${state.summary?.substring(0, 200)}...`,
					model_id: 'gpt-4o-mini',
				}),
			})

			if (response.ok) {
				const data = await response.json()
				if (data.success && data.correctedCode) {
					const updatedExplanation = state.keywordExplanation.replace(
						/```mermaid\n[\s\S]*?\n```/,
						`\`\`\`mermaid\n${data.correctedCode}\n\`\`\``
					)
					
					updateState({ keywordExplanation: updatedExplanation })
					
					// Save updated explanation to cache
					if (state.selectedVideo && state.selectedKeyword) {
						try {
							await fetch(`/api/youtube/keyword-explanations-cache?videoId=${encodeURIComponent(state.selectedVideo.videoId)}&keyword=${encodeURIComponent(state.selectedKeyword)}&title=${encodeURIComponent(state.selectedVideo.title)}`, {
								method: 'PUT',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									explanation: updatedExplanation,
								}),
							})
							console.log(`✅ Updated cached explanation with corrected Mermaid`)
						} catch (cacheError) {
							console.warn('❌ Failed to update cached explanation:', cacheError)
						}
					}
					
					console.log(`✅ Corrected Mermaid diagram for keyword: ${state.selectedKeyword}`)
				} else {
					console.error('❌ Failed to correct Mermaid diagram:', data.error)
				}
			} else {
				console.error('❌ Mermaid correction API request failed')
			}
		} catch (error) {
			console.error('❌ Error correcting Mermaid diagram:', error)
		} finally {
			updateState({ isRetryingMermaid: false })
		}
	}

	// Handle delete caches
	const handleDeleteTranscriptCache = async () => {
		if (!state.selectedVideo) return

		try {
			const response = await fetch(`/api/youtube/cache?videoId=${state.selectedVideo.videoId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				console.log('Transcript cache deleted successfully')
				updateState({
					selectedTranscript: null,
					lastTranscriptSource: null,
					summary: null,
					lastSummarySource: null,
				})
			} else {
				console.error('Failed to delete transcript cache')
			}
		} catch (error) {
			console.error('Error deleting transcript cache:', error)
		}
	}

	const handleDeleteSummaryCache = async () => {
		if (!state.selectedVideo) return

		try {
			const response = await fetch(`/api/youtube/summary-cache?videoId=${state.selectedVideo.videoId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				console.log('Summary cache deleted successfully')
				updateState({
					summary: null,
					lastSummarySource: null,
				})
			} else {
				console.error('Failed to delete summary cache')
			}
		} catch (error) {
			console.error('Error deleting summary cache:', error)
		}
	}

	// Handle keyword operations
	const handleAddKeyword = async () => {
		if (!state.newKeywordText.trim() || !state.selectedVideo) return

		const delimiters = /[,;\n]/
		const newKeywords = state.newKeywordText
			.split(delimiters)
			.map(keyword => keyword.trim())
			.filter(keyword => keyword.length > 0)
			.filter(keyword => !state.keywords.includes(keyword))

		if (newKeywords.length === 0) {
			updateState({ showAddKeywordInput: false, newKeywordText: '' })
			return
		}

		const updatedKeywords = [...state.keywords, ...newKeywords]
		updateState({ keywords: updatedKeywords, showAddKeywordInput: false, newKeywordText: '' })

		// Save updated keywords to cache
		try {
			const response = await fetch('/api/youtube/summary-cache', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					keywords: updatedKeywords,
					model: 'gpt-4o-mini',
				}),
			})

			if (response.ok) {
				console.log(`✅ Added ${newKeywords.length} keyword(s) and saved to cache`)
			} else {
				console.error('❌ Failed to save updated keywords to cache')
			}
		} catch (error) {
			console.error('❌ Error saving updated keywords:', error)
		}
	}

	const handleSaveKeywordEdit = async () => {
		if (!state.editingKeywordText.trim() || state.editingKeywordIndex === null || !state.selectedVideo) return

		const updatedKeywords = [...state.keywords]
		updatedKeywords[state.editingKeywordIndex] = state.editingKeywordText.trim()
		
		updateState({ 
			keywords: updatedKeywords, 
			editingKeywordIndex: null, 
			editingKeywordText: '' 
		})

		// Save updated keywords to cache
		try {
			const response = await fetch('/api/youtube/summary-cache', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					keywords: updatedKeywords,
					model: 'gpt-4o-mini',
				}),
			})

			if (response.ok) {
				console.log(`✅ Updated keyword and saved to cache`)
			} else {
				console.error('❌ Failed to save updated keywords to cache')
			}
		} catch (error) {
			console.error('❌ Error saving updated keywords:', error)
		}
	}

	const handleDeleteKeyword = async (index: number) => {
		if (!state.selectedVideo) return

		const updatedKeywords = state.keywords.filter((_, i) => i !== index)
		updateState({ keywords: updatedKeywords })

		// Save updated keywords to cache
		try {
			const response = await fetch('/api/youtube/summary-cache', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					videoId: state.selectedVideo.videoId,
					title: state.selectedVideo.title,
					keywords: updatedKeywords,
					model: 'gpt-4o-mini',
				}),
			})

			if (response.ok) {
				console.log(`✅ Deleted keyword and saved to cache`)
			} else {
				console.error('❌ Failed to save updated keywords to cache')
			}
		} catch (error) {
			console.error('❌ Error saving updated keywords:', error)
		}
	}

	// Handle ESC key
	useKeyboardShortcuts({
		onEscape: () => {
			if (state.showKeywordModal) {
				handleCloseModal()
			} else if (state.showGeneralTopicInput) {
				handleCancelGeneralTopic()
			}
		},
	})

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<Head>
				<title>YouTube Search - Chatbot UI</title>
				<meta name="description" content="Search YouTube videos and view transcripts" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="container mx-auto px-4 py-4 min-h-screen flex flex-col">
				<SearchForm
					searchTerm={state.searchTerm}
					isSearching={state.isSearching}
					onSearchTermChange={(value) => updateState({ searchTerm: value })}
					onSearch={handleSearch}
					onGeneralTopicClick={handleGeneralTopicClick}
				/>

				<GeneralTopicModal
					showGeneralTopicInput={state.showGeneralTopicInput}
					generalTopicQuery={state.generalTopicQuery}
					isLoadingGeneralExplanation={state.isLoadingGeneralExplanation}
					onGeneralTopicQueryChange={(value) => updateState({ generalTopicQuery: value })}
					onGeneralTopicSubmit={handleGeneralTopicSubmit}
					onCancelGeneralTopic={handleCancelGeneralTopic}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
					<SearchResults
						searchResults={state.searchResults}
						sortOption={state.sortOption}
						isSearching={state.isSearching}
						selectedVideo={state.selectedVideo}
						selectedVideos={state.selectedVideos}
						expandedDescriptions={state.expandedDescriptions}
						loadingDescriptions={state.loadingDescriptions}
						copiedVideoId={state.copiedVideoId}
						isAggregatingDocs={state.isAggregatingDocs}
						videoSummaryStatus={state.videoSummaryStatus}
						onSortChange={(option) => updateState({ sortOption: option })}
						onVideoClick={handleVideoClick}
						onVideoSelect={handleVideoSelect}
						onSelectAll={handleSelectAll}
						onDeselectAll={handleDeselectAll}
						onAggregateSelected={handleAggregateSelected}
						onExpandDescription={handleExpandDescription}
						onCopyVideo={handleCopyVideo}
					/>

					<TranscriptDisplay
						selectedVideo={state.selectedVideo}
						selectedTranscript={state.selectedTranscript}
						isLoadingTranscript={state.isLoadingTranscript}
						showSummary={state.showSummary}
						summary={state.summary}
						isLoadingSummary={state.isLoadingSummary}
						lastTranscriptSource={state.lastTranscriptSource}
						lastSummarySource={state.lastSummarySource}
						showManualInput={state.showManualInput}
						manualTranscript={state.manualTranscript}
						isSavingManualTranscript={state.isSavingManualTranscript}
						isEditingTranscript={state.isEditingTranscript}
						editedTranscript={state.editedTranscript}
						isSavingTranscript={state.isSavingTranscript}
						isEditingSummary={state.isEditingSummary}
						editedSummary={state.editedSummary}
						isSavingSummary={state.isSavingSummary}
						keywords={state.keywords}
						isLoadingKeywords={state.isLoadingKeywords}
						showAddKeywordInput={state.showAddKeywordInput}
						newKeywordText={state.newKeywordText}
						editingKeywordIndex={state.editingKeywordIndex}
						editingKeywordText={state.editingKeywordText}
						onToggleView={() => updateState({ showSummary: !state.showSummary })}
						onEditTranscript={() =>
							updateState({ isEditingTranscript: true, editedTranscript: state.selectedTranscript || '' })
						}
						onSaveTranscript={handleSaveTranscript}
						onCancelTranscriptEdit={() => updateState({ isEditingTranscript: false, editedTranscript: '' })}
						onEditSummary={() => updateState({ isEditingSummary: true, editedSummary: state.summary || '' })}
						onSaveSummary={handleSaveSummary}
						onCancelSummaryEdit={() => updateState({ isEditingSummary: false, editedSummary: '' })}
						onGenerateKeywords={handleGenerateKeywords}
						onSummarizeTranscript={handleSummarizeTranscript}
						onDeleteTranscriptCache={handleDeleteTranscriptCache}
						onDeleteSummaryCache={handleDeleteSummaryCache}
						onShowManualInput={() => updateState({ showManualInput: true })}
						onManualTranscriptChange={(value) => updateState({ manualTranscript: value })}
						onManualTranscriptSubmit={handleManualTranscriptSubmit}
						onCancelManualInput={() => updateState({ showManualInput: false, manualTranscript: '' })}
						onEditedTranscriptChange={(value) => updateState({ editedTranscript: value })}
						onEditedSummaryChange={(value) => updateState({ editedSummary: value })}
						onKeywordClick={handleKeywordClick}
						onAddKeyword={handleAddKeyword}
						onEditKeyword={(index) =>
							updateState({ editingKeywordIndex: index, editingKeywordText: state.keywords[index] })
						}
						onDeleteKeyword={handleDeleteKeyword}
						onSaveKeywordEdit={handleSaveKeywordEdit}
						onNewKeywordTextChange={(value) => updateState({ newKeywordText: value })}
						onEditingKeywordTextChange={(value) => updateState({ editingKeywordText: value })}
						onShowAddKeywordInput={() => updateState({ showAddKeywordInput: !state.showAddKeywordInput })}
						onCancelKeywordEdit={() => updateState({ editingKeywordIndex: null, editingKeywordText: '' })}
					/>
				</div>

				<KeywordModal
					showKeywordModal={state.showKeywordModal}
					selectedKeyword={state.selectedKeyword}
					keywordExplanation={state.keywordExplanation}
					isLoadingExplanation={state.isLoadingExplanation}
					showCustomKeywordInput={state.showCustomKeywordInput}
					customKeywordQuery={state.customKeywordQuery}
					isEditingExplanation={state.isEditingExplanation}
					editedExplanation={state.editedExplanation}
					isRetryingMermaid={state.isRetryingMermaid}
					onClose={handleCloseModal}
					onCustomKeywordSubmit={handleCustomKeywordSubmit}
					onEditExplanation={() =>
						updateState({ isEditingExplanation: true, editedExplanation: state.keywordExplanation || '' })
					}
					onSaveExplanation={handleSaveExplanation}
					onCancelExplanationEdit={() => updateState({ isEditingExplanation: false, editedExplanation: '' })}
					onRetryMermaid={handleRetryMermaid}
					onCustomKeywordChange={(value) => updateState({ customKeywordQuery: value })}
					onEditedExplanationChange={(value) => updateState({ editedExplanation: value })}
				/>
			</div>
		</div>
	)
}

export default YouTubeSearchPage
