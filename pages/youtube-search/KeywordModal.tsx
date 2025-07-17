import React from 'react'

import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown'
import { MermaidDiagram } from '@/components/Markdown/MermaidDiagram'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeMathjax from 'rehype-mathjax'

import { KeywordModalProps } from '../../lib/youtube-search/types'
import { sanitizeKeywordForId } from '../../lib/youtube-search/utils'

const KeywordModal: React.FC<KeywordModalProps> = ({
	showKeywordModal,
	selectedKeyword,
	keywordExplanation,
	isLoadingExplanation,
	showCustomKeywordInput,
	customKeywordQuery,
	isEditingExplanation,
	editedExplanation,
	isRetryingMermaid,
	onClose,
	onCustomKeywordSubmit,
	onEditExplanation,
	onSaveExplanation,
	onCancelExplanationEdit,
	onRetryMermaid,
	onCustomKeywordChange,
	onEditedExplanationChange,
}) => {
	if (!showKeywordModal) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-gray-800 border-b border-gray-600 p-4 flex items-center justify-between">
					<h2 className="text-xl font-semibold text-white flex items-center gap-2">
						<svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						{selectedKeyword}
					</h2>
					<div className="flex items-center gap-2">
						{keywordExplanation && !isEditingExplanation && (
							<>
								<button
									onClick={onEditExplanation}
									className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-gray-700 rounded"
									title="Edit explanation"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
								</button>
								{keywordExplanation.includes('```mermaid') && (
									<button
										onClick={onRetryMermaid}
										disabled={isRetryingMermaid}
										className="text-green-400 hover:text-green-300 disabled:text-gray-500 transition-colors p-2 hover:bg-gray-700 rounded"
										title="Retry Mermaid diagram"
									>
										{isRetryingMermaid ? (
											<div className="animate-spin w-5 h-5 border border-current border-t-transparent rounded-full"></div>
										) : (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
												/>
											</svg>
										)}
									</button>
								)}
							</>
						)}
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
							title="Close modal"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<div className="p-6">
					{showCustomKeywordInput ? (
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Enter your custom question or topic:
								</label>
								<input
									type="text"
									value={customKeywordQuery}
									onChange={(e) => onCustomKeywordChange(e.target.value)}
									placeholder="e.g., How does binary search work?, What is load balancing?, etc."
									className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									onKeyPress={(e) => e.key === 'Enter' && onCustomKeywordSubmit()}
									autoFocus
								/>
							</div>
							<div className="flex justify-end gap-2">
								<button
									onClick={onClose}
									className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={onCustomKeywordSubmit}
									disabled={!customKeywordQuery.trim()}
									className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
								>
									Generate Explanation
								</button>
							</div>
						</div>
					) : isLoadingExplanation ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
							<span className="ml-3 text-gray-300">Generating explanation and diagram...</span>
						</div>
					) : isEditingExplanation ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="text-lg font-medium text-indigo-400">Edit Explanation</h4>
								<div className="flex gap-2">
									<button
										onClick={onCancelExplanationEdit}
										className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={onSaveExplanation}
										disabled={!editedExplanation.trim()}
										className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
									>
										Save
									</button>
								</div>
							</div>
							<textarea
								value={editedExplanation}
								onChange={(e) => onEditedExplanationChange(e.target.value)}
								className="w-full h-96 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white resize-vertical"
								placeholder="Edit the explanation..."
							/>
						</div>
					) : keywordExplanation ? (
						<div className="prose prose-invert max-w-none">
							<MemoizedReactMarkdown
								className="prose prose-invert max-w-none prose-indigo"
								remarkPlugins={[remarkGfm, remarkMath]}
								rehypePlugins={[rehypeMathjax]}
								components={{
									// Custom component for mermaid code blocks
									code({ node, inline, className, children, ...props }) {
										const match = /language-(\w+)/.exec(className || '');
										const language = match ? match[1] : '';
										
										if (language === 'mermaid') {
											const mermaidCode = String(children).replace(/\n$/, '');
											const sanitizedId = `keyword-${sanitizeKeywordForId(selectedKeyword || '')}`;
											
											console.log('🎨 [MERMAID RENDER] About to render MermaidDiagram:', {
												codeLength: mermaidCode.length,
												codePreview: mermaidCode.substring(0, 50) + '...',
												sanitizedId,
												selectedKeyword,
												timestamp: new Date().toISOString()
											});
											
											return (
												<div className="my-6">
													<div className="text-sm text-gray-400 mb-3 font-medium">Interactive Diagram:</div>
													<MermaidDiagram 
														code={mermaidCode} 
														id={sanitizedId}
													/>
												</div>
											);
										}
										
										return (
											<code className={className} {...props}>
												{children}
											</code>
										);
									},
								}}
							>
								{keywordExplanation}
							</MemoizedReactMarkdown>
						</div>
					) : (
						<div className="text-center py-12">
							<div className="text-red-400 mb-4">
								<svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p>Failed to generate explanation</p>
							</div>
							<button
								onClick={() => selectedKeyword && onCustomKeywordSubmit()}
								className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
							>
								Try Again
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default KeywordModal
