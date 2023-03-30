import type CircuitBreaker from 'opossum';
import type PromClient from 'prom-client';
import type { CircuitBreakerMetricsOptions } from './types';

export * from './types';

/**
 * Circuit breaker metrics
 *
 * @public
 */
export class CircuitBreakerMetrics {
  /** Prometheus client */
  readonly client: typeof PromClient;

  private readonly registry: PromClient.Registry;

  private readonly counter: PromClient.Counter;
  private readonly summary: PromClient.Summary;

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
  constructor(private readonly options: CircuitBreakerMetricsOptions) {
    if (!options.enabled) {
      return;
    }

    this.metricConfig = {
      counter: {
        name:
          options.overrides?.counter?.name ??
          `${this.options.prefix ?? ''}${this.metricConfig.counter.name}`,
        labels: {
          ...this.metricConfig.counter.labels,
          ...options.overrides?.counter?.labels,
        },
      },
      summary: {
        name:
          options.overrides?.summary?.name ??
          `${this.options.prefix ?? ''}${this.metricConfig.summary.name}`,
        labels: {
          ...this.metricConfig.summary.labels,
          ...options.overrides?.summary?.labels,
        },
      },
    };

    this.client = options.client;
    this.registry = options.registry ?? this.client.register;

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

      circuitBreaker.on(eventName as any, (_: any, latencyMs?: number) => {
        this.counter.inc({
          [this.metricConfig.counter.labels.name]: circuitBreaker.name,
          [this.metricConfig.counter.labels.event]: eventName.toString(),
          ...this.options.customLabels,
        });

        if (
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
