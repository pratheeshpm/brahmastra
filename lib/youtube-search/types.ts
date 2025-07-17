export interface YouTubeSearchResult {
	title: string
	url: string
	description: string
	displayUrl: string
	videoId: string
	thumbnailUrl: string
	duration: string
}

export interface SearchResponse {
	webPages: {
		value: YouTubeSearchResult[]
	}
}

export interface TranscriptResponse {
	success?: boolean
	text?: string
	transcript?: Array<{ text: string }>
	error?: string
	message?: string
	source?: 'cache' | 'api'
	cachedAt?: string
}

export type SortOption =
	| 'relevance'
	| 'duration_desc'
	| 'duration_asc'
	| 'title_asc'
	| 'title_desc'
	| 'views_desc'
	| 'recent_first'

export interface YouTubeSearchState {
	searchTerm: string
	searchResults: YouTubeSearchResult[]
	originalSearchResults: YouTubeSearchResult[]
	sortOption: SortOption
	isSearching: boolean
	selectedTranscript: string | null
	isLoadingTranscript: boolean
	selectedVideo: YouTubeSearchResult | null
	selectedVideos: Set<string> // For multiselect functionality
	lastTranscriptSource: 'cache' | 'api' | null
	expandedDescriptions: { [key: string]: string }
	loadingDescriptions: { [key: string]: boolean }
	showSummary: boolean
	summary: string | null
	isLoadingSummary: boolean
	lastSummarySource: 'cache' | 'api' | null
	copiedVideoId: string | null
	showManualInput: boolean
	manualTranscript: string
	isSavingManualTranscript: boolean
	isEditingTranscript: boolean
	editedTranscript: string
	isSavingTranscript: boolean
	isEditingSummary: boolean
	editedSummary: string
	isSavingSummary: boolean
	keywords: string[]
	isLoadingKeywords: boolean
	copiedKeyword: string | null
	showKeywordModal: boolean
	selectedKeyword: string | null
	keywordExplanation: string | null
	isLoadingExplanation: boolean
	showCustomKeywordInput: boolean
	customKeywordQuery: string
	showAddKeywordInput: boolean
	newKeywordText: string
	editingKeywordIndex: number | null
	editingKeywordText: string
	isRetryingMermaid: boolean
	isEditingExplanation: boolean
	editedExplanation: string
	showGeneralTopicInput: boolean
	generalTopicQuery: string
	isLoadingGeneralExplanation: boolean
	isAggregatingDocs: boolean // For aggregating selected summaries
	videoSummaryStatus: { [videoId: string]: 'valid' | 'invalid' | 'missing' | 'checking' } // Track summary status for each video
}

export interface KeywordModalProps {
	showKeywordModal: boolean
	selectedKeyword: string | null
	keywordExplanation: string | null
	isLoadingExplanation: boolean
	showCustomKeywordInput: boolean
	customKeywordQuery: string
	isEditingExplanation: boolean
	editedExplanation: string
	isRetryingMermaid: boolean
	onClose: () => void
	onCustomKeywordSubmit: () => void
	onEditExplanation: () => void
	onSaveExplanation: () => void
	onCancelExplanationEdit: () => void
	onRetryMermaid: () => void
	onCustomKeywordChange: (value: string) => void
	onEditedExplanationChange: (value: string) => void
}

export interface SearchFormProps {
	searchTerm: string
	isSearching: boolean
	onSearchTermChange: (value: string) => void
	onSearch: (e: React.FormEvent) => void
	onGeneralTopicClick: () => void
}

export interface SearchResultsProps {
	searchResults: YouTubeSearchResult[]
	sortOption: SortOption
	isSearching: boolean
	selectedVideo: YouTubeSearchResult | null
	selectedVideos: Set<string>
	expandedDescriptions: { [key: string]: string }
	loadingDescriptions: { [key: string]: boolean }
	copiedVideoId: string | null
	isAggregatingDocs: boolean
	videoSummaryStatus: { [videoId: string]: 'valid' | 'invalid' | 'missing' | 'checking' }
	onSortChange: (option: SortOption) => void
	onVideoClick: (video: YouTubeSearchResult) => void
	onVideoSelect: (videoId: string, selected: boolean) => void
	onSelectAll: () => void
	onDeselectAll: () => void
	onAggregateSelected: () => void
	onExpandDescription: (video: YouTubeSearchResult, e: React.MouseEvent) => void
	onCopyVideo: (videoId: string, url: string) => void
}

export interface TranscriptDisplayProps {
	selectedVideo: YouTubeSearchResult | null
	selectedTranscript: string | null
	isLoadingTranscript: boolean
	showSummary: boolean
	summary: string | null
	isLoadingSummary: boolean
	lastTranscriptSource: 'cache' | 'api' | null
	lastSummarySource: 'cache' | 'api' | null
	showManualInput: boolean
	manualTranscript: string
	isSavingManualTranscript: boolean
	isEditingTranscript: boolean
	editedTranscript: string
	isSavingTranscript: boolean
	isEditingSummary: boolean
	editedSummary: string
	isSavingSummary: boolean
	keywords: string[]
	isLoadingKeywords: boolean
	showAddKeywordInput: boolean
	newKeywordText: string
	editingKeywordIndex: number | null
	editingKeywordText: string
	onToggleView: () => void
	onEditTranscript: () => void
	onSaveTranscript: () => void
	onCancelTranscriptEdit: () => void
	onEditSummary: () => void
	onSaveSummary: () => void
	onCancelSummaryEdit: () => void
	onGenerateKeywords: () => void
	onSummarizeTranscript: (forceRefresh: boolean) => void
	onDeleteTranscriptCache: () => void
	onDeleteSummaryCache: () => void
	onShowManualInput: () => void
	onManualTranscriptChange: (value: string) => void
	onManualTranscriptSubmit: () => void
	onCancelManualInput: () => void
	onEditedTranscriptChange: (value: string) => void
	onEditedSummaryChange: (value: string) => void
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

export interface GeneralTopicModalProps {
	showGeneralTopicInput: boolean
	generalTopicQuery: string
	isLoadingGeneralExplanation: boolean
	onGeneralTopicQueryChange: (value: string) => void
	onGeneralTopicSubmit: () => void
	onCancelGeneralTopic: () => void
}
