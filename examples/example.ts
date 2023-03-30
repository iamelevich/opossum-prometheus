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
  });

  await myCircuitBreaker.fire();

  console.log(await myCircuitBreakerMetrics.metrics);
})();
