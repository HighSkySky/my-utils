type Return<T> = Promise<[T, undefined] | [undefined, Error]>;

/**
 * 配合 await 以同步的模式捕获 Error，便于处理异常
 * @param { Promise } promise 
 */
export async function toAsync<T = any>(promise: Promise<T>): Return<T> {
  try {
    const result = await promise;
    return [result, undefined];
  } catch (error) {
    return [undefined, error];
  }
}
