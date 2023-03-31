import type CircuitBreaker from 'opossum';
import type PromClient from 'prom-client';

/**
 * Circuit breaker metrics options
 *
 * @public
 */
export interface CircuitBreakerMetricsOptions {
  /**
   * If disabled - will not collect metrics
   *
   * @defaultValue `true`
   */
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
   * Prefix for metrics. Will be added to the beginning of metric name if no
   * `override` provided
   *
   * @example
   *
   * ```js
   * {
   *   "prefix": "my_service"
   * }
   * ```
   *
   * Will create metrics with name `my_service_circuit_breaker_counter` and
   * `my_service_circuit_breaker_performance`
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

  /** Overrides for metrics. Let you change metric name and default labels */
  overrides?: CircuitBreakerMetricsOptionsOverrides;

  /**
   * Expose performance metrics `circuit_breaker_performance` for events
   * `success` and `failure`
   *
   * @defaultValue `true`
   */
  exposePerformanceMetrics?: boolean;
}

/**
 * Circuit breaker metrics options overrides
 *
 * @public
 */
export interface CircuitBreakerMetricsOptionsOverrides {
  /** Overrides for counter metric */
  counter?: CircuitBreakerMetricsOptionsOverridesMetric;

  /** Overrides for summary metric */
  summary?: CircuitBreakerMetricsOptionsOverridesMetric;
}

/**
 * Circuit breaker metrics options overrides metric
 *
 * @public
 */
export interface CircuitBreakerMetricsOptionsOverridesMetric {
  /**
   * Metric name override
   *
   * @defaultValue `circuit_breaker_counter` for counter or `circuit_breaker_performance` for summary
   */
  name?: string;

  /** Metric default labels overrides */
  labels?: CircuitBreakerMetricsOptionsOverridesMetricLabels;
}

/**
 * Circuit breaker metrics options overrides metric labels
 *
 * @public
 */
export interface CircuitBreakerMetricsOptionsOverridesMetricLabels {
  /**
   * Name label override
   *
   * @defaultValue `name`
   */
  name?: string;

  /**
   * Event label override
   *
   * @defaultValue `event`
   */
  event?: string;
}
