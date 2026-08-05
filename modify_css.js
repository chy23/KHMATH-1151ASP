const fs = require('fs');
let css = fs.readFileSync('index.css', 'utf8');

// Add dark theme variables
if (!css.includes('[data-theme="dark"]')) {
    css = css.replace(':root {', 
`:root {
    --bg-main: #f9fafb;
    --bg-card: #ffffff;
    --bg-sidebar: #ffffff;
    --text-primary: #1f2937;
    --text-secondary: #4b5563;
    --border-color: #e5e7eb;
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
    --bg-main: #111827;
    --bg-card: #1f2937;
    --bg-sidebar: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
    --primary-color: #60a5fa;
    --primary-hover: #3b82f6;
    --shadow-color: rgba(0, 0, 0, 0.5);
}`);

    // Replace hardcoded colors with CSS variables
    css = css.replace(/background-color: #f3f4f6;/g, 'background-color: var(--bg-main);');
    css = css.replace(/background-color: #ffffff;/g, 'background-color: var(--bg-card);');
    css = css.replace(/background-color: white;/g, 'background-color: var(--bg-card);');
    css = css.replace(/color: #1f2937;/g, 'color: var(--text-primary);');
    css = css.replace(/color: #374151;/g, 'color: var(--text-secondary);');
    css = css.replace(/color: #6b7280;/g, 'color: var(--text-secondary);');
    css = css.replace(/color: #4b5563;/g, 'color: var(--text-secondary);');
    css = css.replace(/border: 1px solid #e5e7eb;/g, 'border: 1px solid var(--border-color);');
    css = css.replace(/border-bottom: 1px solid #e5e7eb;/g, 'border-bottom: 1px solid var(--border-color);');
    css = css.replace(/border-right: 1px solid #e5e7eb;/g, 'border-right: 1px solid var(--border-color);');
    css = css.replace(/background-color: #3b82f6;/g, 'background-color: var(--primary-color);');
    css = css.replace(/background-color: #2563eb;/g, 'background-color: var(--primary-hover);');
    css = css.replace(/color: #3b82f6;/g, 'color: var(--primary-color);');
    
    // Background and text color updates
    css = css.replace('.app-container {\n    display: flex;\n    height: 100vh;\n    overflow: hidden;',
        '.app-container {\n    display: flex;\n    height: 100vh;\n    overflow: hidden;\n    background-color: var(--bg-main);\n    color: var(--text-primary);');
    
    css = css.replace('.sidebar {\n    width: 250px;\n    background-color: #ffffff;\n    border-right: 1px solid #e5e7eb;',
        '.sidebar {\n    width: 250px;\n    background-color: var(--bg-sidebar);\n    border-right: 1px solid var(--border-color);');

    // Add fade-in animation class
    css += `\n
/* --- Animations & Transitions --- */
.fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* --- Progress Checkmark Style --- */
.question-card.completed {
    border-color: #34d399; /* Green border for completed */
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
}
[data-theme="dark"] .question-card.completed {
    border-color: #10b981;
}
.completion-mark {
    font-size: 1.2rem;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
}

/* Canvas fix */
#scratchpadCanvas {
    cursor: crosshair;
}
`;
}
fs.writeFileSync('index.css', css);
console.log("CSS updated.");
