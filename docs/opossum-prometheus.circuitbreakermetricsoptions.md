<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@imelevich/opossum-prometheus](./opossum-prometheus.md) &gt; [CircuitBreakerMetricsOptions](./opossum-prometheus.circuitbreakermetricsoptions.md)

## CircuitBreakerMetricsOptions interface

Circuit breaker metrics options

**Signature:**

```typescript
export interface CircuitBreakerMetricsOptions
```

## Properties

| Property                                                                                 | Modifiers | Type                         | Description                                                   |
| ---------------------------------------------------------------------------------------- | --------- | ---------------------------- | ------------------------------------------------------------- |
| [circuitBreakers?](./opossum-prometheus.circuitbreakermetricsoptions.circuitbreakers.md) |           | CircuitBreaker\[\]           | _(Optional)_ List of circuit breakers to collect metrics for  |
| [client](./opossum-prometheus.circuitbreakermetricsoptions.client.md)                    |           | typeof PromClient            | Prometheus client                                             |
| [customLabels?](./opossum-prometheus.circuitbreakermetricsoptions.customlabels.md)       |           | Record&lt;string, string&gt; | _(Optional)_ Custom labels                                    |
| [enabled?](./opossum-prometheus.circuitbreakermetricsoptions.enabled.md)                 |           | boolean                      | _(Optional)_ If disabled - will not collect metrics           |
| [eventsBlacklist?](./opossum-prometheus.circuitbreakermetricsoptions.eventsblacklist.md) |           | string\[\]                   | _(Optional)_ List of opossum circuit breaker events to ignore |
| [prefix?](./opossum-prometheus.circuitbreakermetricsoptions.prefix.md)                   |           | string                       | _(Optional)_ Prefix for metrics                               |
| [registry?](./opossum-prometheus.circuitbreakermetricsoptions.registry.md)               |           | PromClient.Registry          | _(Optional)_ Prometheus registry                              |