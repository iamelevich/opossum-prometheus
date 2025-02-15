import test from 'ava';
import CircuitBreaker from 'opossum';
import promClient from 'prom-client';
import { CircuitBreakerMetrics } from '../src';
import type { CircuitBreakerMetricsOptions } from '../src/types';

const circuitBreakerMetricsFactory = (
	options: Omit<CircuitBreakerMetricsOptions, 'client' | 'registry'>,
): CircuitBreakerMetrics => {
	const registry = new promClient.Registry();
	return new CircuitBreakerMetrics({
		client: promClient,
		registry,
		...options,
	});
};

test('enabled by default', async (t) => {
	const metrics = circuitBreakerMetricsFactory({});
	t.is(metrics instanceof CircuitBreakerMetrics, true);

	const resultMetricsText = await metrics.metrics;
	t.regex(resultMetricsText, /circuit_breaker_counter/);
	t.regex(resultMetricsText, /circuit_breaker_performance/);
});

test('instance created when is enabled and metrics were created', async (t) => {
	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
	});
	t.is(metrics instanceof CircuitBreakerMetrics, true);

	const resultMetricsText = await metrics.metrics;
	t.regex(resultMetricsText, /circuit_breaker_counter/);
	t.regex(resultMetricsText, /circuit_breaker_performance/);
});

test('instance created when disabled and no metrics were created', async (t) => {
	const metrics = circuitBreakerMetricsFactory({
		enabled: false,
	});
	t.is(metrics instanceof CircuitBreakerMetrics, true);

	t.is(await metrics.metrics, '');
});

test('not fail on method calls when disabled', async (t) => {
	const metrics = circuitBreakerMetricsFactory({
		enabled: false,
	});
	t.notThrows(() => {
		metrics.clear();
	});

	const testCircuitBreaker = new CircuitBreaker(async () => 'test');
	t.notThrows(() => {
		metrics.add(testCircuitBreaker);
	});

	t.is(await metrics.metrics, '');
});

test('collect and clear metrics', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		circuitBreakers: [testCircuitBreaker],
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="fire"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_performance_count{name="test",event="success"} 2/,
	);

	metrics.clear();

	t.is(await metrics.metrics, '\n');
});

test('collect metrics with prefix', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		prefix: 'test_',
		circuitBreakers: [testCircuitBreaker],
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/test_circuit_breaker_counter{name="test",event="fire"} 2/,
	);
	t.regex(
		resultMetricsText,
		/test_circuit_breaker_counter{name="test",event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/test_circuit_breaker_performance_count{name="test",event="success"} 2/,
	);
});

test('collect metrics with customLabels', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		circuitBreakers: [testCircuitBreaker],
		customLabels: {
			service: 'my_test_service',
		},
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="fire",service="my_test_service"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="success",service="my_test_service"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_performance_count{name="test",event="success",service="my_test_service"} 2/,
	);
});

test('collect metrics and ignore events', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		circuitBreakers: [testCircuitBreaker],
		eventsBlacklist: ['fire'],
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.notRegex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="fire"}/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_performance_count{name="test",event="success"} 2/,
	);
});

test('collect metrics with default registry', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = new CircuitBreakerMetrics({
		enabled: true,
		client: promClient,
		circuitBreakers: [testCircuitBreaker],
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="fire"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_performance_count{name="test",event="success"} 2/,
	);
});

test('collect metrics with more than one circuit breaker', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const test2CircuitBreaker = new CircuitBreaker(async () => 'test2', {
		name: 'test2',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		circuitBreakers: [testCircuitBreaker],
	});

	metrics.add(test2CircuitBreaker);

	await testCircuitBreaker.fire();
	await test2CircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="fire"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_performance_count{name="test",event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test2",event="fire"} 1/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test2",event="success"} 1/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_performance_count{name="test2",event="success"} 1/,
	);

	metrics.clear();

	t.is(await metrics.metrics, '\n');
});

test('collect metrics with overrides', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		circuitBreakers: [testCircuitBreaker],
		overrides: {
			counter: {
				name: 'test_circuit_breaker_counter',
				labels: {
					name: 'test_counter_name',
					event: 'test_counter_event',
				},
			},
			summary: {
				name: 'test_circuit_breaker_performance',
				labels: {
					name: 'test_summary_name',
					event: 'test_summary_event',
				},
			},
		},
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/test_circuit_breaker_counter{test_counter_name="test",test_counter_event="fire"} 2/,
	);
	t.regex(
		resultMetricsText,
		/test_circuit_breaker_counter{test_counter_name="test",test_counter_event="success"} 2/,
	);
	t.regex(
		resultMetricsText,
		/test_circuit_breaker_performance_count{test_summary_name="test",test_summary_event="success"} 2/,
	);
});

test('not collect performance metrics with exposePerformanceMetrics = false', async (t) => {
	const testCircuitBreaker = new CircuitBreaker(async () => 'test', {
		name: 'test',
	});

	const metrics = circuitBreakerMetricsFactory({
		enabled: true,
		circuitBreakers: [testCircuitBreaker],
		exposePerformanceMetrics: false,
	});

	await testCircuitBreaker.fire();
	await testCircuitBreaker.fire();

	const resultMetricsText = await metrics.metrics;

	t.not(resultMetricsText, '');

	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="fire"} 2/,
	);
	t.regex(
		resultMetricsText,
		/circuit_breaker_counter{name="test",event="success"} 2/,
	);
	t.notRegex(resultMetricsText, /circuit_breaker_performance/);
});
