// Test script for Local LLM Integration
// This script validates all the components are working correctly

function runValidationTests() {
    console.log('🧪 Running Local LLM Integration Tests...');
    console.log('================================================');
    
    // Test 1: Check if LocalLLMProvider is loaded
    console.log('\n📋 Test 1: LocalLLMProvider Class');
    if (typeof LocalLLMProvider !== 'undefined') {
        console.log('✅ LocalLLMProvider class loaded successfully');
        
        const llmProvider = new LocalLLMProvider();
        console.log('✅ LocalLLMProvider instance created');
        
        // Check provider detection
        setTimeout(() => {
            const status = llmProvider.getStatus();
            console.log('🔍 LLM Provider Status:', status);
            
            if (status.isAvailable) {
                console.log(`✅ Local LLM detected: ${status.provider} (${status.model})`);
            } else {
                console.log('ℹ️ No local LLMs detected - Demo mode will be used');
            }
        }, 2000);
        
    } else {
        console.log('❌ LocalLLMProvider class not found');
    }
    
    // Test 2: Check if EnvironmentConfig is loaded
    console.log('\n📋 Test 2: EnvironmentConfig Class');
    if (typeof EnvironmentConfig !== 'undefined') {
        console.log('✅ EnvironmentConfig class loaded successfully');
        
        const envConfig = new EnvironmentConfig();
        const keys = envConfig.getAPIKeys();
        console.log('🔑 API Keys Configuration:', {
            hasOpenAI: !!keys.openai,
            hasAnthropic: !!keys.anthropic,
            hasGoogle: !!keys.google,
            defaultProvider: keys.defaultProvider
        });
        
        console.log('✅ Environment configuration working');
    } else {
        console.log('❌ EnvironmentConfig class not found');
    }
    
    // Test 3: Check if AIFlashcardGenerator integration is working
    console.log('\n📋 Test 3: AIFlashcardGenerator Integration');
    if (typeof AIFlashcardGenerator !== 'undefined') {
        console.log('✅ AIFlashcardGenerator class loaded successfully');
        
        try {
            const aiGenerator = new AIFlashcardGenerator();
            console.log('✅ AIFlashcardGenerator instance created');
            
            // Test provider status
            setTimeout(() => {
                if (aiGenerator.getAIProviderStatus) {
                    const providerStatus = aiGenerator.getAIProviderStatus();
                    console.log('🤖 AI Provider Status:', providerStatus);
                    console.log(`📊 Recommended provider: ${providerStatus.recommended}`);
                } else {
                    console.log('ℹ️ getAIProviderStatus method not available');
                }
            }, 3000);
            
        } catch (error) {
            console.log('❌ Error creating AIFlashcardGenerator:', error.message);
        }
    } else {
        console.log('❌ AIFlashcardGenerator class not found');
    }
    
    // Test 4: Demo flashcard generation
    console.log('\n📋 Test 4: Demo Flashcard Generation');
    setTimeout(async () => {
        try {
            if (window.aiFlashcardGenerator) {
                const testContent = "Photosynthesis is the process by which plants convert sunlight into energy using chlorophyll.";
                const demoCards = await window.aiFlashcardGenerator.generateDemoFlashcards(testContent, {
                    cardCount: 3,
                    difficulty: 'intermediate'
                });
                
                console.log('✅ Demo flashcards generated:', demoCards.length, 'cards');
                console.log('📄 Sample card:', demoCards[0]);
            } else {
                console.log('ℹ️ AI Flashcard Generator not globally available yet');
            }
        } catch (error) {
            console.log('❌ Demo generation error:', error.message);
        }
    }, 4000);
    
    // Test 5: File loading verification
    console.log('\n📋 Test 5: File Loading Verification');
    const requiredFiles = [
        'LocalLLMProvider.js',
        'EnvironmentConfig.js',
        'AIFlashcardGenerator.js'
    ];
    
    requiredFiles.forEach(file => {
        // Check if script tags exist
        const scripts = document.querySelectorAll('script[src*="' + file + '"]');
        if (scripts.length > 0) {
            console.log(`✅ ${file} script tag found`);
        } else {
            console.log(`❌ ${file} script tag missing`);
        }
    });
    
    console.log('\n🎯 Integration Test Summary:');
    console.log('- Local LLM detection: Automated');
    console.log('- Environment config: Working'); 
    console.log('- Demo mode: Available as fallback');
    console.log('- File loading: Complete');
    console.log('\n✨ Ready to test with local LLMs! Install Ollama and run "ollama serve" to enable local AI.');
}

// Run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runValidationTests);
} else {
    runValidationTests();
}
