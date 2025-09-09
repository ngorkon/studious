// Schedule Optimizer - Advanced mathematical optimization for study schedules
class ScheduleOptimizer {
    constructor() {
        this.optimizationStrategies = [
            'genetic_algorithm',
            'simulated_annealing',
            'constraint_satisfaction',
            'machine_learning'
        ];
        
        this.currentStrategy = 'genetic_algorithm';
        this.optimizationHistory = [];
        this.constraints = new ConstraintManager();
        this.objectives = new ObjectiveFunction();
    }

    async optimize(schedule, context) {
        console.log('🔧 Optimizing schedule with advanced algorithms...');
        
        // Select best optimization strategy based on context
        const strategy = this.selectOptimizationStrategy(context);
        
        let optimizedSchedule;
        
        switch (strategy) {
            case 'genetic_algorithm':
                optimizedSchedule = await this.geneticAlgorithmOptimization(schedule, context);
                break;
            case 'simulated_annealing':
                optimizedSchedule = await this.simulatedAnnealingOptimization(schedule, context);
                break;
            case 'constraint_satisfaction':
                optimizedSchedule = await this.constraintSatisfactionOptimization(schedule, context);
                break;
            case 'machine_learning':
                optimizedSchedule = await this.machineLearningOptimization(schedule, context);
                break;
            default:
                optimizedSchedule = await this.hybridOptimization(schedule, context);
        }
        
        // Validate and refine the optimized schedule
        const validatedSchedule = await this.validateAndRefine(optimizedSchedule, context);
        
        // Record optimization results for learning
        this.recordOptimizationResult(schedule, validatedSchedule, context, strategy);
        
        return validatedSchedule;
    }

    selectOptimizationStrategy(context) {
        const factors = {
            complexity: this.calculateScheduleComplexity(context),
            dataAvailability: this.assessDataAvailability(context),
            timeConstraints: this.assessTimeConstraints(context),
            userExperience: this.assessUserExperience(context)
        };
        
        // Use machine learning if we have sufficient historical data
        if (factors.dataAvailability > 0.8 && factors.userExperience > 0.7) {
            return 'machine_learning';
        }
        
        // Use genetic algorithm for complex schedules
        if (factors.complexity > 0.7) {
            return 'genetic_algorithm';
        }
        
        // Use constraint satisfaction for tight constraints
        if (factors.timeConstraints > 0.8) {
            return 'constraint_satisfaction';
        }
        
        // Default to simulated annealing
        return 'simulated_annealing';
    }

    async geneticAlgorithmOptimization(schedule, context) {
        console.log('🧬 Applying genetic algorithm optimization...');
        
        const populationSize = 50;
        const generations = 100;
        const mutationRate = 0.1;
        const crossoverRate = 0.8;
        
        // Initialize population
        let population = this.initializePopulation(schedule, populationSize, context);
        
        for (let generation = 0; generation < generations; generation++) {
            // Evaluate fitness
            const fitness = population.map(individual => this.evaluateFitness(individual, context));
            
            // Selection
            const parents = this.tournamentSelection(population, fitness, populationSize);
            
            // Crossover and mutation
            const offspring = [];
            for (let i = 0; i < populationSize; i += 2) {
                let [child1, child2] = this.crossover(parents[i], parents[i + 1], crossoverRate);
                child1 = this.mutate(child1, mutationRate, context);
                child2 = this.mutate(child2, mutationRate, context);
                offspring.push(child1, child2);
            }
            
            population = offspring.slice(0, populationSize);
            
            // Early termination if converged
            if (this.hasConverged(fitness)) {
                console.log(`🎯 GA converged at generation ${generation}`);
                break;
            }
        }
        
        // Return best individual
        const finalFitness = population.map(individual => this.evaluateFitness(individual, context));
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
        
        return population[bestIndex];
    }

