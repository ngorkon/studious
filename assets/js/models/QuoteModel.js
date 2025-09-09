class QuoteModel {
    constructor() {
        this.quotes = [
            { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
        ];
    }

    getRandomQuote() {
        const index = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[index];
    }
}

