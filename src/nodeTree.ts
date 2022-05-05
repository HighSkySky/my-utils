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

  public readonly children: Set<Node<K, T>> = new Set();

  constructor(data: T) {
    this.id = data.id;
    this.parentId = data.parentId;
    this.origin = data;
  }
}

export enum NodeTreeTravelType {
  Parent = 0,
  Child = 1,
}

/**
 * 数结构节点遍历
 * @example
 * ```typescript
 * const tree = new NodeTree<number>();
 * tree.init([
 *  { id: 1 },
 *  { id: 2, parentId: 1 },
 * ]);
 * const result = tree.travel(
 *  NodeTreeTravelType.Parent,
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

  private sort() {
    this.cache.forEach((node) => {
      if (node.parentId) {
        const parentNode = this.cache.get(node.parentId);
        if (parentNode) {
          node.parent = parentNode;
          parentNode.children.add(node);
        }
      }
    });
  }

  public get(id: K) {
    return this.cache.get(id);
  }

  public init(list: T[]) {
    list.forEach((item) => {
      const node = new Node<K, T>(item);
      this.cache.set(node.id, node);
    });
    this.sort();
  }

  /**
   * 遍历节点方法
   * @param type - 遍历方向, true 向父节点, false 向子节点
   * @param node - 开始节点
   * @param handle - 遍历处理函数, 每个节点都会调用
   * @param data - 遍历处理函数的返回值
   * @returns
   */
  public travel<R>(
    type: NodeTreeTravelType,
    node: Node<K, T>,
    handle: (node: Node<K, T>, result?: R) => R,
    data?: R
  ): R {
    if (type === NodeTreeTravelType.Parent) {
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
