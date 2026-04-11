/**
 * Feedback display box showing AI form corrections.
 */
interface FeedbackBoxProps {
  feedback: string[];
}

export function FeedbackBox({ feedback }: FeedbackBoxProps) {
  const primaryFeedback = feedback[0];
  const secondaryFeedback = feedback.slice(1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">AI Feedback</h3>
      {feedback.length === 0 ? (
        <p className="text-gray-400 italic">AI feedback will appear here</p>
      ) : (
        <div className="space-y-3">
          <div className="animate-fade-in">
            <p className="text-lg font-semibold text-gray-900">
              {primaryFeedback}
            </p>
          </div>
          {secondaryFeedback.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-gray-100">
              {secondaryFeedback.map((item, index) => (
                <p
                  key={index}
                  className="text-sm text-gray-600 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
