import React from 'react'

import { GeneralTopicModalProps } from '../../lib/youtube-search/types'

const GeneralTopicModal: React.FC<GeneralTopicModalProps> = ({
	showGeneralTopicInput,
	generalTopicQuery,
	isLoadingGeneralExplanation,
	onGeneralTopicQueryChange,
	onGeneralTopicSubmit,
	onCancelGeneralTopic,
}) => {
	if (!showGeneralTopicInput) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-lg max-w-lg w-full p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-white flex items-center gap-2">
						<svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
						Ask AI About Any Topic
					</h2>
					<button
						onClick={onCancelGeneralTopic}
						className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Enter any topic, concept, or question:
						</label>
						<input
							type="text"
							value={generalTopicQuery}
							onChange={(e) => onGeneralTopicQueryChange(e.target.value)}
							placeholder="e.g., Machine Learning, React Hooks, Database Normalization, etc."
							className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							onKeyPress={(e) => e.key === 'Enter' && onGeneralTopicSubmit()}
							autoFocus
						/>
						<p className="text-xs text-gray-400 mt-2">
							💡 Ask about programming concepts, algorithms, technologies, or any topic you want to understand better
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<button
							onClick={onCancelGeneralTopic}
							className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={onGeneralTopicSubmit}
							disabled={!generalTopicQuery.trim() || isLoadingGeneralExplanation}
							className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center gap-2"
						>
							{isLoadingGeneralExplanation ? (
								<>
									<div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full"></div>
									Generating...
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
									Generate Explanation
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GeneralTopicModal
