// Main component
export { default } from './YouTubeSearchPage'

// Sub-components
export { default as SearchForm } from './SearchForm'
export { default as SearchResults } from './SearchResults'
export { default as TranscriptDisplay } from './TranscriptDisplay'
export { default as KeywordModal } from './KeywordModal'
export { default as GeneralTopicModal } from './GeneralTopicModal'
export { default as KeywordsSection } from './KeywordsSection'
export { default as ManualTranscriptInput } from './ManualTranscriptInput'

// Types
import {
  YouTubeSearchResult,
  SearchResponse,
  TranscriptResponse,
  SortOption,
  YouTubeSearchState,
  KeywordModalProps,
  SearchFormProps,
  SearchResultsProps,
  TranscriptDisplayProps,
  GeneralTopicModalProps,
} from './types'

export type {
  YouTubeSearchResult,
  SearchResponse,
  TranscriptResponse,
  SortOption,
  YouTubeSearchState,
  KeywordModalProps,
  SearchFormProps,
  SearchResultsProps,
  TranscriptDisplayProps,
  GeneralTopicModalProps,
}

// Utilities
import {
  parseDurationToSeconds,
  extractViewCount,
  extractUploadDate,
  sortResults,
  sanitizeKeywordForId,
  getSortOptionLabel,
  formatDescriptionWithLinks,
  hasTranscriptError,
  isTranscriptRateLimited,
  getErrorMessageType,
  getErrorMessageClasses,
  getRetryButtonClasses,
  getRetryButtonText,
} from './utils'

export {
  parseDurationToSeconds,
  extractViewCount,
  extractUploadDate,
  sortResults,
  sanitizeKeywordForId,
  getSortOptionLabel,
  formatDescriptionWithLinks,
  hasTranscriptError,
  isTranscriptRateLimited,
  getErrorMessageType,
  getErrorMessageClasses,
  getRetryButtonClasses,
  getRetryButtonText,
}

// Hooks
import { useYouTubeSearch, useKeyboardShortcuts, useClipboard } from './hooks'

export { useYouTubeSearch, useKeyboardShortcuts, useClipboard }
