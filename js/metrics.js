/**
 * Metrics.js - Calculate and display performance metrics
 * Includes adapted Precision, Recall, F1-Score for pathfinding
 */

class MetricsCalculator {
    constructor() {
        this.results = {
            uninformed: null,
            informed: null
        };
    }

    /**
     * Calculate all metrics for a search result
     * @param {Object} result - Algorithm result object
     * @param {number} totalNodes - Total nodes in graph
     * @returns {Object} Metrics object
     */
    calculateMetrics(result, totalNodes) {
        if (!result || !result.found) {
            return {
                pathCost: 'N/A',
                nodesExplored: result ? result.nodesExplored : 0,
                timeTaken: result ? result.timeTaken.toFixed(2) + ' ms' : 'N/A',
                precision: 'N/A',
                recall: 'N/A',
                f1Score: 'N/A'
            };
        }

        const pathLength = result.path.length;
        const nodesExplored = result.nodesExplored;

        /**
         * Adapted Metrics for Pathfinding:
         * 
         * Precision: Measures efficiency - what percentage of explored nodes are in the final path
         * Formula: (Path Length) / (Nodes Explored)
         * Higher precision = more focused search
         * 
         * Recall: Measures completeness - what percentage of the path was found relative to exploration
         * Formula: (Path Length) / (Total Nodes)
         * Higher recall = better coverage
         * 
         * F1-Score: Harmonic mean of precision and recall
         * Formula: 2 * (Precision * Recall) / (Precision + Recall)
         * Balances efficiency and completeness
         */

        const precision = pathLength / nodesExplored;
        const recall = pathLength / totalNodes;
        const f1Score = 2 * (precision * recall) / (precision + recall);

        return {
            pathCost: result.pathCost,
            nodesExplored: nodesExplored,
            timeTaken: result.timeTaken.toFixed(2) + ' ms',
            precision: (precision * 100).toFixed(2) + '%',
            recall: (recall * 100).toFixed(2) + '%',
            f1Score: (f1Score * 100).toFixed(2) + '%',
            // Store raw values for comparison
            _rawPrecision: precision,
            _rawRecall: recall,
            _rawF1: f1Score,
            _rawTime: result.timeTaken,
            _rawCost: result.pathCost
        };
    }

    /**
     * Update metrics display in the UI
     * @param {Object} metrics - Metrics object
     * @param {string} type - 'uninformed' or 'informed'
     */
    displayMetrics(metrics, type) {
        const prefix = type;

        document.getElementById(`${prefix}-cost`).textContent = metrics.pathCost;
        document.getElementById(`${prefix}-explored`).textContent = metrics.nodesExplored;
        document.getElementById(`${prefix}-time`).textContent = metrics.timeTaken;
        document.getElementById(`${prefix}-precision`).textContent = metrics.precision;
        document.getElementById(`${prefix}-recall`).textContent = metrics.recall;
        document.getElementById(`${prefix}-f1`).textContent = metrics.f1Score;

        // Store for comparison
        this.results[type] = metrics;
    }

    /**
     * Determine and display the winner
     */
    declareWinner() {
        const uninformed = this.results.uninformed;
        const informed = this.results.informed;

        if (!uninformed || !informed) {
            return;
        }

        const winnerCard = document.getElementById('winner-announcement');
        winnerCard.innerHTML = '';

        // Calculate scores for each algorithm
        const uninformedScore = this.calculateOverallScore(uninformed);
        const informedScore = this.calculateOverallScore(informed);

        let winner = '';
        let winnerName = '';
        let reason = '';

        if (uninformedScore > informedScore) {
            winner = 'uninformed';
            winnerName = document.getElementById('uninformed-title').textContent;
        } else if (informedScore > uninformedScore) {
            winner = 'informed';
            winnerName = document.getElementById('informed-title').textContent;
        } else {
            winner = 'tie';
            winnerName = 'It\'s a Tie!';
        }

        // Generate detailed comparison
        const comparison = this.generateComparison(uninformed, informed);

        winnerCard.innerHTML = `
            <h3>${winner === 'tie' ? '🤝 ' + winnerName : '🏆 Winner: ' + winnerName}</h3>
            <div class="winner-details">
                ${comparison}
            </div>
        `;
        winnerCard.classList.add('show');
    }

    /**
     * Calculate overall score for an algorithm
     * Lower is better (considers cost, nodes explored, and time)
     * @param {Object} metrics - Metrics object
     * @returns {number} Overall score
     */
    calculateOverallScore(metrics) {
        if (metrics.pathCost === 'N/A') return Infinity;

        // Normalize and weight different factors
        // Lower cost = better, fewer nodes explored = better, less time = better
        // Higher F1 score = better
        
        const costWeight = 0.4;
        const exploredWeight = 0.3;
        const timeWeight = 0.1;
        const f1Weight = 0.2;

        // Invert F1 since higher is better
        const score = 
            (metrics._rawCost * costWeight) +
            (metrics.nodesExplored * exploredWeight) +
            (metrics._rawTime * timeWeight) -
            (metrics._rawF1 * 100 * f1Weight);

        return score;
    }

    /**
     * Generate detailed comparison text
     * @param {Object} uninformed - Uninformed metrics
     * @param {Object} informed - Informed metrics
     * @returns {string} HTML string
     */
    generateComparison(uninformed, informed) {
        const comparisons = [];

        // Path Cost
        if (uninformed._rawCost !== informed._rawCost) {
            const better = uninformed._rawCost < informed._rawCost ? 'Uninformed' : 'Informed';
            const diff = Math.abs(uninformed._rawCost - informed._rawCost);
            comparisons.push(`<p>✓ ${better} found a shorter path (cost difference: ${diff.toFixed(1)})</p>`);
        } else {
            comparisons.push(`<p>✓ Both algorithms found paths with equal cost</p>`);
        }

        // Nodes Explored
        if (uninformed.nodesExplored !== informed.nodesExplored) {
            const better = uninformed.nodesExplored < informed.nodesExplored ? 'Uninformed' : 'Informed';
            const diff = Math.abs(uninformed.nodesExplored - informed.nodesExplored);
            comparisons.push(`<p>✓ ${better} explored ${diff} fewer nodes</p>`);
        }

        // F1 Score
        if (uninformed._rawF1 !== informed._rawF1) {
            const better = uninformed._rawF1 > informed._rawF1 ? 'Uninformed' : 'Informed';
            comparisons.push(`<p>✓ ${better} had better efficiency (higher F1-Score)</p>`);
        }

        // Time
        if (uninformed._rawTime !== informed._rawTime) {
            const better = uninformed._rawTime < informed._rawTime ? 'Uninformed' : 'Informed';
            const diff = Math.abs(uninformed._rawTime - informed._rawTime).toFixed(2);
            comparisons.push(`<p>✓ ${better} was faster by ${diff} ms</p>`);
        }

        return comparisons.join('');
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.results = {
            uninformed: null,
            informed: null
        };

        const types = ['uninformed', 'informed'];
        types.forEach(type => {
            document.getElementById(`${type}-cost`).textContent = '-';
            document.getElementById(`${type}-explored`).textContent = '-';
            document.getElementById(`${type}-time`).textContent = '-';
            document.getElementById(`${type}-precision`).textContent = '-';
            document.getElementById(`${type}-recall`).textContent = '-';
            document.getElementById(`${type}-f1`).textContent = '-';
        });

        const winnerCard = document.getElementById('winner-announcement');
        winnerCard.classList.remove('show');
        winnerCard.innerHTML = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsCalculator;
}
