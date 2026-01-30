/**
 * Algorithms.js - Implementation of search algorithms
 * Contains: BFS, DFS, UCS, A*, Greedy Best-First Search
 */

class SearchAlgorithms {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Breadth-First Search (BFS)
     * Explores nodes level by level using a queue (FIFO)
     * @param {string} start - Starting node name
     * @param {string} goal - Goal node name
     * @returns {Object} Result object with path, explored nodes, and metrics
     */
    bfs(start, goal) {
        const startTime = performance.now();
        const queue = [start];
        const visited = new Set();
        const parent = new Map();
        const exploredOrder = [];

        visited.add(start);
        parent.set(start, null);

        while (queue.length > 0) {
            const current = queue.shift(); // FIFO - Queue behavior
            exploredOrder.push(current);

            // Goal test
            if (current === goal) {
                const endTime = performance.now();
                return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime);
            }

            // Explore neighbors
            const neighbors = this.graph.getNeighbors(current);
            for (let neighbor of neighbors) {
                const neighborName = neighbor.node.name;
                if (!visited.has(neighborName)) {
                    visited.add(neighborName);
                    parent.set(neighborName, current);
                    queue.push(neighborName);
                }
            }
        }

        const endTime = performance.now();
        return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, false);
    }

    /**
     * Depth-First Search (DFS)
     * Explores as deep as possible using a stack (LIFO)
     * @param {string} start - Starting node name
     * @param {string} goal - Goal node name
     * @returns {Object} Result object
     */
    dfs(start, goal) {
        const startTime = performance.now();
        const stack = [start];
        const visited = new Set();
        const parent = new Map();
        const exploredOrder = [];

        parent.set(start, null);

        while (stack.length > 0) {
            const current = stack.pop(); // LIFO - Stack behavior

            if (visited.has(current)) continue;

            visited.add(current);
            exploredOrder.push(current);

            // Goal test
            if (current === goal) {
                const endTime = performance.now();
                return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime);
            }

            // Explore neighbors (in reverse order for consistent behavior)
            const neighbors = this.graph.getNeighbors(current);
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighborName = neighbors[i].node.name;
                if (!visited.has(neighborName)) {
                    if (!parent.has(neighborName)) {
                        parent.set(neighborName, current);
                    }
                    stack.push(neighborName);
                }
            }
        }

        const endTime = performance.now();
        return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, false);
    }

    /**
     * Uniform Cost Search (UCS)
     * Explores nodes in order of path cost using a priority queue
     * @param {string} start - Starting node name
     * @param {string} goal - Goal node name
     * @returns {Object} Result object
     */
    ucs(start, goal) {
        const startTime = performance.now();
        const pQueue = new PriorityQueue();
        const visited = new Set();
        const parent = new Map();
        const cost = new Map();
        const exploredOrder = [];

        pQueue.enqueue(start, 0);
        cost.set(start, 0);
        parent.set(start, null);

        while (!pQueue.isEmpty()) {
            const current = pQueue.dequeue();

            if (visited.has(current)) continue;

            visited.add(current);
            exploredOrder.push(current);

            // Goal test
            if (current === goal) {
                const endTime = performance.now();
                return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, true, cost);
            }

            // Explore neighbors
            const neighbors = this.graph.getNeighbors(current);
            for (let neighbor of neighbors) {
                const neighborName = neighbor.node.name;
                const newCost = cost.get(current) + neighbor.cost;

                if (!cost.has(neighborName) || newCost < cost.get(neighborName)) {
                    cost.set(neighborName, newCost);
                    parent.set(neighborName, current);
                    pQueue.enqueue(neighborName, newCost);
                }
            }
        }

        const endTime = performance.now();
        return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, false);
    }

    /**
     * A* Search Algorithm
     * Uses both actual cost (g) and heuristic (h) to find optimal path
     * f(n) = g(n) + h(n)
     * @param {string} start - Starting node name
     * @param {string} goal - Goal node name
     * @returns {Object} Result object
     */
    astar(start, goal) {
        const startTime = performance.now();
        const pQueue = new PriorityQueue();
        const visited = new Set();
        const parent = new Map();
        const gScore = new Map(); // Actual cost from start
        const fScore = new Map(); // Estimated total cost (g + h)
        const exploredOrder = [];

        gScore.set(start, 0);
        const startNode = this.graph.getNode(start);
        fScore.set(start, startNode.h);
        pQueue.enqueue(start, fScore.get(start));
        parent.set(start, null);

        while (!pQueue.isEmpty()) {
            const current = pQueue.dequeue();

            if (visited.has(current)) continue;

            visited.add(current);
            exploredOrder.push(current);

            // Goal test
            if (current === goal) {
                const endTime = performance.now();
                return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, true, gScore);
            }

            // Explore neighbors
            const neighbors = this.graph.getNeighbors(current);
            for (let neighbor of neighbors) {
                const neighborName = neighbor.node.name;
                const tentativeGScore = gScore.get(current) + neighbor.cost;

                if (!gScore.has(neighborName) || tentativeGScore < gScore.get(neighborName)) {
                    parent.set(neighborName, current);
                    gScore.set(neighborName, tentativeGScore);
                    const hScore = neighbor.node.h;
                    const fScoreValue = tentativeGScore + hScore;
                    fScore.set(neighborName, fScoreValue);
                    pQueue.enqueue(neighborName, fScoreValue);
                }
            }
        }

        const endTime = performance.now();
        return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, false);
    }

    /**
     * Greedy Best-First Search
     * Uses only heuristic (h) to guide search - may not find optimal path
     * @param {string} start - Starting node name
     * @param {string} goal - Goal node name
     * @returns {Object} Result object
     */
    greedy(start, goal) {
        const startTime = performance.now();
        const pQueue = new PriorityQueue();
        const visited = new Set();
        const parent = new Map();
        const cost = new Map();
        const exploredOrder = [];

        const startNode = this.graph.getNode(start);
        pQueue.enqueue(start, startNode.h);
        parent.set(start, null);
        cost.set(start, 0);

        while (!pQueue.isEmpty()) {
            const current = pQueue.dequeue();

            if (visited.has(current)) continue;

            visited.add(current);
            exploredOrder.push(current);

            // Goal test
            if (current === goal) {
                const endTime = performance.now();
                return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, true, cost);
            }

            // Explore neighbors
            const neighbors = this.graph.getNeighbors(current);
            for (let neighbor of neighbors) {
                const neighborName = neighbor.node.name;
                if (!visited.has(neighborName)) {
                    if (!parent.has(neighborName)) {
                        parent.set(neighborName, current);
                        cost.set(neighborName, cost.get(current) + neighbor.cost);
                    }
                    const hScore = neighbor.node.h;
                    pQueue.enqueue(neighborName, hScore);
                }
            }
        }

        const endTime = performance.now();
        return this.buildResult(start, goal, parent, exploredOrder, endTime - startTime, false);
    }

    /**
     * Build result object from search
     * @param {string} start - Start node
     * @param {string} goal - Goal node
     * @param {Map} parent - Parent mapping
     * @param {Array} exploredOrder - Order of explored nodes
     * @param {number} timeTaken - Time in milliseconds
     * @param {boolean} found - Whether goal was found
     * @param {Map} costMap - Cost mapping (optional)
     * @returns {Object} Result object
     */
    buildResult(start, goal, parent, exploredOrder, timeTaken, found = true, costMap = null) {
        const path = [];
        let pathCost = 0;

        if (found && parent.has(goal)) {
            // Reconstruct path
            let current = goal;
            while (current !== null) {
                path.unshift(current);
                current = parent.get(current);
            }

            // Calculate path cost
            if (costMap) {
                pathCost = costMap.get(goal) || 0;
            } else {
                // Calculate cost manually
                for (let i = 0; i < path.length - 1; i++) {
                    const neighbors = this.graph.getNeighbors(path[i]);
                    const neighbor = neighbors.find(n => n.node.name === path[i + 1]);
                    if (neighbor) {
                        pathCost += neighbor.cost;
                    }
                }
            }
        }

        return {
            found: found,
            path: path,
            pathCost: pathCost,
            nodesExplored: exploredOrder.length,
            exploredOrder: exploredOrder,
            timeTaken: timeTaken
        };
    }
}

