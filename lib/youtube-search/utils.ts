import { SortOption, YouTubeSearchResult } from './types'

// Function to convert duration string to seconds for sorting
export const parseDurationToSeconds = (duration: string): number => {
	if (!duration || duration === 'Unknown') return 0

	// Handle formats like "5:23", "1:15:30", "45", etc.
	const parts = duration.split(':').map((part) => parseInt(part.trim(), 10))

	if (parts.length === 1) {
		// Just seconds: "45"
		return parts[0] || 0
	} else if (parts.length === 2) {
		// Minutes:Seconds: "5:23"
		return (parts[0] || 0) * 60 + (parts[1] || 0)
	} else if (parts.length === 3) {
		// Hours:Minutes:Seconds: "1:15:30"
		return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
	}

	return 0
}

// Function to extract view count from description
export const extractViewCount = (description: string): number => {
	// Look for patterns like "1.2M views", "500K views", "1,234 views"
	const viewMatch = description.match(/([0-9,]+\.?[0-9]*)\s*([KMB])?\s*views/i)
	if (viewMatch) {
		const number = parseFloat(viewMatch[1].replace(/,/g, ''))
		const multiplier = viewMatch[2]

		switch (multiplier?.toUpperCase()) {
			case 'K':
				return number * 1000
			case 'M':
				return number * 1000000
			case 'B':
				return number * 1000000000
			default:
				return number
		}
	}
	return 0
}

// Function to extract upload date from description
export const extractUploadDate = (description: string): Date => {
	// Look for patterns like "2 days ago", "1 week ago", "3 months ago", "1 year ago"
	const timeMatch = description.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i)
	if (timeMatch) {
		const number = parseInt(timeMatch[1])
		const unit = timeMatch[2].toLowerCase()
		const now = new Date()

		switch (unit) {
			case 'second':
				return new Date(now.getTime() - number * 1000)
			case 'minute':
				return new Date(now.getTime() - number * 60 * 1000)
			case 'hour':
				return new Date(now.getTime() - number * 60 * 60 * 1000)
			case 'day':
				return new Date(now.getTime() - number * 24 * 60 * 60 * 1000)
			case 'week':
				return new Date(now.getTime() - number * 7 * 24 * 60 * 60 * 1000)
			case 'month':
				return new Date(now.getTime() - number * 30 * 24 * 60 * 60 * 1000)
			case 'year':
				return new Date(now.getTime() - number * 365 * 24 * 60 * 60 * 1000)
			default:
				return new Date(0)
		}
	}
	return new Date(0)
}

// Function to sort results based on the selected option
export const sortResults = (results: YouTubeSearchResult[], option: SortOption): YouTubeSearchResult[] => {
	const sortedResults = [...results]

	switch (option) {
		case 'duration_desc':
			return sortedResults.sort((a, b) => {
				const durationA = parseDurationToSeconds(a.duration)
				const durationB = parseDurationToSeconds(b.duration)
				return durationB - durationA // Descending (longest first)
			})

		case 'duration_asc':
			return sortedResults.sort((a, b) => {
				const durationA = parseDurationToSeconds(a.duration)
				const durationB = parseDurationToSeconds(b.duration)
				return durationA - durationB // Ascending (shortest first)
			})

		case 'title_asc':
			return sortedResults.sort((a, b) => a.title.localeCompare(b.title))

		case 'title_desc':
			return sortedResults.sort((a, b) => b.title.localeCompare(a.title))

		case 'views_desc':
			return sortedResults.sort((a, b) => {
				const viewsA = extractViewCount(a.description)
				const viewsB = extractViewCount(b.description)
				return viewsB - viewsA // Descending (most views first)
			})

		case 'recent_first':
			return sortedResults.sort((a, b) => {
				const dateA = extractUploadDate(a.description)
				const dateB = extractUploadDate(b.description)
				return dateB.getTime() - dateA.getTime() // Most recent first
			})

		case 'relevance':
		default:
			return sortedResults // Keep original order (relevance from search API)
	}
}

// Function to sanitize keyword for use as CSS ID
export const sanitizeKeywordForId = (keyword: string): string => {
	return keyword
		.replace(/[^a-zA-Z0-9\-_]/g, '-') // Replace invalid characters with hyphens
		.replace(/--+/g, '-') // Replace multiple consecutive hyphens with single hyphen
		.replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
		.toLowerCase()
}

// Function to get sort option label
export const getSortOptionLabel = (sortOption: SortOption): string => {
	switch (sortOption) {
		case 'relevance':
			return 'Sorted by relevance'
		case 'duration_desc':
			return 'Sorted by duration (longest first)'
		case 'duration_asc':
			return 'Sorted by duration (shortest first)'
		case 'views_desc':
			return 'Sorted by most views'
		case 'recent_first':
			return 'Sorted by most recent'
		case 'title_asc':
			return 'Sorted by title (A-Z)'
		case 'title_desc':
			return 'Sorted by title (Z-A)'
		default:
			return 'Sorted by relevance'
	}
}

// Function to format description with links
export const formatDescriptionWithLinks = (description: string): string => {
	return description
		.replace(/\n/g, '<br/>')
		.replace(
			/https?:\/\/[^\s<>]+/g,
			'<a href="$&" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline break-all">$&</a>',
		)
}

// Function to check if transcript has errors
export const hasTranscriptError = (transcript: string | null): boolean => {
	if (!transcript) return false
	return transcript.includes('Error:') || transcript.includes('Transcript not available')
}

// Function to check if transcript is rate limited
export const isTranscriptRateLimited = (transcript: string | null): boolean => {
	if (!transcript) return false
	return transcript.includes('⚠️ Rate Limited') || transcript.includes('⏱️ Request Timed Out')
}

// Function to get error message type
export const getErrorMessageType = (transcript: string | null): 'rate_limited' | 'timeout' | 'error' | null => {
	if (!transcript) return null
	if (transcript.includes('⚠️ Rate Limited')) return 'rate_limited'
	if (transcript.includes('⏱️ Request Timed Out')) return 'timeout'
	if (transcript.includes('Error:') || transcript.includes('Transcript not available')) return 'error'
	return null
}

// Function to get CSS classes for error messages
export const getErrorMessageClasses = (transcript: string | null): string => {
	const errorType = getErrorMessageType(transcript)
	switch (errorType) {
		case 'rate_limited':
			return 'text-yellow-200 bg-yellow-900/20 p-4 rounded border border-yellow-600'
		case 'timeout':
			return 'text-orange-200 bg-orange-900/20 p-4 rounded border border-orange-600'
		default:
			return 'text-gray-200'
	}
}

// Function to get retry button classes
export const getRetryButtonClasses = (transcript: string | null): string => {
	const errorType = getErrorMessageType(transcript)
	switch (errorType) {
		case 'rate_limited':
			return 'bg-yellow-600 hover:bg-yellow-700 text-yellow-100'
		case 'timeout':
			return 'bg-orange-600 hover:bg-orange-700 text-orange-100'
		default:
			return 'bg-blue-600 hover:bg-blue-700 text-blue-100'
	}
}

// Function to get retry button text
export const getRetryButtonText = (transcript: string | null): string => {
	const errorType = getErrorMessageType(transcript)
	switch (errorType) {
		case 'rate_limited':
			return 'Retry After Network Switch'
		case 'timeout':
			return 'Retry Transcript Extraction'
		default:
			return 'Retry'
	}
}
