import type CircuitBreaker from 'opossum';
import type PromClient from 'prom-client';

/**
 * Circuit breaker metrics options
 *
 * @public
 */
export interface CircuitBreakerMetricsOptions {
  /** If disabled - will not collect metrics */
  enabled?: boolean;

  /**
   * Prometheus client
   *
   * @example <caption>ES6</caption>
   *
   * @example <caption>CommonJS</caption>
   *
   * ```js
   * const client = require('prom-client');
   * ```
   */
  client: typeof PromClient;

  /**
   * Prometheus registry
   *
   * @defaultValue `client.register`
   */
  registry?: PromClient.Registry;

  /**
   * Prefix for metrics
   *
   * @example
   *
   * ```js
   * {
   *   "prefix": "my_service"
   * }
   * ```
   *
   * Will create metrics with name `my_service_circuit_breaker_counter`
   */
  prefix?: string;

  /**
   * Custom labels
   *
   * @example
   *
   * ```js
   * {
   *   "service": "my-service",
   *   "version": "1.0.0"
   * }
   * ```
   */
  customLabels?: Record<string, string>;

  /** List of opossum circuit breaker events to ignore */
  eventsBlacklist?: string[];

  /** List of circuit breakers to collect metrics for */
  circuitBreakers?: CircuitBreaker[];
}
