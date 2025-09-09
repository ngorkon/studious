// Local LLM Integration for Flashcard Generation
// Supports Ollama, LM Studio, GPT4All, and other local LLM providers

class LocalLLMProvider {
    constructor() {
        console.log('🚀 Initializing LocalLLMProvider...');
        this.providers = {
            ollama: {
                url: 'http://localhost:11434',
                endpoint: '/api/generate',
                models: ['llama3.2:3b', 'llama3.2', 'llama3:8b', 'llama3.2:latest', 'llama3.1', 'llama3.3', 'llama2:7b', 'mistral:7b', 'codellama:7b', 'phi3:mini']
            },
            lmstudio: {
                url: 'http://localhost:1234',
                endpoint: '/v1/chat/completions',
                models: ['local-model'] // LM Studio uses generic model names
            },
            gpt4all: {
                url: 'http://localhost:4891',
                endpoint: '/v1/chat/completions',
                models: ['gpt4all-model']
            },
            textgenwebui: {
                url: 'http://localhost:5000',
                endpoint: '/v1/chat/completions',
                models: ['local-model']
            }
        };
        
        this.activeProvider = null;
        this.activeModel = null;
        this.isAvailable = false;
        
        this.detectAvailableProviders();
    }

    async detectAvailableProviders() {
        console.log('🔍 Detecting local LLM providers...');
        
        for (const [name, config] of Object.entries(this.providers)) {
            try {
                const isAvailable = await this.testProvider(name, config);
                if (isAvailable) {
                    this.activeProvider = name;
                    this.isAvailable = true;
                    console.log(`✅ Found ${name} at ${config.url}`);
                    
                    // Get available models and select the best one
                    await this.detectAndSelectBestModel(name, config);
                    break;
                }
            } catch (error) {
                console.log(`❌ ${name} not available at ${config.url}`);
            }
        }
        
        if (!this.isAvailable) {
            console.log('🔧 No local LLM providers detected. Install Ollama, LM Studio, or GPT4All for local AI.');
        }
    }

    async detectAndSelectBestModel(providerName, config) {
        if (providerName === 'ollama') {
            // Get available models from Ollama
            const availableModels = await this.getAvailableOllamaModels();
            
            if (availableModels.length === 0) {
                console.warn('No models found in Ollama');
                return false;
            }
            
            // Preferred models in order of capability (most powerful first)
            const preferredModels = [
                'llama3.3',
                'llama3.2', 
                'llama3.1',
                'llama3:8b',
                'llama3:latest',
                'llama2:7b',
                'mistral:7b',
                'codellama:7b',
                'phi3:mini'
            ];
            
            // Find the best available model
            for (const preferred of preferredModels) {
                if (availableModels.includes(preferred)) {
                    this.activeModel = preferred;
                    console.log(`✅ Selected best model: ${preferred}`);
                    return true;
                }
            }
            
            // Fallback to first available model
            this.activeModel = availableModels[0];
            console.log(`⚠️ Using fallback model: ${this.activeModel}`);
            return true;
        } else {
            // For other providers, use default model
            this.activeModel = config.models[0];
            console.log(`✅ Using model: ${this.activeModel} for ${providerName}`);
            return true;
        }
    }

