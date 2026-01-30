/**
 * Main.js - Application entry point
 * Initializes and coordinates all components
 */

class PathFinderApp {
    constructor() {
        // Initialize core components
        this.graph = new Graph();
        this.algorithms = new SearchAlgorithms(this.graph);
        this.uninformedVisualizer = new GraphVisualizer('uninformed-canvas', this.graph);
        this.informedVisualizer = new GraphVisualizer('informed-canvas', this.graph);
        this.metricsCalculator = new MetricsCalculator();

        // Animation settings
        this.animationSpeed = 300; // ms per step

        // Initialize UI
        this.initializeUI();
        this.bindEvents();
        this.updateNodeSelectors();
        this.drawInitialGraphs();
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Set default selections
        document.getElementById('uninformed-select').value = 'bfs';
        document.getElementById('informed-select').value = 'astar';
        
        // Update algorithm titles
        this.updateAlgorithmTitles();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Sidebar controls
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const menuToggle = document.getElementById('menu-toggle');
        const closeSidebar = document.getElementById('close-sidebar');
        const mainContent = document.querySelector('.main-content');

        // Toggle sidebar on mobile
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close sidebar
        const closeSidebarFunc = () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeSidebar.addEventListener('click', closeSidebarFunc);
        sidebarOverlay.addEventListener('click', closeSidebarFunc);

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && 
                    !menuToggle.contains(e.target) && 
                    sidebar.classList.contains('active')) {
                    closeSidebarFunc();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active', 'closed');
                sidebarOverlay.classList.remove('active');
                mainContent.classList.remove('sidebar-closed');
                document.body.style.overflow = '';
            }
        });

        // Control buttons
        document.getElementById('run-btn').addEventListener('click', () => this.runComparison());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());

        // Graph editor
        document.getElementById('add-node-btn').addEventListener('click', () => this.addNode());
        document.getElementById('add-edge-btn').addEventListener('click', () => this.addEdge());

        // Algorithm selection change
        document.getElementById('uninformed-select').addEventListener('change', () => {
            this.updateAlgorithmTitles();
        });
        document.getElementById('informed-select').addEventListener('change', () => {
            this.updateAlgorithmTitles();
        });

        // Goal/Start node selection change
        document.getElementById('goal-select').addEventListener('change', () => {
            this.drawInitialGraphs();
        });
        document.getElementById('start-select').addEventListener('change', () => {
            this.drawInitialGraphs();
        });

        // Initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Update algorithm title displays
     */
    updateAlgorithmTitles() {
        const uninformedSelect = document.getElementById('uninformed-select');
        const informedSelect = document.getElementById('informed-select');

        const uninformedName = uninformedSelect.options[uninformedSelect.selectedIndex].text;
        const informedName = informedSelect.options[informedSelect.selectedIndex].text;

        document.getElementById('uninformed-title').textContent = uninformedName;
        document.getElementById('informed-title').textContent = informedName;
    }

    /**
     * Update node selector dropdowns
     */
    updateNodeSelectors() {
        const nodes = this.graph.getAllNodes();
        const selectors = ['goal-select', 'start-select', 'edge-from', 'edge-to'];

        selectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            const currentValue = selector.value;
            
            selector.innerHTML = '';
            
            if (selectorId === 'edge-from' || selectorId === 'edge-to') {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = selectorId === 'edge-from' ? 'From Node' : 'To Node';
                selector.appendChild(defaultOption);
            }

            nodes.forEach(node => {
                const option = document.createElement('option');
                option.value = node.name;
                option.textContent = node.name;
                selector.appendChild(option);
            });

            // Restore previous selection if still valid
            if (currentValue && nodes.find(n => n.name === currentValue)) {
                selector.value = currentValue;
            } else if (selectorId === 'start-select') {
                selector.value = 'A'; // Default start
            } else if (selectorId === 'goal-select') {
                selector.value = 'Goal'; // Default goal
            }
        });
    }

    /**
     * Draw initial graphs on both canvases
     */
    drawInitialGraphs() {
        const startNode = document.getElementById('start-select').value;
        const goalNode = document.getElementById('goal-select').value;

        this.uninformedVisualizer.drawGraph(startNode, goalNode);
        this.informedVisualizer.drawGraph(startNode, goalNode);
    }

    /**
     * Run algorithm comparison
     */
    async runComparison() {
        const startNode = document.getElementById('start-select').value;
        const goalNode = document.getElementById('goal-select').value;
        const uninformedAlgo = document.getElementById('uninformed-select').value;
        const informedAlgo = document.getElementById('informed-select').value;

        // Validate selections
        if (!startNode || !goalNode) {
            this.updateStatus('both', 'Please select start and goal nodes');
            return;
        }

        if (startNode === goalNode) {
            this.updateStatus('both', 'Start and goal nodes must be different');
            return;
        }

        // Disable controls during execution
        this.setControlsEnabled(false);
        this.metricsCalculator.clear();

        // Update status
        this.updateStatus('uninformed', 'Running...');
        this.updateStatus('informed', 'Running...');

        try {
            // Run uninformed algorithm
            const uninformedResult = this.runAlgorithm(uninformedAlgo, startNode, goalNode);
            
            // Run informed algorithm
            const informedResult = this.runAlgorithm(informedAlgo, startNode, goalNode);

            // Animate both simultaneously
            const uninformedPromise = this.uninformedVisualizer.animateSearch(
                uninformedResult,
                startNode,
                goalNode,
                () => {
                    this.updateStatus('uninformed', 
                        uninformedResult.found ? `Found! Cost: ${uninformedResult.pathCost}` : 'No path found'
                    );
                }
            );

            const informedPromise = this.informedVisualizer.animateSearch(
                informedResult,
                startNode,
                goalNode,
                () => {
                    this.updateStatus('informed', 
                        informedResult.found ? `Found! Cost: ${informedResult.pathCost}` : 'No path found'
                    );
                }
            );

            // Wait for both animations to complete
            await Promise.all([uninformedPromise, informedPromise]);

            // Calculate and display metrics
            const totalNodes = this.graph.getAllNodes().length;
            const uninformedMetrics = this.metricsCalculator.calculateMetrics(uninformedResult, totalNodes);
            const informedMetrics = this.metricsCalculator.calculateMetrics(informedResult, totalNodes);

            this.metricsCalculator.displayMetrics(uninformedMetrics, 'uninformed');
            this.metricsCalculator.displayMetrics(informedMetrics, 'informed');

            // Declare winner
            this.metricsCalculator.declareWinner();

        } catch (error) {
            console.error('Error during algorithm execution:', error);
            this.updateStatus('both', 'Error: ' + error.message);
        } finally {
            // Re-enable controls
            this.setControlsEnabled(true);
        }
    }

    /**
     * Run a specific algorithm
     * @param {string} algoType - Algorithm type
     * @param {string} start - Start node
     * @param {string} goal - Goal node
     * @returns {Object} Algorithm result
     */
    runAlgorithm(algoType, start, goal) {
        switch (algoType) {
            case 'bfs':
                return this.algorithms.bfs(start, goal);
            case 'dfs':
                return this.algorithms.dfs(start, goal);
            case 'ucs':
                return this.algorithms.ucs(start, goal);
            case 'astar':
                return this.algorithms.astar(start, goal);
            case 'greedy':
                return this.algorithms.greedy(start, goal);
            default:
                throw new Error('Unknown algorithm type: ' + algoType);
        }
    }

    /**
     * Update status text
     * @param {string} target - 'uninformed', 'informed', or 'both'
     * @param {string} message - Status message
     */
    updateStatus(target, message) {
        const statusMap = {
            'Running...': 'running',
            'Ready': 'ready',
            'Found!': 'success',
            'No path found': 'error'
        };

        const updateElement = (id) => {
            const element = document.getElementById(id);
            const span = element.querySelector('span');
            span.textContent = message;
            
            // Remove all status classes
            element.classList.remove('running', 'success', 'error');
            
            // Add appropriate status class
            for (const [key, className] of Object.entries(statusMap)) {
                if (message.includes(key)) {
                    element.classList.add(className);
                    break;
                }
            }

            // Update icon if feather is available
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        };

        if (target === 'both' || target === 'uninformed') {
            updateElement('uninformed-status');
        }
        if (target === 'both' || target === 'informed') {
            updateElement('informed-status');
        }
    }

    /**
     * Enable/disable control buttons
     * @param {boolean} enabled - Enable or disable
     */
    setControlsEnabled(enabled) {
        document.getElementById('run-btn').disabled = !enabled;
        document.getElementById('reset-btn').disabled = !enabled;
        document.getElementById('clear-btn').disabled = !enabled;
        document.getElementById('add-node-btn').disabled = !enabled;
        document.getElementById('add-edge-btn').disabled = !enabled;
    }

    /**
     * Reset visualization while keeping the graph
     */
    reset() {
        this.uninformedVisualizer.stopAnimation();
        this.informedVisualizer.stopAnimation();
        this.drawInitialGraphs();
        this.metricsCalculator.clear();
        this.updateStatus('both', 'Ready');
    }

    /**
     * Clear entire graph
     */
    clearAll() {
        if (confirm('This will remove all nodes and edges. Continue?')) {
            this.graph.clear();
            this.graph.initializeDefaultGraph();
            this.updateNodeSelectors();
            this.reset();
        }
    }

    /**
     * Add a new node to the graph
     */
    addNode() {
        const name = document.getElementById('node-name').value.trim();
        const x = parseInt(document.getElementById('node-x').value);
        const y = parseInt(document.getElementById('node-y').value);
        const h = parseFloat(document.getElementById('node-heuristic').value) || 0;

        // Validation
        if (!name) {
            alert('Please enter a node name');
            return;
        }

        if (isNaN(x) || isNaN(y)) {
            alert('Please enter valid coordinates');
            return;
        }

        if (x < 0 || x > 500 || y < 0 || y > 400) {
            alert('Coordinates must be within canvas bounds (0-500, 0-400)');
            return;
        }

        // Add node
        this.graph.addNode(name, x, y, h);
        this.updateNodeSelectors();
        this.drawInitialGraphs();

        // Clear inputs
        document.getElementById('node-name').value = '';
        document.getElementById('node-x').value = '';
        document.getElementById('node-y').value = '';
        document.getElementById('node-heuristic').value = '';

        this.updateStatus('both', `Node ${name} added successfully`);
    }

    /**
     * Add a new edge to the graph
     */
    addEdge() {
        const from = document.getElementById('edge-from').value;
        const to = document.getElementById('edge-to').value;
        const cost = parseInt(document.getElementById('edge-cost').value);
        const bidirectional = document.getElementById('edge-bidirectional').checked;

        // Validation
        if (!from || !to) {
            alert('Please select both nodes');
            return;
        }

        if (from === to) {
            alert('Cannot create self-loop');
            return;
        }

        if (isNaN(cost) || cost < 1) {
            alert('Please enter a valid cost (>= 1)');
            return;
        }

        // Add edge
        const success = this.graph.addEdge(from, to, cost, bidirectional);
        
        if (success) {
            this.drawInitialGraphs();
            this.updateStatus('both', `Edge ${from} → ${to} added successfully`);
        } else {
            this.updateStatus('both', 'Error adding edge');
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PathFinderApp();
});
