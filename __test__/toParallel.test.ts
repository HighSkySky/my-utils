import { toParallel } from '../src/toParallel';
import { toAsync } from '../src/toAsync';

describe('test src/toParallel', () => {
  function createPromiseResolve(ms: number) {
    return () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, ms);
      });
  }

  test('test param, asyncFuncList must be function array', async () => {
    const [, error] = await toAsync(toParallel([1, 2, 3] as any));
    expect(error).not.toBe(undefined);
    expect(error!.message).toBe('asyncFuncList must be function array');
  });

  test('test param, limit must be number', async () => {
    const [, error] = await toAsync(toParallel([], 'asv' as any));
    expect(error).not.toBe(undefined);
    expect(error!.message).toBe('limitNum must be number');
  });

  test('test param, limit must >= 1', async () => {
    const [, error] = await toAsync(toParallel([], 0));
    expect(error).not.toBe(undefined);
    expect(error!.message).toBe('limitNum must >= 1 or not provided');
  });

  test('when limit is not provided toParallel like Promise.all', async () => {
    const startTime = new Date().getTime();
    const [result, error] = await toAsync(
      toParallel([
        createPromiseResolve(1000),
        createPromiseResolve(500),
        createPromiseResolve(1500),
      ])
    );
    const endTime = new Date().getTime();
    result!.map((item) => expect(item).toBe(true));
    expect(error).toBe(undefined);
    expect(endTime - startTime).toBeLessThan(1800);
  });

  test('current param', async () => {
    const startTime = new Date().getTime();
    const [result, error] = await toAsync(
      toParallel(
        [
          createPromiseResolve(1000),
          createPromiseResolve(500),
          createPromiseResolve(1500),
          createPromiseResolve(1000),
          createPromiseResolve(500),
        ],
        3
      )
    );
    const endTime = new Date().getTime();
    result!.map((item) => expect(item).toBe(true));
    expect(error).toBe(undefined);
    expect(endTime - startTime).toBeLessThan(1800);
  });
});
