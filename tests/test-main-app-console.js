// Quick Main App Test - Run in browser console
// Test AI Integration in Main Application Context

console.log('🚀 Starting Main App AI Integration Test...');

// Test 1: Check if all components are loaded
function testComponentAvailability() {
    console.log('\n📦 Testing Component Availability...');
    
    const components = {
        'AppController': typeof AppController !== 'undefined',
        'LocalLLMProvider': typeof LocalLLMProvider !== 'undefined',
        'AIFlashcardGenerator': typeof AIFlashcardGenerator !== 'undefined',
        'AISmartScheduler': typeof AISmartScheduler !== 'undefined',
        'SmartScheduleController': typeof SmartScheduleController !== 'undefined',
        'UserLearningProfile': typeof UserLearningProfile !== 'undefined',
        'BiorhythmAnalyzer': typeof BiorhythmAnalyzer !== 'undefined'
    };
    
    console.table(components);
    
    const allLoaded = Object.values(components).every(loaded => loaded);
    console.log(allLoaded ? '✅ All components loaded' : '❌ Some components missing');
    
    return allLoaded;
}

// Test 2: Check if app controller instance exists
function testAppControllerInstance() {
    console.log('\n🎯 Testing App Controller Instance...');
    
    if (typeof window.appController !== 'undefined') {
        console.log('✅ AppController instance found');
        console.log('📊 AppController properties:', Object.keys(window.appController));
        return true;
    } else {
        console.log('❌ AppController instance not found');
        return false;
    }
}

// Test 3: Test AI functionality
async function testAIFunctionality() {
    console.log('\n🤖 Testing AI Functionality...');
    
    try {
        // Test LocalLLMProvider
        const provider = new LocalLLMProvider();
        console.log('✅ LocalLLMProvider created');
        
        const response = await provider.generateResponse('Test: Say "AI integration working" in a brief response');
        console.log('✅ AI Response received:', response);
        
        // Test AIFlashcardGenerator
        const generator = new AIFlashcardGenerator();
        console.log('✅ AIFlashcardGenerator created');
        
        const flashcards = await generator.generateFlashcards('The capital of France is Paris.', 1);
        console.log('✅ Flashcard generated:', flashcards);
        
        // Test Smart Scheduler
        const scheduler = new AISmartScheduler();
        console.log('✅ AISmartScheduler created');
        
        const schedule = await scheduler.generateOptimizedSchedule({
            subjects: ['Test Subject'],
            timeframe: 'day',
            constraints: { dailyHours: 2 }
        });
        console.log('✅ Schedule generated:', schedule);
        
        return true;
        
    } catch (error) {
        console.error('❌ AI functionality test failed:', error);
        return false;
    }
}

// Test 4: Check Smart Schedule Controller Integration
function testSmartScheduleIntegration() {
    console.log('\n📅 Testing Smart Schedule Controller Integration...');
    
    try {
        if (typeof window.smartScheduleController !== 'undefined') {
            console.log('✅ SmartScheduleController instance found');
            console.log('📊 Controller properties:', Object.keys(window.smartScheduleController));
            
            // Check if UI was created
            const ui = document.querySelector('.smart-schedule-container');
            if (ui) {
                console.log('✅ Smart schedule UI found in DOM');
            } else {
                console.log('⚠️ Smart schedule UI not found in DOM');
            }
            
            return true;
        } else {
            console.log('❌ SmartScheduleController instance not found');
            return false;
        }
    } catch (error) {
        console.error('❌ Smart schedule integration test failed:', error);
        return false;
    }
}

// Test 5: Check Ollama connectivity
async function testOllamaConnectivity() {
    console.log('\n🔗 Testing Ollama Connectivity...');
    
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Ollama server accessible');
            console.log('📦 Available models:', data.models?.map(m => m.name) || 'None');
            return true;
        } else {
            console.log('❌ Ollama server responded with error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Cannot connect to Ollama server:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Running Complete Main App AI Integration Test Suite...');
    console.log('=' .repeat(60));
    
    const results = {};
    
    results.components = testComponentAvailability();
    results.appController = testAppControllerInstance();
    results.ollama = await testOllamaConnectivity();
    results.ai = await testAIFunctionality();
    results.smartSchedule = testSmartScheduleIntegration();
    
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(60));
    console.table(results);
    
    const successCount = Object.values(results).filter(r => r === true).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n🎯 Overall Result: ${successCount}/${totalCount} tests passed`);
    
    if (successCount === totalCount) {
        console.log('🎉 ALL TESTS PASSED! The AI system is fully functional!');
    } else {
        console.log('⚠️ Some tests failed. Check the details above.');
    }
    
    return results;
}

// Auto-run tests after a short delay
setTimeout(() => {
    runAllTests().catch(error => {
        console.error('❌ Test suite execution failed:', error);
    });
}, 2000);

// Make functions globally available for manual testing
window.testMainAppAI = {
    runAllTests,
    testComponentAvailability,
    testAppControllerInstance,
    testAIFunctionality,
    testSmartScheduleIntegration,
    testOllamaConnectivity
};

console.log('💡 Test functions are available as window.testMainAppAI');
console.log('💡 You can also run individual tests manually');
