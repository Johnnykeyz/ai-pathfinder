/**
 * Visualizer.js - Canvas visualization for graph and algorithms
 * Handles rendering of nodes, edges, and animation of search process
 */

class GraphVisualizer {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graph = graph;
        this.animationSpeed = 500; // milliseconds per step
        this.currentStep = 0;
        this.isAnimating = false;
        
        // Visual state
        this.exploredNodes = new Set();
        this.currentNode = null;
        this.path = [];
        this.exploredOrder = [];
        
        // Colors
        this.colors = {
            node: '#64748b',
            nodeStroke: '#1e293b',
            edge: 'rgba(100, 116, 139, 0.4)',
            explored: '#f59e0b',
            current: '#06b6d4',
            path: '#ec4899',
            start: '#10b981',
            goal: '#ef4444',
            text: '#f1f5f9',
            heuristic: '#94a3b8'
        };
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.exploredNodes.clear();
        this.currentNode = null;
        this.path = [];
        this.exploredOrder = [];
        this.currentStep = 0;
        this.isAnimating = false;
    }

    /**
     * Draw the entire graph
     * @param {string} startNode - Starting node name
     * @param {string} goalNode - Goal node name
     */
    drawGraph(startNode, goalNode) {
        this.clear();
        
        // Draw edges first (behind nodes)
        this.drawEdges();
        
        // Draw nodes
        this.drawNodes(startNode, goalNode);
    }

    /**
     * Draw all edges
     */
    drawEdges() {
        const edges = this.graph.getAllEdges();
        const drawnEdges = new Set();

        edges.forEach(edge => {
            const key1 = `${edge.from.name}-${edge.to.name}`;
            const key2 = `${edge.to.name}-${edge.from.name}`;
            
            // Avoid drawing duplicate bidirectional edges
            if (drawnEdges.has(key2)) return;
            drawnEdges.add(key1);

            // Check if this edge is part of the path
            const isPathEdge = this.isEdgeInPath(edge.from.name, edge.to.name);

            if (isPathEdge) {
                // Draw path edge with highlight
                this.ctx.strokeStyle = '#ec4899';
                this.ctx.lineWidth = 6;
                this.ctx.shadowColor = 'rgba(236, 72, 153, 0.6)';
                this.ctx.shadowBlur = 15;
                this.ctx.beginPath();
                this.ctx.moveTo(edge.from.x, edge.from.y);
                this.ctx.lineTo(edge.to.x, edge.to.y);
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            } else {
                // Draw normal edge
                this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(edge.from.x, edge.from.y);
                this.ctx.lineTo(edge.to.x, edge.to.y);
                this.ctx.stroke();
            }

            // Draw edge cost in the middle
            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            
            this.ctx.fillStyle = isPathEdge ? 'rgba(236, 72, 153, 0.9)' : 'rgba(30, 41, 59, 0.9)';
            this.ctx.fillRect(midX - 14, midY - 12, 28, 24);
            
            this.ctx.fillStyle = isPathEdge ? '#ffffff' : '#cbd5e1';
            this.ctx.font = 'bold 13px -apple-system, system-ui, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.cost, midX, midY);
        });
    }

    /**
     * Check if an edge is part of the final path
     * @param {string} from - From node name
     * @param {string} to - To node name
     * @returns {boolean}
     */
    isEdgeInPath(from, to) {
        if (this.path.length < 2) return false;
        
        for (let i = 0; i < this.path.length - 1; i++) {
            if ((this.path[i] === from && this.path[i + 1] === to) ||
                (this.path[i] === to && this.path[i + 1] === from)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Draw all nodes
     * @param {string} startNode - Starting node name
     * @param {string} goalNode - Goal node name
     */
    drawNodes(startNode, goalNode) {
        const nodes = this.graph.getAllNodes();

        nodes.forEach(node => {
            // Determine node color based on state
            let fillColor = this.colors.node;
            let glowColor = 'rgba(100, 116, 139, 0)';
            
            if (node.name === startNode) {
                fillColor = this.colors.start;
                glowColor = 'rgba(16, 185, 129, 0.4)';
            } else if (node.name === goalNode) {
                fillColor = this.colors.goal;
                glowColor = 'rgba(239, 68, 68, 0.4)';
            } else if (this.path.includes(node.name)) {
                fillColor = this.colors.path;
                glowColor = 'rgba(236, 72, 153, 0.4)';
            } else if (node.name === this.currentNode) {
                fillColor = this.colors.current;
                glowColor = 'rgba(6, 182, 212, 0.4)';
            } else if (this.exploredNodes.has(node.name)) {
                fillColor = this.colors.explored;
                glowColor = 'rgba(245, 158, 11, 0.3)';
            }

            // Draw node glow
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = 20;

            // Draw node circle
            this.ctx.fillStyle = fillColor;
            this.ctx.strokeStyle = this.colors.nodeStroke;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 28, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();

            // Reset shadow
            this.ctx.shadowBlur = 0;

            // Draw node name
            this.ctx.fillStyle = '#0f172a';
            this.ctx.font = 'bold 15px -apple-system, system-ui, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.name, node.x, node.y);

            // Draw heuristic value below node
            this.ctx.fillStyle = this.colors.heuristic;
            this.ctx.font = '12px -apple-system, system-ui, sans-serif';
            this.ctx.fillText(`h=${node.h}`, node.x, node.y + 45);
        });
    }

    /**
     * Animate the search algorithm
     * @param {Object} result - Algorithm result object
     * @param {string} startNode - Starting node name
     * @param {string} goalNode - Goal node name
     * @param {Function} onComplete - Callback when animation completes
     */
    async animateSearch(result, startNode, goalNode, onComplete) {
        this.isAnimating = true;
        this.exploredOrder = result.exploredOrder;
        this.path = result.path;
        this.currentStep = 0;

        // Initial draw
        this.drawGraph(startNode, goalNode);

        // Animate exploration
        for (let i = 0; i < this.exploredOrder.length; i++) {
            if (!this.isAnimating) break;

            const nodeName = this.exploredOrder[i];
            this.currentNode = nodeName;
            this.exploredNodes.add(nodeName);
            
            this.drawGraph(startNode, goalNode);
            
            await this.sleep(this.animationSpeed);
        }

        // Clear current node highlight
        this.currentNode = null;
        
        // Final draw with path highlighted
        this.drawGraph(startNode, goalNode);

        this.isAnimating = false;
        if (onComplete) onComplete();
    }

    /**
     * Draw the final result without animation
     * @param {Object} result - Algorithm result object
     * @param {string} startNode - Starting node name
     * @param {string} goalNode - Goal node name
     */
    drawResult(result, startNode, goalNode) {
        this.exploredOrder = result.exploredOrder;
        this.path = result.path;
        
        // Mark all explored nodes
        result.exploredOrder.forEach(node => {
            this.exploredNodes.add(node);
        });

        this.drawGraph(startNode, goalNode);
    }

    /**
     * Stop current animation
     */
    stopAnimation() {
        this.isAnimating = false;
    }

    /**
     * Sleep utility for animation
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Set animation speed
     * @param {number} speed - Speed in milliseconds
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }

    /**
     * Resize canvas while maintaining aspect ratio
     */
    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Maintain aspect ratio
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphVisualizer;
}
