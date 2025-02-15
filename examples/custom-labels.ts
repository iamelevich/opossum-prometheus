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
		customLabels: {
			service: 'my-service',
			version: '1.0.0',
		},
	});

	await myCircuitBreaker.fire();

	console.log(await myCircuitBreakerMetrics.metrics);
})();
