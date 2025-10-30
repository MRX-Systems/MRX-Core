export const LOGGER_ERROR_KEYS = {
	BEFORE_EXIT_CLOSE_ERROR: 'mrx-core.logger.error.before_exit_close_error',
	BEFORE_EXIT_FLUSH_ERROR: 'mrx-core.logger.error.before_exit_flush_error',
	NO_SINKS_PROVIDED: 'mrx-core.logger.error.no_sinks_provided',
	REGISTER_SINK_ERROR: 'mrx-core.logger.error.register_sink_error',
	SINK_ALREADY_ADDED: 'mrx-core.logger.error.sink_already_added',
	SINK_CLOSE_ERROR: 'mrx-core.logger.error.sink_close_error',
	SINK_LOG_ERROR: 'mrx-core.logger.error.sink_log_error'
} as const;