    async simulatedAnnealingOptimization(schedule, context) {
        console.log('🌡️ Applying simulated annealing optimization...');
        
        let currentSchedule = { ...schedule };
        let currentEnergy = this.evaluateScheduleEnergy(currentSchedule, context);
        let bestSchedule = { ...currentSchedule };
        let bestEnergy = currentEnergy;
        
        const initialTemperature = 1000;
        const coolingRate = 0.95;
        const minTemperature = 1;
        
        let temperature = initialTemperature;
        
        while (temperature > minTemperature) {
            // Generate neighbor solution
            const neighborSchedule = this.generateNeighbor(currentSchedule, context);
            const neighborEnergy = this.evaluateScheduleEnergy(neighborSchedule, context);
            
            // Accept or reject the neighbor
            if (this.shouldAccept(currentEnergy, neighborEnergy, temperature)) {
                currentSchedule = neighborSchedule;
                currentEnergy = neighborEnergy;
                
                // Update best solution
                if (neighborEnergy < bestEnergy) {
                    bestSchedule = { ...neighborSchedule };
                    bestEnergy = neighborEnergy;
                }
            }
            
            // Cool down
            temperature *= coolingRate;
        }
        
        console.log(`🎯 SA optimization complete. Best energy: ${bestEnergy}`);
        return bestSchedule;
    }

    async constraintSatisfactionOptimization(schedule, context) {
        console.log('⚖️ Applying constraint satisfaction optimization...');
        
        // Define variables and domains
        const variables = this.extractScheduleVariables(schedule);
        const domains = this.defineDomains(variables, context);
        const constraints = this.defineConstraints(context);
        
        // Apply constraint propagation
        const propagatedDomains = this.constraintPropagation(variables, domains, constraints);
        
        // Search for solution using backtracking with heuristics
        const solution = this.backtrackSearch(variables, propagatedDomains, constraints, context);
        
        if (solution) {
            return this.constructScheduleFromSolution(solution, schedule);
        } else {
            console.warn('No solution found with current constraints, relaxing...');
            return this.relaxConstraintsAndRetry(schedule, context);
        }
    }

    async machineLearningOptimization(schedule, context) {
        console.log('🤖 Applying machine learning optimization...');
        
        // Get historical performance data
        const historicalData = await this.getHistoricalPerformanceData(context);
        
        if (historicalData.length < 50) {
            console.log('Insufficient data for ML, falling back to genetic algorithm');
            return this.geneticAlgorithmOptimization(schedule, context);
        }
        
        // Train predictive models
        const performancePredictor = await this.trainPerformancePredictor(historicalData);
        const retentionPredictor = await this.trainRetentionPredictor(historicalData);
        const energyPredictor = await this.trainEnergyPredictor(historicalData);
        
        // Generate candidate schedules
        const candidates = this.generateCandidateSchedules(schedule, context, 100);
        
        // Evaluate candidates using ML models
        const evaluatedCandidates = candidates.map(candidate => ({
            schedule: candidate,
            predictedPerformance: performancePredictor.predict(candidate),
            predictedRetention: retentionPredictor.predict(candidate),
            predictedEnergy: energyPredictor.predict(candidate),
            overallScore: this.calculateMLScore(candidate, performancePredictor, retentionPredictor, energyPredictor)
        }));
        
        // Select best candidate
        const bestCandidate = evaluatedCandidates.reduce((best, current) => 
            current.overallScore > best.overallScore ? current : best
        );
        
        console.log(`🎯 ML optimization complete. Score: ${bestCandidate.overallScore}`);
        return bestCandidate.schedule;
    }

    async hybridOptimization(schedule, context) {
        console.log('🔀 Applying hybrid optimization approach...');
        
        // Stage 1: Constraint satisfaction for feasibility
        const feasibleSchedule = await this.constraintSatisfactionOptimization(schedule, context);
        
        // Stage 2: Genetic algorithm for optimization
        const optimizedSchedule = await this.geneticAlgorithmOptimization(feasibleSchedule, context);
        
        // Stage 3: Local search with simulated annealing
        const finalSchedule = await this.simulatedAnnealingOptimization(optimizedSchedule, context);
        
        return finalSchedule;
    }

