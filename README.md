# opossum-prometheus

[![Test](https://github.com/iamelevich/opossum-prometheus/actions/workflows/test.yml/badge.svg)](https://github.com/iamelevich/opossum-prometheus/actions/workflows/test.yml)
[![cov](https://iamelevich.github.io/opossum-prometheus/badges/coverage.svg)](https://github.com/iamelevich/opossum-prometheus/actions)

This library add [Prometheus](https://prometheus.io/) metrics to the [opossum](https://github.com/nodeshift/opossum) circuit breaker. It based on [opossum-prometheus](https://github.com/nodeshift/opossum-prometheus) with some improvements:

- No direct dependencies, only peer dependencies on prom-client and opossum
- Written in typescript
- Have ability to add custom metrics
- Have ability to blacklist events if you don't need them

## ToC

- [opossum-prometheus](#opossum-prometheus)
  - [ToC](#toc)
  - [Install](#install)
  - [Usage](#usage)
  - [Docs](#docs)
  - [License](#license)

## Install

With NPM:

```sh
npm i -s @iamelevich/opossum-prometheus
```

With Yarn:

```sh
yarn add @iamelevich/opossum-prometheus
```

With PNPM:

```sh
pnpm add @iamelevich/opossum-prometheus
```

## Usage

```ts
import CircuitBreaker from 'opossum';
import promClient from 'prom-client';
import { CircuitBreakerMetrics } from '@iamelevich/opossum-prometheus';

const myCircuitBreaker = new CircuitBreaker(
    async () => /* Do something */,
    {
        name: 'my-circuit-breaker',
    }
);

const myCircuitBreakerMetrics = new CircuitBreakerMetrics({
    enabled: true,
    client: promClient,
    registry: promClient.register,
    circuitBreakers: [myCircuitBreaker],
});

await myCircuitBreaker.fire();

console.log(await myCircuitBreakerMetrics.metrics);

// # HELP circuit_breaker_counter Circuit breaker counter
// # TYPE circuit_breaker_counter counter
// circuit_breaker_counter{name="my-circuit-breaker",event="fire"} 1
// circuit_breaker_counter{name="my-circuit-breaker",event="success"} 1

// # HELP circuit_breaker_performance Circuit breaker performance summary
// # TYPE circuit_breaker_performance summary
// circuit_breaker_performance{quantile="0.01",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance{quantile="0.05",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance{quantile="0.5",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance{quantile="0.9",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance{quantile="0.95",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance{quantile="0.99",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance{quantile="0.999",name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance_sum{name="my-circuit-breaker",event="success"} 0
// circuit_breaker_performance_count{name="my-circuit-breaker",event="success"} 1

```

<sub>[Back to top](#toc)</sub>

## Docs

Full documentation you can find in [doc folder](./doc/opossum-prometheus.md)

Options:
| Property | Modifiers | Type | Description |
| -------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| [circuitBreakers?](./doc/opossum-prometheus.circuitbreakermetricsoptions.circuitbreakers.md) | | CircuitBreaker\[\] | _(Optional)_ List of circuit breakers to collect metrics for |
| [client](./doc/opossum-prometheus.circuitbreakermetricsoptions.client.md) | | typeof PromClient | Prometheus client |
| [customLabels?](./doc/opossum-prometheus.circuitbreakermetricsoptions.customlabels.md) | | Record&lt;string, string&gt; | _(Optional)_ Custom labels |
| [enabled?](./doc/opossum-prometheus.circuitbreakermetricsoptions.enabled.md) | | boolean | _(Optional)_ If disabled - will not collect metrics |
| [eventsBlacklist?](./doc/opossum-prometheus.circuitbreakermetricsoptions.eventsblacklist.md) | | string\[\] | _(Optional)_ List of opossum circuit breaker events to ignore |
| [overrides?](./doc/opossum-prometheus.circuitbreakermetricsoptions.overrides.md) | | [CircuitBreakerMetricsOptionsOverrides](./opossum-prometheus.circuitbreakermetricsoptionsoverrides.md) | <p>_(Optional)_ Overrides for metrics. Let you change metric name and default labels</p><p> 1.1.0</p> |
| [prefix?](./doc/opossum-prometheus.circuitbreakermetricsoptions.prefix.md) | | string | _(Optional)_ Prefix for metrics. Will be added to the beginning of metric name if no <code>override</code> provided |
| [registry?](./doc/opossum-prometheus.circuitbreakermetricsoptions.registry.md) | | PromClient.Registry | _(Optional)_ Prometheus registry |

<sub>[Back to top](#toc)</sub>

## License

Licensed under [MIT](./LICENSE).

<sub>[Back to top](#toc)</sub>
