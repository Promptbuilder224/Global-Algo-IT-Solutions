
/**
 * Standardized error handling utility.
 * Normalizes errors and provides a consistent logging format.
 * In a real environment, this would integrate with Sentry, Datadog, etc.
 */

export interface ErrorLog {
    message: string;
    stack?: string;
    context?: string;
    timestamp: string;
    originalError?: unknown;
}

export function logError(error: unknown, context: string = 'Application'): void {
    const timestamp = new Date().toISOString();
    let message = 'An unknown error occurred';
    let stack: string | undefined;

    // Normalize the error
    if (error instanceof Error) {
        message = error.message;
        stack = error.stack;
    } else if (typeof error === 'string') {
        message = error;
    } else if (typeof error === 'object' && error !== null) {
        try {
            message = JSON.stringify(error);
        } catch {
            message = 'Non-serializable error object';
        }
    }

    const errorDetails: ErrorLog = {
        message,
        stack,
        context,
        timestamp,
        originalError: error
    };

    // Centralized logging (can be extended to send to external service)
    console.error(`[${timestamp}] [${context}] Error:`, message, errorDetails);
}