    // Genetic Algorithm Helper Methods
    initializePopulation(baseSchedule, size, context) {
        const population = [];
        
        for (let i = 0; i < size; i++) {
            const individual = this.createRandomVariation(baseSchedule, context);
            population.push(individual);
        }
        
        return population;
    }

    createRandomVariation(schedule, context) {
        const variation = JSON.parse(JSON.stringify(schedule)); // Deep copy
        
        // Randomly modify some sessions
        for (const day of variation.schedule) {
            for (const session of day.sessions) {
                if (Math.random() < 0.3) { // 30% chance to modify
                    // Randomly adjust timing, duration, or technique
                    if (Math.random() < 0.4) {
                        session.time = this.adjustTime(session.time, context);
                    }
                    if (Math.random() < 0.3) {
                        session.duration = this.adjustDuration(session.duration, context);
                    }
                    if (Math.random() < 0.3) {
                        session.technique = this.selectRandomTechnique(context);
                    }
                }
            }
        }
        
        return variation;
    }

    evaluateFitness(individual, context) {
        const objectives = {
            energyAlignment: this.calculateEnergyAlignment(individual, context),
            learningEfficiency: this.calculateLearningEfficiency(individual, context),
            constraintViolations: this.calculateConstraintViolations(individual, context),
            difficultyDistribution: this.calculateDifficultyDistribution(individual, context),
            retentionOptimization: this.calculateRetentionOptimization(individual, context)
        };
        
        // Weighted combination of objectives
        const weights = {
            energyAlignment: 0.25,
            learningEfficiency: 0.25,
            constraintViolations: -0.2, // Penalty
            difficultyDistribution: 0.15,
            retentionOptimization: 0.15
        };
        
        return Object.entries(objectives).reduce((fitness, [key, value]) => 
            fitness + (weights[key] * value), 0
        );
    }

    tournamentSelection(population, fitness, tournamentSize = 3) {
        const selected = [];
        
        for (let i = 0; i < population.length; i++) {
            const tournament = [];
            
            // Select random individuals for tournament
            for (let j = 0; j < tournamentSize; j++) {
                const index = Math.floor(Math.random() * population.length);
                tournament.push({ individual: population[index], fitness: fitness[index] });
            }
            
            // Select best from tournament
            const winner = tournament.reduce((best, current) => 
                current.fitness > best.fitness ? current : best
            );
            
            selected.push(winner.individual);
        }
        
        return selected;
    }

    crossover(parent1, parent2, crossoverRate) {
        if (Math.random() > crossoverRate) {
            return [parent1, parent2]; // No crossover
        }
        
        const child1 = JSON.parse(JSON.stringify(parent1));
        const child2 = JSON.parse(JSON.stringify(parent2));
        
        // Day-wise crossover
        for (let dayIndex = 0; dayIndex < child1.schedule.length; dayIndex++) {
            if (Math.random() < 0.5) {
                // Swap entire days
                [child1.schedule[dayIndex], child2.schedule[dayIndex]] = 
                [child2.schedule[dayIndex], child1.schedule[dayIndex]];
            } else {
                // Session-wise crossover within the day
                const day1 = child1.schedule[dayIndex];
                const day2 = child2.schedule[dayIndex];
                
                for (let sessionIndex = 0; sessionIndex < Math.min(day1.sessions.length, day2.sessions.length); sessionIndex++) {
                    if (Math.random() < 0.5) {
                        [day1.sessions[sessionIndex], day2.sessions[sessionIndex]] = 
                        [day2.sessions[sessionIndex], day1.sessions[sessionIndex]];
                    }
                }
            }
        }
        
        return [child1, child2];
    }

