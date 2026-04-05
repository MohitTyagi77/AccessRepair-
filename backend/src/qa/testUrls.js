// Curated dataset for AccessRepair QA Loop
module.exports = [
    // 🔴 Intentionally Inaccessible (High Priority Testing)
    'https://www.washington.edu/accesscomputing/AU/before.html',
    'https://www.w3.org/WAI/demos/bad/',
    'https://dequeuniversity.com/demo/',

    // 🟡 Real-World Complex Websites
    'https://www.amazon.in',
    'https://www.flipkart.com',
    'https://www.bbc.com',
    'https://www.ndtv.com',
    'https://medium.com',

    // 🟢 Accessibility Benchmark (Good Sites)
    'https://www.w3.org',
    'https://www.scope.org.uk',
    'https://www.patagonia.com',

    // ⚡ Edge Cases (Dynamic / JS-heavy)
    'https://twitter.com',
    'https://web.whatsapp.com',
    'https://stripe.com'
];
