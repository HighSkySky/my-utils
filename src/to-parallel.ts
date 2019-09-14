import { toAsync } from "./to-async";

type AsyncFunc<T> = () => Promise<T>;

/**
 * 并发执行异步函数，并且可以设置最大并发值
 * @param params 
 * @param { Array } params.asyncFuncList - 异步函数集合
 * @param { number } params.limit - 最大并发值
 */
export async function toParallel(params: {
  asyncFuncList: AsyncFunc<any>[];
  limit: number;
}): Promise<number> {
  const asyncFuncList = params.asyncFuncList.slice();
  const limit = params.limit;
  let running = 0;
  let success = 0;

  async function next(resolve: (num: number) => void, isInit?: boolean) {
    if (isInit || (running < limit && asyncFuncList.length > 0)) {
      const asyncFunc = asyncFuncList.shift();
      running = running + 1;
      const [, error] = await toAsync(asyncFunc());
      running = running - 1;
      success = error ? success : success + 1;
      next(resolve);
    } else if (running === 0 && asyncFuncList.length === 0) {
      resolve(success);
    }
  }

  return new Promise((resolve) => {
    // 初始化最初的并发
    while(running < limit && asyncFuncList.length > 0) {
      next(resolve, true);
    }
  })
}