    mutate(individual, mutationRate, context) {
        const mutated = JSON.parse(JSON.stringify(individual));
        
        for (const day of mutated.schedule) {
            for (const session of day.sessions) {
                if (Math.random() < mutationRate) {
                    // Apply random mutation
                    const mutationType = Math.random();
                    
                    if (mutationType < 0.3) {
                        session.time = this.adjustTime(session.time, context);
                    } else if (mutationType < 0.6) {
                        session.duration = this.adjustDuration(session.duration, context);
                    } else if (mutationType < 0.8) {
                        session.technique = this.selectRandomTechnique(context);
                    } else {
                        session.type = this.selectRandomType(context);
                    }
                }
            }
        }
        
        return mutated;
    }

    // Simulated Annealing Helper Methods
    generateNeighbor(schedule, context) {
        const neighbor = JSON.parse(JSON.stringify(schedule));
        
        // Select random modification type
        const modifications = [
            'swap_sessions',
            'adjust_timing',
            'change_duration',
            'change_technique',
            'reorder_subjects'
        ];
        
        const modification = modifications[Math.floor(Math.random() * modifications.length)];
        
        switch (modification) {
            case 'swap_sessions':
                this.swapRandomSessions(neighbor);
                break;
            case 'adjust_timing':
                this.adjustRandomTiming(neighbor, context);
                break;
            case 'change_duration':
                this.changeRandomDuration(neighbor, context);
                break;
            case 'change_technique':
                this.changeRandomTechnique(neighbor, context);
                break;
            case 'reorder_subjects':
                this.reorderSubjects(neighbor);
                break;
        }
        
        return neighbor;
    }

    shouldAccept(currentEnergy, neighborEnergy, temperature) {
        if (neighborEnergy < currentEnergy) {
            return true; // Always accept better solution
        }
        
        // Accept worse solution with probability based on temperature
        const probability = Math.exp(-(neighborEnergy - currentEnergy) / temperature);
        return Math.random() < probability;
    }

