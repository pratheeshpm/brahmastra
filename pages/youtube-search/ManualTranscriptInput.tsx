import React from 'react'

interface ManualTranscriptInputProps {
	manualTranscript: string
	isSavingManualTranscript: boolean
	onManualTranscriptChange: (value: string) => void
	onManualTranscriptSubmit: () => void
	onCancelManualInput: () => void
}

const ManualTranscriptInput: React.FC<ManualTranscriptInputProps> = ({
	manualTranscript,
	isSavingManualTranscript,
	onManualTranscriptChange,
	onManualTranscriptSubmit,
	onCancelManualInput,
}) => {
	return (
		<div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
			<h4 className="text-lg font-medium text-blue-400 mb-3">Enter Transcript Manually</h4>
			<p className="text-sm text-gray-300 mb-3">
				Paste the transcript text below. This is useful when automatic extraction fails.
			</p>
			<textarea
				value={manualTranscript}
				onChange={(e) => onManualTranscriptChange(e.target.value)}
				placeholder="Paste the video transcript here..."
				className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white resize-vertical"
				autoFocus
			/>
			<div className="flex justify-end gap-2 mt-3">
				<button
					onClick={onCancelManualInput}
					className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
				>
					Cancel
				</button>
				<button
					onClick={onManualTranscriptSubmit}
					disabled={!manualTranscript.trim() || isSavingManualTranscript}
					className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
				>
					{isSavingManualTranscript ? (
						<>
							<div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
							Saving...
						</>
					) : (
						'Use This Transcript'
					)}
				</button>
			</div>
		</div>
	)
}

export default ManualTranscriptInput
