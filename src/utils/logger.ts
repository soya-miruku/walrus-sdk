import winston, { format, transports } from "winston";

/**
 * Log levels for the Walrus SDK
 */
export enum LogLevel {
	ERROR = "error",
	WARN = "warn",
	INFO = "info",
	DEBUG = "debug",
}

/**
 * Options for configuring the logger
 */
export interface LoggerOptions {
	/** The minimum log level to display */
	level?: LogLevel;
	/** Whether to enable console output */
	console?: boolean;
	/** The format to use for console output */
	consoleFormat?: "simple" | "json";
	/** Whether to track and log function execution times */
	trackTiming?: boolean;
	/** Minimum time in milliseconds to log for performance tracking */
	minTimingThreshold?: number;
}

/**
 * A wrapper around Winston logger with timing capabilities
 */
class WalrusLogger {
	private logger: winston.Logger;
	private timers: Map<string, number> = new Map();
	private trackTiming: boolean;
	private minTimingThreshold: number;

	/**
	 * Create a new logger instance
	 * @param options Configuration options
	 */
	constructor(options: LoggerOptions = {}) {
		const {
			level = LogLevel.INFO,
			console = true,
			consoleFormat = "simple",
			trackTiming = true,
			minTimingThreshold = 0,
		} = options;

		// Define transports
		const logTransports: winston.transport[] = [];

		// Add console transport if enabled
		if (console) {
			const formatOptions =
				consoleFormat === "json"
					? format.combine(format.timestamp(), format.json())
					: format.combine(
							format.colorize(),
							format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
							format.printf(({ timestamp, level, message, ...meta }) => {
								const metaStr = Object.keys(meta).length
									? ` ${JSON.stringify(meta)}`
									: "";
								return `${timestamp} [${level}]: ${message}${metaStr}`;
							}),
						);

			logTransports.push(
				new transports.Console({
					format: formatOptions,
				}),
			);
		}

		// Create the logger
		this.logger = winston.createLogger({
			level,
			levels: winston.config.npm.levels,
			transports: logTransports,
		});

		this.trackTiming = trackTiming;
		this.minTimingThreshold = minTimingThreshold;
	}

	/**
	 * Log an error message
	 * @param message Message to log
	 * @param meta Additional metadata
	 */
	error(message: string, meta: Record<string, unknown> = {}): void {
		this.logger.error(message, meta);
	}

	/**
	 * Log a warning message
	 * @param message Message to log
	 * @param meta Additional metadata
	 */
	warn(message: string, meta: Record<string, unknown> = {}): void {
		this.logger.warn(message, meta);
	}

	/**
	 * Log an informational message
	 * @param message Message to log
	 * @param meta Additional metadata
	 */
	info(message: string, meta: Record<string, unknown> = {}): void {
		this.logger.info(message, meta);
	}

	/**
	 * Log a debug message
	 * @param message Message to log
	 * @param meta Additional metadata
	 */
	debug(message: string, meta: Record<string, unknown> = {}): void {
		this.logger.debug(message, meta);
	}

	/**
	 * Start timing a function
	 * @param label Label to identify the timer
	 */
	startTimer(label: string): void {
		if (!this.trackTiming) return;
		this.timers.set(label, performance.now());
	}

	/**
	 * End timing a function and log the result
	 * @param label Label to identify the timer
	 * @param meta Additional metadata
	 */
	endTimer(label: string, meta: Record<string, unknown> = {}): number {
		if (!this.trackTiming || !this.timers.has(label)) return 0;

		const startTime = this.timers.get(label) as number;
		const endTime = performance.now();
		const duration = endTime - startTime;

		// Only log if duration exceeds minimum threshold
		if (duration >= this.minTimingThreshold) {
			this.debug(`Execution time for ${label}: ${duration.toFixed(2)}ms`, {
				...meta,
				duration,
				operation: label,
			});
		}

		this.timers.delete(label);
		return duration;
	}

	/**
	 * Time the execution of an async function
	 * @param label Label to identify the timer
	 * @param fn The function to time
	 * @param meta Additional metadata
	 * @returns The result of the function
	 */
	async timeAsync<T>(
		label: string,
		fn: () => Promise<T>,
		meta: Record<string, unknown> = {},
	): Promise<T> {
		this.startTimer(label);
		try {
			const result = await fn();
			this.endTimer(label, meta);
			return result;
		} catch (error) {
			this.endTimer(label, { ...meta, error });
			throw error;
		}
	}

	/**
	 * Time the execution of a synchronous function
	 * @param label Label to identify the timer
	 * @param fn The function to time
	 * @param meta Additional metadata
	 * @returns The result of the function
	 */
	timeSync<T>(
		label: string,
		fn: () => T,
		meta: Record<string, unknown> = {},
	): T {
		this.startTimer(label);
		try {
			const result = fn();
			this.endTimer(label, meta);
			return result;
		} catch (error) {
			this.endTimer(label, { ...meta, error });
			throw error;
		}
	}
}

/**
 * Create a logger with the specified options
 * @param options Logger configuration options
 * @returns A configured logger instance
 */
export function createLogger(options: LoggerOptions = {}): WalrusLogger {
	return new WalrusLogger(options);
}

// Default logger instance with default settings
let defaultLogger = createLogger();

/**
 * Configure the default logger
 * @param options Logger configuration options
 */
export function configureLogger(options: LoggerOptions): void {
	defaultLogger = createLogger(options);
}

// Export the default logger instance
export default defaultLogger;