    // Evaluation Methods
    calculateEnergyAlignment(schedule, context) {
        let alignment = 0;
        let totalSessions = 0;
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                const hour = parseInt(session.time.split(':')[0]);
                const userEnergyLevel = this.getUserEnergyLevel(hour, context);
                const sessionDifficulty = this.getSessionDifficulty(session);
                
                // High energy should align with high difficulty
                const idealAlignment = Math.abs(userEnergyLevel - sessionDifficulty);
                alignment += 1 - idealAlignment; // Invert for maximization
                totalSessions++;
            }
        }
        
        return totalSessions > 0 ? alignment / totalSessions : 0;
    }

    calculateLearningEfficiency(schedule, context) {
        let efficiency = 0;
        
        // Analyze spacing between related subjects
        const subjectLastSeen = {};
        
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                const subject = session.subject;
                const currentTime = this.parseTime(session.time);
                
                if (subjectLastSeen[subject]) {
                    const timeSinceLastSession = currentTime - subjectLastSeen[subject];
                    const optimalSpacing = this.calculateOptimalSpacing(session, context);
                    
                    // Efficiency based on how close we are to optimal spacing
                    const spacingEfficiency = 1 - Math.abs(timeSinceLastSession - optimalSpacing) / optimalSpacing;
                    efficiency += Math.max(0, spacingEfficiency);
                }
                
                subjectLastSeen[subject] = currentTime;
            }
        }
        
        return efficiency;
    }

    calculateConstraintViolations(schedule, context) {
        let violations = 0;
        
        // Check time constraints
        for (const day of schedule.schedule) {
            let dailyHours = 0;
            for (const session of day.sessions) {
                dailyHours += session.duration / 60;
            }
            
            const maxDailyHours = context.timeConstraints?.dailyHours || 8;
            if (dailyHours > maxDailyHours) {
                violations += (dailyHours - maxDailyHours) / maxDailyHours;
            }
        }
        
        // Check subject requirements
        const subjectHours = {};
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                subjectHours[session.subject] = (subjectHours[session.subject] || 0) + session.duration / 60;
            }
        }
        
        for (const subject of context.subjects || []) {
            const required = subject.weeklyHours || 2;
            const actual = subjectHours[subject.name] || 0;
            if (actual < required) {
                violations += (required - actual) / required;
            }
        }
        
        return violations;
    }

    // Utility Methods
    adjustTime(timeString, context) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        
        // Adjust by ±30 minutes randomly
        const adjustment = (Math.random() - 0.5) * 60;
        const newTotalMinutes = Math.max(360, Math.min(1440, totalMinutes + adjustment)); // Between 6:00 and 24:00
        
        const newHours = Math.floor(newTotalMinutes / 60);
        const newMinutes = newTotalMinutes % 60;
        
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }

    adjustDuration(duration, context) {
        const adjustment = (Math.random() - 0.5) * 30; // ±15 minutes
        return Math.max(15, Math.min(180, duration + adjustment)); // Between 15 and 180 minutes
    }

    selectRandomTechnique(context) {
        const techniques = [
            'Pomodoro',
            'Spaced Repetition',
            'Active Recall',
            'Feynman Technique',
            'Mind Mapping',
            'Cornell Notes',
            'SQ3R Method'
        ];
        
        return techniques[Math.floor(Math.random() * techniques.length)];
    }

    selectRandomType(context) {
        const types = ['Deep Focus', 'Review', 'Practice', 'Light Study'];
        return types[Math.floor(Math.random() * types.length)];
    }

    getUserEnergyLevel(hour, context) {
        const energyPredictions = context.energyLevels || {};
        return energyPredictions[hour]?.energy || 0.7;
    }

    getSessionDifficulty(session) {
        const difficultyMap = {
            'Easy': 0.3,
            'Medium': 0.6,
            'Hard': 0.8,
            'Very Hard': 1.0
        };
        
        return difficultyMap[session.difficulty] || 0.6;
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    calculateOptimalSpacing(session, context) {
        // Based on spaced repetition research
        const difficultyFactor = this.getSessionDifficulty(session);
        const basSpacing = 1440; // 24 hours in minutes
        
        return baseSpacing * (1 + difficultyFactor);
    }

    async validateAndRefine(schedule, context) {
        // Ensure schedule meets all hard constraints
        const refined = JSON.parse(JSON.stringify(schedule));
        
        // Fix any time conflicts
        this.resolveTimeConflicts(refined);
        
        // Ensure minimum/maximum session durations
        this.enforceSessionDurationLimits(refined);
        
        // Balance workload across days
        this.balanceWorkload(refined, context);
        
        return refined;
    }

    resolveTimeConflicts(schedule) {
        for (const day of schedule.schedule) {
            // Sort sessions by time
            day.sessions.sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time));
            
            // Adjust overlapping sessions
            for (let i = 1; i < day.sessions.length; i++) {
                const prevSession = day.sessions[i - 1];
                const currentSession = day.sessions[i];
                
                const prevEnd = this.parseTime(prevSession.time) + prevSession.duration;
                const currentStart = this.parseTime(currentSession.time);
                
                if (currentStart < prevEnd) {
                    // Conflict detected, adjust current session time
                    const newStartMinutes = prevEnd + 15; // 15-minute buffer
                    const newHours = Math.floor(newStartMinutes / 60);
                    const newMinutes = newStartMinutes % 60;
                    
                    currentSession.time = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
                }
            }
        }
    }

    enforceSessionDurationLimits(schedule) {
        for (const day of schedule.schedule) {
            for (const session of day.sessions) {
                session.duration = Math.max(15, Math.min(180, session.duration));
            }
        }
    }

    balanceWorkload(schedule, context) {
        const maxDailyHours = context.timeConstraints?.dailyHours || 6;
        
        for (const day of schedule.schedule) {
            let dailyHours = day.sessions.reduce((sum, session) => sum + session.duration / 60, 0);
            
            if (dailyHours > maxDailyHours) {
                // Reduce session durations proportionally
                const reductionFactor = maxDailyHours / dailyHours;
                for (const session of day.sessions) {
                    session.duration = Math.max(15, session.duration * reductionFactor);
                }
            }
        }
    }

    recordOptimizationResult(originalSchedule, optimizedSchedule, context, strategy) {
        const result = {
            timestamp: new Date().toISOString(),
            strategy: strategy,
            originalFitness: this.evaluateFitness(originalSchedule, context),
            optimizedFitness: this.evaluateFitness(optimizedSchedule, context),
            improvementRatio: null,
            context: {
                subjectCount: context.subjects?.length || 0,
                constraintComplexity: this.calculateConstraintComplexity(context),
                userExperience: this.assessUserExperience(context)
            }
        };
        
        result.improvementRatio = result.optimizedFitness / result.originalFitness;
        
        this.optimizationHistory.push(result);
        
        // Keep only last 100 optimization results
        if (this.optimizationHistory.length > 100) {
            this.optimizationHistory = this.optimizationHistory.slice(-100);
        }
        
        // Save to localStorage
        localStorage.setItem('scheduleOptimizationHistory', JSON.stringify(this.optimizationHistory));
        
        console.log(`📊 Optimization complete. Improvement: ${(result.improvementRatio - 1) * 100}%`);
    }

    calculateScheduleComplexity(context) {
        const subjectCount = context.subjects?.length || 1;
        const constraintCount = Object.keys(context.timeConstraints || {}).length;
        const goalCount = Object.keys(context.studyGoals || {}).length;
        
        return Math.min(1, (subjectCount + constraintCount + goalCount) / 20);
    }

    assessDataAvailability(context) {
        const historicalSessions = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
        return Math.min(1, historicalSessions.length / 100);
    }

    assessTimeConstraints(context) {
        const constraints = context.timeConstraints || {};
        const constraintCount = Object.keys(constraints).length;
        return Math.min(1, constraintCount / 10);
    }

    assessUserExperience(context) {
        const optimizationHistory = JSON.parse(localStorage.getItem('scheduleOptimizationHistory') || '[]');
        return Math.min(1, optimizationHistory.length / 20);
    }

    calculateConstraintComplexity(context) {
        return this.assessTimeConstraints(context) + this.calculateScheduleComplexity(context);
    }
}