    async getAvailableOllamaModels() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.models ? data.models.map(model => model.name) : [];
        } catch (error) {
            console.error('Failed to get Ollama models:', error);
            return [];
        }
    }

    async testProvider(name, config) {
        try {
            if (name === 'ollama') {
                // Test Ollama with simple API call
                const response = await fetch(`${config.url}/api/tags`, {
                    method: 'GET',
                    timeout: 3000
                });
                return response.ok;
            } else {
                // Test OpenAI-compatible endpoints
                const response = await fetch(`${config.url}/v1/models`, {
                    method: 'GET',
                    timeout: 3000
                });
                return response.ok;
            }
        } catch (error) {
            return false;
        }
    }

    async detectModels(providerName, config) {
        try {
            if (providerName === 'ollama') {
                const response = await fetch(`${config.url}/api/tags`);
                const data = await response.json();
                const models = data.models?.map(m => m.name) || [];
                this.providers.ollama.models = models;
                
                // Prioritize models that work on your system (memory-optimized)
                if (models.includes('llama3.2:3b')) {
                    this.activeModel = 'llama3.2:3b';
                    console.log(`🎯 Selected optimal model: llama3.2:3b (2GB)`);
                } else if (models.includes('llama3.2:latest')) {
                    this.activeModel = 'llama3.2:latest';
                    console.log(`🎯 Selected compact model: llama3.2:latest`);
                } else if (models.includes('llama3.2')) {
                    this.activeModel = 'llama3.2';
                    console.log(`🎯 Selected compact model: llama3.2`);
                } else if (models.includes('llama3:8b')) {
                    this.activeModel = 'llama3:8b';
                    console.log(`🎯 Selected medium model: llama3:8b (5GB)`);
                } else if (models.includes('llama3.3:latest')) {
                    this.activeModel = 'llama3.3:latest';
                    console.log(`⚠️ Selected large model: llama3.3:latest (may require more memory)`);
                } else {
                    this.activeModel = models[0] || 'llama3.2:3b';
                    console.log(`🎯 Selected default model: ${this.activeModel}`);
                }
                
                console.log(`📋 Available Ollama models: ${models.join(', ')}`);
                console.log(`✅ Active model: ${this.activeModel}`);
            } else {
                // For OpenAI-compatible APIs, use first available model
                this.activeModel = config.models[0];
                console.log(`📋 Using model: ${this.activeModel}`);
            }
        } catch (error) {
            console.warn('Could not detect models, using llama3.2:3b as default');
            this.activeModel = 'llama3.2:3b';
        }
    }

    async generateFlashcards(content, options = {}) {
        if (!this.isAvailable) {
            throw new Error('No local LLM provider available. Please install Ollama, LM Studio, or GPT4All.');
        }

        const {
            cardCount = 5,
            difficulty = 'intermediate',
            subject = 'general',
            studentLevel = 'college'
        } = options;

        const prompt = this.createFlashcardPrompt(content, {
            cardCount,
            difficulty,
            subject,
            studentLevel
        });

        try {
            if (this.activeProvider === 'ollama') {
                return await this.generateWithOllama(prompt);
            } else {
                return await this.generateWithOpenAICompatible(prompt);
            }
        } catch (error) {
            console.error('Local LLM generation failed:', error);
            throw new Error('Failed to generate flashcards with local LLM: ' + error.message);
        }
    }

    async generateSchedule(context) {
        if (!this.isAvailable) {
            throw new Error('No local LLM available for schedule generation.');
        }

        try {
            console.log(`🧠 Generating AI schedule using ${this.activeModel}...`);
            
            const prompt = this.createSchedulePrompt(context);
            const result = await this.generateWithOllama(prompt, true); // true indicates schedule generation
            
            return this.parseScheduleResponse(result);
        } catch (error) {
            console.error('Schedule generation failed:', error);
            throw new Error('Failed to generate schedule with local LLM: ' + error.message);
        }
    }

    parseScheduleResponse(response) {
        try {
            // Extract JSON from the response
            let jsonStr = response;
            
            // Look for JSON content between markers or clean up the response
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
            
            // Clean up common formatting issues
            jsonStr = jsonStr
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .replace(/^\s*\n/, '')
                .trim();
            
            const schedule = JSON.parse(jsonStr);
            
            // Validate schedule structure
            if (!schedule.schedule || !Array.isArray(schedule.schedule)) {
                throw new Error('Invalid schedule format: missing schedule array');
            }
            
            console.log('✅ Successfully parsed AI-generated schedule');
            return schedule;
            
        } catch (error) {
            console.error('Failed to parse schedule response:', error);
            
            // Return a fallback basic schedule
            return {
                schedule: [
                    {
                        day: "Monday",
                        sessions: [
                            {
                                time: "09:00",
                                duration: 60,
                                subject: "Study Session",
                                type: "Focus",
                                technique: "Pomodoro",
                                energy_required: "Medium",
                                reasoning: "Fallback session due to parsing error"
                            }
                        ]
                    }
                ],
                weekly_strategy: "Basic schedule generated due to AI parsing issues",
                adaptive_tips: ["Try regenerating the schedule for better AI optimization"],
                optimization_reasoning: "Fallback schedule provided due to technical limitations"
            };
        }
    }

    createFlashcardPrompt(content, options) {
        return `You are an expert educational content creator specializing in creating high-quality flashcards optimized for learning retention.

CONTENT TO ANALYZE:
${content.substring(0, 2000)}

FLASHCARD SPECIFICATIONS:
- Number of cards: ${options.cardCount}
- Student level: ${options.studentLevel} 
- Subject area: ${options.subject}
- Difficulty level: ${options.difficulty}

REQUIREMENTS:
- Create diverse question types: recall, concept understanding, application, analysis
- Focus on the most important and testable concepts
- Make questions clear, specific, and engaging
- Provide concise but complete answers
- Include helpful hints and learning explanations
- Use active learning principles

OUTPUT FORMAT - Return ONLY valid JSON:
[
  {
    "question": "Clear, specific question that tests understanding",
    "answer": "Concise, accurate answer",
    "hint": "Helpful hint to guide thinking",
    "explanation": "Brief explanation reinforcing the concept",
    "type": "recall|concept|application|analysis",
    "difficulty": 1-5,
    "tags": ["topic1", "topic2"]
  }
]

Generate ${options.cardCount} high-quality flashcards now:`;
    }

    createSchedulePrompt(context) {
        // Enhanced scheduling prompt optimized for Llama3
        const { profile, subjects, studyGoals, timeConstraints, energyLevels, currentContext } = context;
        
        return `You are an expert learning optimization AI with deep knowledge of cognitive science, spaced repetition, and personalized education.

LEARNER PROFILE:
- Learning Style: ${profile?.learningStyle || 'Mixed (Visual/Kinesthetic)'}
- Peak Energy Hours: ${energyLevels?.peaks?.map(p => `${p.hour}:00 (${Math.round(p.score * 100)}%)`).join(', ') || '9:00 (90%), 14:00 (75%), 19:00 (65%)'}
- Energy Patterns: Morning ${Math.round((energyLevels?.morning || 0.8) * 100)}%, Afternoon ${Math.round((energyLevels?.afternoon || 0.6) * 100)}%, Evening ${Math.round((energyLevels?.evening || 0.5) * 100)}%
- Motivation Level: ${profile?.motivation || 'High'}
- Preferred Session Length: ${profile?.sessionPreferences?.preferredDuration || 45} minutes

SUBJECTS TO SCHEDULE:
${subjects?.map(s => `- ${s.name}: Priority ${s.priority || 'Medium'}, Difficulty ${s.difficulty || 'Medium'}, Weekly Target ${s.weeklyHours || 3}h`).join('\n') || '- Mathematics: Priority High, Difficulty Hard, Weekly Target 5h\n- Literature: Priority Medium, Difficulty Medium, Weekly Target 3h\n- Science: Priority High, Difficulty Hard, Weekly Target 4h'}

STUDY CONSTRAINTS:
- Available daily hours: ${timeConstraints?.dailyHours || 4}
- Study window: ${timeConstraints?.startTime || '09:00'} to ${timeConstraints?.endTime || '21:00'}
- Break preferences: Every ${timeConstraints?.breakFrequency || 25} minutes
- Maximum session length: ${timeConstraints?.maxSessionLength || 90} minutes

LEARNING GOALS:
- Primary objective: ${studyGoals?.type || 'Comprehensive mastery'}
- Target completion: ${studyGoals?.deadline || 'Ongoing development'}
- Special focus: ${studyGoals?.focusAreas?.join(', ') || 'Deep understanding and long-term retention'}

OPTIMIZATION CRITERIA:
1. Align high-difficulty subjects with peak energy periods
2. Implement spaced repetition for maximum retention
3. Balance cognitive load throughout the week
4. Include strategic breaks and recovery periods
5. Adapt to the learner's specific style and preferences
6. Minimize stress while maximizing learning efficiency

REQUIRED JSON OUTPUT:
{
  "schedule": [
    {
      "day": "Monday",
      "sessions": [
        {
          "time": "09:00",
          "duration": 90,
          "subject": "Mathematics",
          "type": "Deep Focus|Review|Practice|Exploration",
          "technique": "Pomodoro|Active Recall|Spaced Repetition|Mind Mapping|Problem Solving",
          "energy_required": "High|Medium|Low",
          "reasoning": "Detailed explanation of why this scheduling choice optimizes learning"
        }
      ]
    }
  ],
  "weekly_strategy": "Comprehensive explanation of the overall scheduling strategy and how it maximizes learning outcomes",
  "adaptive_tips": [
    "Specific, actionable tip based on the learner's profile",
    "Personalized recommendation for improvement",
    "Optimization suggestion for better results"
  ],
  "optimization_reasoning": "Detailed analysis of how this schedule addresses the learner's unique needs and maximizes educational efficiency"
}

Create the optimal personalized schedule:`;
    }

    async generateWithOllama(prompt, isScheduleGeneration = false) {
        const config = this.providers.ollama;
        console.log(`🦙 Generating with ${this.activeModel} (${isScheduleGeneration ? 'schedule' : 'flashcards'})...`);
        
        const response = await fetch(`${config.url}${config.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.activeModel,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: isScheduleGeneration ? 0.7 : 0.3, // More creative for scheduling
                    top_k: 40,
                    top_p: 0.9,
                    num_ctx: 4096, // Larger context for complex prompts
                    num_predict: isScheduleGeneration ? 2048 : 1024, // More tokens for schedules
                    stop: ["\n\n---", "END", "STOP"]
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🦙 Llama3 raw response length:', data.response?.length || 0);
        
        if (isScheduleGeneration) {
            return this.parseScheduleResponse(data.response);
        } else {
            return this.parseFlashcardResponse(data.response);
        }
    }

    async generateWithOpenAICompatible(prompt) {
        const config = this.providers[this.activeProvider];
        const response = await fetch(`${config.url}${config.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.activeModel,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert educational content creator specializing in flashcard generation.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        return this.parseFlashcardResponse(content);
    }

    parseFlashcardResponse(response) {
        try {
            // Extract JSON from response if it's wrapped in text
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            const jsonString = jsonMatch ? jsonMatch[0] : response;
            
            const flashcards = JSON.parse(jsonString);
            
            // Validate and enhance flashcards
            return flashcards.map((card, index) => ({
                id: `local_llm_${Date.now()}_${index}`,
                question: card.question || 'Generated question',
                answer: card.answer || 'Generated answer',
                hint: card.hint || 'Think about the key concepts',
                explanation: card.explanation || 'This tests understanding of the material',
                type: card.type || 'concept',
                difficulty: card.difficulty || 3,
                tags: ['local-llm', 'generated'],
                aiGenerated: true,
                localLLM: true,
                provider: this.activeProvider,
                model: this.activeModel,
                performance: {
                    attempts: 0,
                    correct: 0,
                    averageResponseTime: 0,
                    lastReviewed: null,
                    masteryLevel: 0
                },
                metadata: {
                    studyTechniques: ['active-recall', 'spaced-repetition'],
                    cognitiveLoad: card.difficulty || 3,
                    generatedAt: new Date().toISOString()
                }
            }));
        } catch (error) {
            console.error('Failed to parse LLM response:', error);
            console.log('Raw response:', response);
            
            // Fallback: create basic flashcards from response
            return this.createFallbackFlashcards(response);
        }
    }

    createFallbackFlashcards(response) {
        // Create simple flashcards if JSON parsing fails
        const sentences = response.split('\n').filter(s => s.trim().length > 20);
        const flashcards = [];
        
        for (let i = 0; i < Math.min(5, sentences.length); i++) {
            const sentence = sentences[i].trim();
            flashcards.push({
                id: `local_llm_fallback_${Date.now()}_${i}`,
                question: `What is the key concept in: "${sentence.substring(0, 80)}..."?`,
                answer: sentence,
                hint: 'Consider the main idea being presented',
                explanation: 'This tests understanding of the generated content',
                type: 'concept',
                difficulty: 3,
                tags: ['local-llm', 'fallback'],
                aiGenerated: true,
                localLLM: true,
                provider: this.activeProvider,
                model: this.activeModel,
                performance: {
                    attempts: 0,
                    correct: 0,
                    averageResponseTime: 0,
                    lastReviewed: null,
                    masteryLevel: 0
                }
            });
        }
        
        return flashcards;
    }

    getStatus() {
        return {
            isAvailable: this.isAvailable,
            provider: this.activeProvider,
            model: this.activeModel,
            url: this.activeProvider ? this.providers[this.activeProvider].url : null
        };
    }

    getAvailableModels() {
        if (!this.activeProvider) return [];
        return this.providers[this.activeProvider].models;
    }

    setModel(model) {
        if (this.activeProvider && this.providers[this.activeProvider].models.includes(model)) {
            this.activeModel = model;
            console.log(`🔄 Switched to model: ${model}`);
            return true;
        }
        return false;
    }
}

// Export for use in other modules
window.LocalLLMProvider = LocalLLMProvider;
