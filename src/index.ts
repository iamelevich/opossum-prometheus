/**
 * A library that adds metrics to the `opossum` circuit breaker
 *
 * @packageDocumentation
 */

import type CircuitBreaker from 'opossum';
import type PromClient from 'prom-client';
import type { CircuitBreakerMetricsOptions } from './types';

/**
 * Circuit breaker metrics
 *
 * @example
 *
 * ```ts
 * import { CircuitBreakerMetrics } from '@iamelevich/opossum-prometheus';
 * import CircuitBreaker from 'opossum';
 * import promClient from 'prom-client';
 *
 * const myCircuitBreaker = new CircuitBreaker(async () => 'my-data', {
 *   name: 'my-circuit-breaker',
 * });
 *
 * const myCircuitBreakerMetrics = new CircuitBreakerMetrics({
 *   enabled: true,
 *   client: promClient,
 *   registry: promClient.register,
 *   circuitBreakers: [myCircuitBreaker],
 * });
 * await myCircuitBreaker.fire();
 * console.log(await myCircuitBreakerMetrics.metrics);
 * ```
 *
 * @public
 * @see {@link CircuitBreakerMetricsOptions} for configuration options
 */
export class CircuitBreakerMetrics {
  /** Prometheus client */
  readonly client: typeof PromClient;

  private readonly registry: PromClient.Registry;
  private readonly options: CircuitBreakerMetricsOptions;

  private readonly counter: PromClient.Counter;
  private readonly summary?: PromClient.Summary;

  private readonly metricConfig = {
    counter: {
      name: 'circuit_breaker_counter',
      labels: {
        name: 'name',
        event: 'event',
      },
    },
    summary: {
      name: 'circuit_breaker_performance',
      labels: {
        name: 'name',
        event: 'event',
      },
    },
  };

  /** Returns all metrics */
  get metrics(): Promise<string> {
    if (!this.options.enabled) {
      return Promise.resolve('');
    }

    return this.registry.metrics();
  }

  /**
   * Constructor of CircuitBreakerMetrics
   *
   * @param options - Options
   * @returns
   */
  constructor(options: CircuitBreakerMetricsOptions) {
    this.options = {
      enabled: true,
      exposePerformanceMetrics: true,
      ...options,
    };

    if (!this.options.enabled) {
      return;
    }

    this.metricConfig = {
      counter: {
        name:
          this.options.overrides?.counter?.name ??
          `${this.options.prefix ?? ''}${this.metricConfig.counter.name}`,
        labels: {
          ...this.metricConfig.counter.labels,
          ...this.options.overrides?.counter?.labels,
        },
      },
      summary: {
        name:
          this.options.overrides?.summary?.name ??
          `${this.options.prefix ?? ''}${this.metricConfig.summary.name}`,
        labels: {
          ...this.metricConfig.summary.labels,
          ...this.options.overrides?.summary?.labels,
        },
      },
    };

    this.client = this.options.client;
    this.registry = this.options.registry ?? this.client.register;

    this.counter = new this.client.Counter({
      name: this.metricConfig.counter.name,
      help: 'Circuit breaker counter',
      registers: [this.registry],
      labelNames: [
        this.metricConfig.counter.labels.name,
        this.metricConfig.counter.labels.event,
        ...Object.keys(this.options.customLabels ?? {}),
      ],
    });

    if (this.options.exposePerformanceMetrics) {
      this.summary = new this.client.Summary({
        name: this.metricConfig.summary.name,
        help: 'Circuit breaker performance summary',
        registers: [this.registry],
        labelNames: [
          this.metricConfig.summary.labels.name,
          this.metricConfig.summary.labels.event,
          ...Object.keys(this.options.customLabels ?? {}),
        ],
      });
    }

    for (const circuitBreaker of this.options.circuitBreakers ?? []) {
      this.add(circuitBreaker);
    }
  }

  /**
   * Start collecting metrics for circuit breaker
   *
   * @param circuitBreaker - Circuit breaker instance
   * @returns
   */
  add(circuitBreaker: CircuitBreaker): void {
    if (!this.options.enabled) {
      return;
    }

    for (const eventName of circuitBreaker.eventNames()) {
      // Skip blacklisted events
      if (this.options.eventsBlacklist?.includes(eventName.toString())) {
        continue;
      }

      // Register event listener to collect metrics
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      circuitBreaker.on(eventName as any, (_: any, latencyMs?: number) => {
        this.counter.inc({
          [this.metricConfig.counter.labels.name]: circuitBreaker.name,
          [this.metricConfig.counter.labels.event]: eventName.toString(),
          ...this.options.customLabels,
        });

        // Collect performance metrics only if enabled
        if (
          this.options.exposePerformanceMetrics &&
          this.summary &&
          (eventName === 'success' || eventName === 'failure') &&
          latencyMs !== undefined
        ) {
          this.summary
            .labels(
              circuitBreaker.name,
              eventName,
              ...Object.values(this.options.customLabels ?? {})
            )
            .observe(latencyMs);
        }
      });
    }
  }

  /** Clear registry */
  clear() {
    if (!this.options.enabled) {
      return;
    }

    // Clear registry
    this.registry.clear();
  }
}

export * from './types';