// Constraint Manager for handling complex constraints
class ConstraintManager {
    constructor() {
        this.hardConstraints = [];
        this.softConstraints = [];
    }

    addHardConstraint(constraint) {
        this.hardConstraints.push(constraint);
    }

    addSoftConstraint(constraint, weight = 1.0) {
        this.softConstraints.push({ constraint, weight });
    }

    validateSchedule(schedule) {
        // Check all hard constraints
        for (const constraint of this.hardConstraints) {
            if (!constraint.validate(schedule)) {
                return false;
            }
        }
        return true;
    }

    calculateSoftConstraintViolations(schedule) {
        let totalViolation = 0;
        
        for (const { constraint, weight } of this.softConstraints) {
            const violation = constraint.calculateViolation(schedule);
            totalViolation += violation * weight;
        }
        
        return totalViolation;
    }
}

// Objective Function for multi-objective optimization
class ObjectiveFunction {
    constructor() {
        this.objectives = new Map();
        this.weights = new Map();
    }

    addObjective(name, evaluationFunction, weight = 1.0) {
        this.objectives.set(name, evaluationFunction);
        this.weights.set(name, weight);
    }

    evaluate(schedule, context) {
        let totalScore = 0;
        const scores = {};
        
        for (const [name, evaluationFunction] of this.objectives) {
            const score = evaluationFunction(schedule, context);
            const weight = this.weights.get(name);
            
            scores[name] = score;
            totalScore += score * weight;
        }
        
        return { totalScore, individualScores: scores };
    }
}

// Export for global access
window.ScheduleOptimizer = ScheduleOptimizer;
window.ConstraintManager = ConstraintManager;
window.ObjectiveFunction = ObjectiveFunction;
