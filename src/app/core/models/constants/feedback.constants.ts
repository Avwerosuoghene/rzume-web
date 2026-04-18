export const FEEDBACK_DIALOG_TITLE = 'How was your experience today?';
export const FEEDBACK_DIALOG_SUBTITLE = 'Your feedback helps us improve your daily workflow.';
export const FEEDBACK_COMMENTS_LABEL = 'Additional Comments';
export const FEEDBACK_COMMENTS_PLACEHOLDER = 'Tell us what you liked or what we can improve...';
export const FEEDBACK_SUBMIT_BUTTON = 'Submit Feedback';
export const FEEDBACK_LATER_BUTTON = 'Maybe Later';
export const FEEDBACK_SUCCESS_TITLE = 'Thank You!';
export const FEEDBACK_SUCCESS_MESSAGE = 'Your feedback has been submitted successfully.';
export const FEEDBACK_ERROR_MESSAGE = 'Failed to submit feedback. Please try again.';

export const FEEDBACK_RATING_LABELS = [
  '',
  'Poor',
  'Fair',
  'Good',
  'Very Good',
  'Amazing'
] as const;

export const FEEDBACK_RATING_MIN = 1;
export const FEEDBACK_RATING_MAX = 5;
export const FEEDBACK_COMMENTS_MAX_LENGTH = 500;
