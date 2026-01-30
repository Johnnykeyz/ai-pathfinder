/**
 * Graph.js - Graph data structure for pathfinding algorithms
 * Manages nodes, edges, and provides graph operations
 */

class Graph {
    constructor() {
        this.nodes = new Map(); // Map of node name -> node object
        this.edges = new Map(); // Map of node name -> array of edges
        this.initializeDefaultGraph();
    }

    /**
     * Initialize a default graph for demonstration
     */
    initializeDefaultGraph() {
        // Create default nodes with positions and heuristics
        const defaultNodes = [
            { name: 'A', x: 100, y: 100, h: 7 },
            { name: 'B', x: 250, y: 80, h: 6 },
            { name: 'C', x: 150, y: 200, h: 5 },
            { name: 'D', x: 300, y: 200, h: 4 },
            { name: 'E', x: 400, y: 150, h: 2 },
            { name: 'F', x: 200, y: 300, h: 3 },
            { name: 'G', x: 350, y: 320, h: 1 },
            { name: 'Goal', x: 450, y: 280, h: 0 }
        ];

        defaultNodes.forEach(node => {
            this.addNode(node.name, node.x, node.y, node.h);
        });

        // Create default edges (bidirectional)
        const defaultEdges = [
            { from: 'A', to: 'B', cost: 2 },
            { from: 'A', to: 'C', cost: 3 },
            { from: 'B', to: 'D', cost: 3 },
            { from: 'B', to: 'E', cost: 4 },
            { from: 'C', to: 'D', cost: 2 },
            { from: 'C', to: 'F', cost: 4 },
            { from: 'D', to: 'E', cost: 1 },
            { from: 'D', to: 'G', cost: 3 },
            { from: 'E', to: 'Goal', cost: 2 },
            { from: 'F', to: 'G', cost: 2 },
            { from: 'G', to: 'Goal', cost: 3 }
        ];

        defaultEdges.forEach(edge => {
            this.addEdge(edge.from, edge.to, edge.cost, true);
        });
    }

    /**
     * Add a node to the graph
     * @param {string} name - Node identifier
     * @param {number} x - X coordinate for visualization
     * @param {number} y - Y coordinate for visualization
     * @param {number} h - Heuristic value (estimated cost to goal)
     */
    addNode(name, x, y, h = 0) {
        if (this.nodes.has(name)) {
            console.warn(`Node ${name} already exists. Updating...`);
        }
        
        this.nodes.set(name, {
            name: name,
            x: x,
            y: y,
            h: h // Heuristic value for informed search
        });

        // Initialize empty edge list for this node
        if (!this.edges.has(name)) {
            this.edges.set(name, []);
        }
    }

    /**
     * Add an edge between two nodes
     * @param {string} from - Source node
     * @param {string} to - Destination node
     * @param {number} cost - Edge cost/weight
     * @param {boolean} bidirectional - If true, add edge in both directions
     */
    addEdge(from, to, cost = 1, bidirectional = false) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
            console.error(`Cannot add edge: Node ${from} or ${to} does not exist`);
            return false;
        }

        // Add edge from -> to
        const fromEdges = this.edges.get(from);
        // Check if edge already exists
        const existingEdge = fromEdges.find(e => e.to === to);
        if (existingEdge) {
            existingEdge.cost = cost; // Update cost
        } else {
            fromEdges.push({ to: to, cost: cost });
        }

        // Add reverse edge if bidirectional
        if (bidirectional) {
            const toEdges = this.edges.get(to);
            const existingReverseEdge = toEdges.find(e => e.to === from);
            if (existingReverseEdge) {
                existingReverseEdge.cost = cost;
            } else {
                toEdges.push({ to: from, cost: cost });
            }
        }

        return true;
    }

    /**
     * Remove a node and all associated edges
     * @param {string} name - Node to remove
     */
    removeNode(name) {
        if (!this.nodes.has(name)) {
            return false;
        }

        // Remove all edges pointing to this node
        for (let [nodeName, edges] of this.edges) {
            this.edges.set(nodeName, edges.filter(edge => edge.to !== name));
        }

        // Remove node and its edges
        this.nodes.delete(name);
        this.edges.delete(name);
        return true;
    }

    /**
     * Get neighbors of a node
     * @param {string} nodeName - Node to get neighbors for
     * @returns {Array} Array of {node, cost} objects
     */
    getNeighbors(nodeName) {
        if (!this.edges.has(nodeName)) {
            return [];
        }

        return this.edges.get(nodeName).map(edge => ({
            node: this.nodes.get(edge.to),
            cost: edge.cost
        }));
    }

    /**
     * Get a node by name
     * @param {string} name - Node name
     * @returns {Object|null} Node object or null
     */
    getNode(name) {
        return this.nodes.get(name) || null;
    }

    /**
     * Get all nodes
     * @returns {Array} Array of all nodes
     */
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * Get all edges for visualization
     * @returns {Array} Array of edge objects
     */
    getAllEdges() {
        const allEdges = [];
        for (let [from, edges] of this.edges) {
            const fromNode = this.nodes.get(from);
            edges.forEach(edge => {
                const toNode = this.nodes.get(edge.to);
                allEdges.push({
                    from: fromNode,
                    to: toNode,
                    cost: edge.cost
                });
            });
        }
        return allEdges;
    }

    /**
     * Clear all nodes and edges
     */
    clear() {
        this.nodes.clear();
        this.edges.clear();
    }

    /**
     * Check if graph is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.nodes.size === 0;
    }

    /**
     * Get graph statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        let totalEdges = 0;
        for (let edges of this.edges.values()) {
            totalEdges += edges.length;
        }

        return {
            nodeCount: this.nodes.size,
            edgeCount: totalEdges,
            avgDegree: this.nodes.size > 0 ? (totalEdges / this.nodes.size).toFixed(2) : 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Graph;
}
