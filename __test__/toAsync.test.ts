import { toAsync } from '../src/toAsync';

describe('test src/toAsync.ts', () => {
  test('the param is a not a promise', async () => {
    const [result, error] = await toAsync(true as any);
    expect(result).toBe(true);
    expect(error).toBe(undefined);
  });

  test('the param is a promise and will be resolved', async () => {
    function testAsync() {
      return Promise.resolve(true);
    }
    const [result, error] = await toAsync(testAsync());
    expect(result).toBe(true);
    expect(error).toBe(undefined);
  });

  test('the param is a promise and will be rejected', async () => {
    function testAsync() {
      return new Promise(() => {
        throw new Error('this is a promise error');
      });
    }
    const [result, error] = await toAsync(testAsync());
    expect(result).toBe(undefined);
    expect(error).not.toBe(undefined);
    expect(error!.message).toBe('this is a promise error');
  });
});