/**
 * Priority Queue implementation for UCS, A*, and Greedy
 * Uses binary heap for efficient operations
 */
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const item = { element, priority };
        this.items.push(item);
        this.bubbleUp(this.items.length - 1);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        
        const min = this.items[0];
        const end = this.items.pop();
        
        if (this.items.length > 0) {
            this.items[0] = end;
            this.sinkDown(0);
        }
        
        return min.element;
    }

    bubbleUp(index) {
        const item = this.items[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.items[parentIndex];
            
            if (item.priority >= parent.priority) break;
            
            this.items[index] = parent;
            index = parentIndex;
        }
        this.items[index] = item;
    }

    sinkDown(index) {
        const length = this.items.length;
        const item = this.items[index];
        
        while (true) {
            let swapIndex = null;
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            
            if (leftChildIndex < length) {
                const leftChild = this.items[leftChildIndex];
                if (leftChild.priority < item.priority) {
                    swapIndex = leftChildIndex;
                }
            }
            
            if (rightChildIndex < length) {
                const rightChild = this.items[rightChildIndex];
                if (
                    (swapIndex === null && rightChild.priority < item.priority) ||
                    (swapIndex !== null && rightChild.priority < this.items[swapIndex].priority)
                ) {
                    swapIndex = rightChildIndex;
                }
            }
            
            if (swapIndex === null) break;
            
            this.items[index] = this.items[swapIndex];
            index = swapIndex;
        }
        
        this.items[index] = item;
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SearchAlgorithms, PriorityQueue };
}
