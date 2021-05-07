/**
 * 双向链表节点类
 */
class LinkedListNode {
    constructor(data) {
        this.data = data
        this.prev = null
        this.next = null
    }
}

/**
 * 双向链表类
 */
class LinkedList {
    /**
     * @param {Array} items 初始化数据数组
     */
    constructor(items) {
        this.clear = () => {
            this._head = null
            this._tail = null
            this._size = 0
        }
        this.clear()
        this[Symbol.iterator] = this.iterator
        this.values = () => [...this]
        if (items && typeof items[Symbol.iterator] === 'function') {
            for (const item of items) this.append(item)
        }
    }

    /**
     * 返回链表头节点或null
     * @returns {Node}
     */
    get head() {
        return this._head
    }

    /**
     * 返回链表尾节点或null
     * @returns {Node}
     */
    get tail() {
        return this._tail
    }

    /**
     * 返回链表头节点数据或undefined
     * @returns {*}
     */
    get first() {
        return this._head?.data
    }

    /**
     * 修改头节点的值，成功返回true
     * @returns {Boolean}
     */
    set first(data) {
        if (data === undefined) return false
        if (this._head) this._head.data = data
        else this.prepend(data)
        return true
    }

    /**
     * 返回链表尾节点数据或undefined
     * @returns {*}
     */
    get last() {
        return this._tail?.data
    }

    /**
     * 修改尾节点的值，成功返回true
     * @returns {Boolean}
     */
    set last(data) {
        if (data === undefined) return false
        if (this._tail) this._tail.data = data
        else this.append(data)
        return true
    }

    /**
     * 返回链表长度
     * @returns {Number}
     */
    get length() {
        return this._size
    }

    /**
     * 在链表头添加数据
     * @param {*} data
     * @returns {Node}
     */
    prepend(data) {
        if (data === undefined) return null
        const node = new LinkedListNode(data)
        if (this._size === 0) {
            this._head = node
            this._tail = node
        } else {
            node.next = this._head
            this._head.prev = node
            this._head = node
        }
        this._size++
        return node
    }

    /**
     * 在链表尾添加数据
     * @param {*} data
     * @returns {Node}
     */
    append(data) {
        if (data === undefined) return null
        const node = new LinkedListNode(data)
        if (this._size === 0) {
            this._head = node
            this._tail = node
        } else {
            node.prev = this._tail
            this._tail.next = node
            this._tail = node
        }
        this._size++
        return node
    }

    /**
     * 取出头节点，并返回其数据，链表为空时返回 undefined
     * @returns {*} 头节点数据
     */
    shift() {
        if (this._head === null) return undefined
        const data = this._head.data
        this._head = this._head.next
        if (this._head) this._head.prev = null
        else this._tail = null
        this._size--
        return data
    }

    /**
     * 取出尾节点，并返回其数据，链表为空时返回 undefined
     * @returns {*} 尾节点数据
     */
    pop() {
        if (this._tail === null) return undefined
        const data = this._tail.data
        this._tail = this._tail.prev
        if (this._tail) this._tail.next = null
        else this._head = null
        this._size--
        return data
    }

    /**
     * 查找数据并返回其节点位置，未找到时返回 -1
     * @param {*} data
     * @returns {Number}
     */
    index(data) {
        if (data === undefined) return -1
        for (let i = 0, node = this._head; node; i++, node = node.next) {
            if (node.data == data) return i
        }
        return -1
    }

    /**
     * 返回链表是否含有指定数据
     * @param {*} data
     * @returns {Boolean}
     */
    contains(data) {
        return this.index(data) !== -1
    }

    /**
     * 获取指定位置上的节点, 位置越界时返回 null
     * @param {Number} index
     * @returns {Node}
     */
    node(index) {
        if (isNaN(index) || index < 0 || this._size <= index) return null
        let node = this._head
        for (let i = 0; i < index; i++) node = node.next
        return node
    }

    /**
     * 获取指定位置上节点的数据, 位置越界时返回 undefined
     * @param {Number} index
     * @returns {Node}
     */
    get(index) {
        const node = this.node(index)
        return node?.data
    }

    /**
     * 在链表指定位置添加节点，成功返回该节点，失败返回 null
     * @param {*} index
     * @param {*} data
     * @returns {Node}
     */
    insert(index, data) {
        if (data == undefined) return null
        // 插入位置越界
        if (isNaN(index) || index < 0 || this._size < index) return null
        // 当链表为空或在链表最后位置插入时，以调用append处理
        if (index === 0) return this.prepend(data)
        if (index === this._size) return this.append(data)
        // 此时链表不为空，index指向的原有节点成为新节点的后继
        const current = this.node(index)
        if (current) {
            const node = new LinkedListNode(data)
            node.prev = current.prev
            node.next = current
            current.prev.next = node
            current.prev = node
            this._size++
            return node
        }
    }

    /**
     * 修改指定位置节点，成功返回 true，否则返回 false
     * @param {*} index
     * @param {*} data
     * @returns {Boolean}
     */
    set(index, data) {
        if (data === undefined) return false
        const node = this.node(index)
        if (!node) return false
        node.data = data
        return true
    }

    /**
     * 删除指定位置上的节点，返回其数据 data / undefined
     * @param {Number} index
     * @returns {*}
     */
    remove(index) {
        if (isNaN(index) || index < 0 || this._size <= index) return undefined
        let data
        if (index === 0) {
            data = this._head.data
            if (this._size === 1) {
                this._head = null
                this._tail = null
            } else {
                this._head.next.prev = null
                this._head = this._head.next
            }
        } else if (index === this._size - 1) {
            data = this._tail.data
            this._tail.prev.next = null
            this._tail = this._tail.prev
        } else {
            const node = this.node(index)
            data = node?.data
            node.prev.next = node.next
            node.next.prev = node.prev
        }
        this._size--
        return data
    }

    /**
     * 链表数据生成器（正序）
     * @returns {Generator}
     */
    *iterator() {
        let node = this._head
        while (node) {
            yield node.data
            node = node.next
        }
    }

    /**
     * 链表数据生成器（倒序）
     * @returns {Generator}
     */
    *reversedIterator() {
        let node = this._tail
        while (node) {
            yield node.data
            node = node.prev
        }
    }
}

/**
 * 优先队列
 */
class PriorityQueue {
    constructor() {
        this.items = new LinkedList()
        this.clear = () => this.items.clear()
        this.enqueue = (element, priority) => {
            if (this.length === 0) return this.items.append({ element, priority })
            let node = this.items._head
            let i = 0
            while (node !== null && node.data.priority < priority) {
                node = node.next
                i++
            }
            if (node === null) return this.items.append({ element, priority })
            else return this.items.insert(i, { element, priority })
        }
        this.dequeuemin = () => this.items.shift()?.element
        this.dequeuemax = () => this.items.pop()?.element
    }

    delete(element) {
        for (let i = 0, node = this.items._head; node; i++, node = node.next) {
            if (node.data.element === element) return this.items.remove(i)
        }
    }

    values() {
        const result = []
        for (const item of this.items) result.push(item.element)
        return result
    }

    get length() {
        return this.items.length
    }

    get isEmpty() {
        return this.items.length === 0
    }

    get min() {
        return this.items.first?.element
    }

    get max() {
        return this.items.last?.element
    }
}
