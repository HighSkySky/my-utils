interface BaseData<K> {
  id: K;
  parentId?: K;
  [key: string]: any;
}

class Node<K, T extends BaseData<K> = BaseData<K>> {
  public readonly id: K;

  public readonly parentId: K | undefined;

  public readonly origin: T;

  public parent: Node<K, T> | null = null;

  public readonly children: Array<Node<K, T>> = [];

  constructor(data: T) {
    this.id = data.id;
    this.parentId = data.parentId;
    this.origin = data;

    // 避免 JSON.stringify(new Set([1,2,3])) => '{}'
    // @ts-ignore
    this.children.toJSON = function() {
      return Array.from(this);
    };
  }

  public addChildren(node: Node<K, T>) {
    if (!this.children.includes(node)) {
      this.children.push(node);
    }
  }
}

/**
 * 数结构节点遍历
 * @example
 * ```typescript
 * const tree = new NodeTree<number>([
 *  { id: 1 },
 *  { id: 2, parentId: 1 },
 * ]);
 * const result = tree.travel(
 *  'up',
 *  tree.get(2)!,
 *  (node, result = 0) => {
 *    console.log(node);
 *    return result + node.id;
 * });
 * console.log(result);
 * // 3
 * ```
 */
export class NodeTree<K, T extends BaseData<K> = BaseData<K>> {
  private readonly cache = new Map<K, Node<K, T>>();

  constructor(list?: T[]) {
    if (list) {
      this.apply(list);
    }
  }

  private sort() {
    this.cache.forEach((node) => {
      if (node.parentId) {
        const parentNode = this.cache.get(node.parentId);
        if (parentNode) {
          node.parent = parentNode;
          parentNode.addChildren(node);
        }
      }
    });
  }

  public get(id: K) {
    return this.cache.get(id);
  }

  public apply(list: T[]) {
    list.forEach((item) => {
      const node = new Node<K, T>(item);
      this.cache.set(node.id, node);
    });
    this.sort();
  }

  /**
   * 遍历节点方法
   * @param type - 向父节点 or 向子节点
   * @param node - 开始节点
   * @param handle - 遍历处理函数, 每个节点都会调用
   * @param data - 遍历处理函数的返回值
   * @returns
   */
  public travel<R>(
    type: 'up' | 'down',
    node: Node<K, T>,
    handle: (node: Node<K, T>, result?: R) => R,
    data?: R
  ): R {
    if (type === 'up') {
      if (node.parent) {
        return this.travel(type, node.parent, handle, handle(node, data));
      }
      return handle(node, data);
    }
    return Array.from(this.cache).reduce(
      (result, [_, child]) =>
        this.travel(type, child, handle, handle(child, result)),
      handle(node, data)
    );
  }
}
