import CircuitBreaker from 'opossum';
import promClient from 'prom-client';
import { CircuitBreakerMetrics } from '../src';

(async () => {
  const myCircuitBreaker = new CircuitBreaker(async () => 'my-data', {
    name: 'my-circuit-breaker',
  });

  const myCircuitBreakerMetrics = new CircuitBreakerMetrics({
    enabled: true,
    client: promClient,
    registry: promClient.register,
    circuitBreakers: [myCircuitBreaker],
    overrides: {
      counter: {
        name: 'my_cb_counter',
        labels: {
          name: 'cb_name',
          event: 'cb_event',
        },
      },
      summary: {
        name: 'my_cb_summary',
        labels: {
          name: 'cb_name',
          event: 'cb_event',
        },
      },
    },
  });

  await myCircuitBreaker.fire();

  console.log(await myCircuitBreakerMetrics.metrics);
})();
