export interface FeedbackSubmission {
  message: string;
  rating: number;
  pageUrl: string;
}

export interface FeedbackDialogResult {
  success: boolean;
  rating?: number;
  comments?: string;
}