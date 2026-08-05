const fs = require('fs');

// 1. Modify index.html
let html = fs.readFileSync('index.html', 'utf8');

// Add dark mode toggle to sidebar
html = html.replace('<nav class="sidebar-nav"', 
    `<div class="sidebar-tools" style="padding: 0 24px 20px; display:flex; justify-content:center;">
        <button id="themeToggleBtn" class="btn btn-outline" style="width:100%;">切換深淺模式 🌞</button>
    </div>\n            <nav class="sidebar-nav"`);

// Add canvas to modal
html = html.replace('<div class="modal-body" id="modalBody">', 
    `<div class="modal-tools" style="padding: 10px 24px; border-bottom: 1px solid var(--border-color); display:flex; gap:10px; justify-content:flex-end;">
                <button id="drawToggleBtn" class="btn btn-outline">✍️ 開啟塗鴉板</button>
                <button id="clearDrawBtn" class="btn btn-outline" style="display:none;">🗑️ 清除畫布</button>
            </div>
            <canvas id="scratchpadCanvas" style="position:absolute; top:0; left:0; pointer-events:none; z-index:5;"></canvas>
            <div class="modal-body" id="modalBody" style="position:relative; z-index:1;">`);

fs.writeFileSync('index.html', html);

// 2. Modify app.js
let app = fs.readFileSync('app.js', 'utf8');

// Add dark mode logic at the top inside DOMContentLoaded
app = app.replace('const sidebarToggleBtn = document.getElementById(\'sidebarToggleBtn\');', 
    `const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const isDark = localStorage.getItem('khmath_theme') === 'dark';
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = isDark ? '切換深淺模式 🌙' : '切換深淺模式 🌞';
    themeToggleBtn.addEventListener('click', () => {
        const currentIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (currentIsDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('khmath_theme', 'light');
            themeToggleBtn.innerHTML = '切換深淺模式 🌞';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('khmath_theme', 'dark');
            themeToggleBtn.innerHTML = '切換深淺模式 🌙';
        }
    });
    
    // Canvas logic
    const scratchpadCanvas = document.getElementById('scratchpadCanvas');
    const drawToggleBtn = document.getElementById('drawToggleBtn');
    const clearDrawBtn = document.getElementById('clearDrawBtn');
    let isDrawing = false;
    let isDrawMode = false;
    let ctx = scratchpadCanvas.getContext('2d');
    
    function resizeCanvas() {
        const modalCard = document.getElementById('modalCard');
        scratchpadCanvas.width = modalCard.clientWidth;
        scratchpadCanvas.height = modalCard.clientHeight;
        ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#34d399' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
    }
    window.addEventListener('resize', () => { if (isDrawMode) resizeCanvas(); });
    
    drawToggleBtn.addEventListener('click', () => {
        isDrawMode = !isDrawMode;
        if (isDrawMode) {
            drawToggleBtn.innerHTML = '✍️ 關閉塗鴉板';
            drawToggleBtn.classList.add('btn-primary');
            drawToggleBtn.classList.remove('btn-outline');
            clearDrawBtn.style.display = 'inline-block';
            scratchpadCanvas.style.pointerEvents = 'auto';
            resizeCanvas();
        } else {
            drawToggleBtn.innerHTML = '✍️ 開啟塗鴉板';
            drawToggleBtn.classList.remove('btn-primary');
            drawToggleBtn.classList.add('btn-outline');
            clearDrawBtn.style.display = 'none';
            scratchpadCanvas.style.pointerEvents = 'none';
        }
    });
    
    clearDrawBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, scratchpadCanvas.width, scratchpadCanvas.height);
    });
    
    function getPos(e) {
        const rect = scratchpadCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }
    
    const startDraw = (e) => {
        if (!isDrawMode) return;
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
    };
    const draw = (e) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        e.preventDefault();
    };
    const endDraw = () => {
        isDrawing = false;
        ctx.beginPath();
    };
    
    scratchpadCanvas.addEventListener('mousedown', startDraw);
    scratchpadCanvas.addEventListener('mousemove', draw);
    scratchpadCanvas.addEventListener('mouseup', endDraw);
    scratchpadCanvas.addEventListener('mouseout', endDraw);
    scratchpadCanvas.addEventListener('touchstart', startDraw, {passive: false});
    scratchpadCanvas.addEventListener('touchmove', draw, {passive: false});
    scratchpadCanvas.addEventListener('touchend', endDraw);
`);

// Add progress tracking helpers and lazy loading
app = app.replace('function renderWorksheet(unitIndex, sectionIndex) {', 
    `function getCompleted() { return JSON.parse(localStorage.getItem('khmath_completed') || '[]'); }
    function markCompleted(id, card) {
        let comp = getCompleted();
        if (!comp.includes(id)) {
            comp.push(id);
            localStorage.setItem('khmath_completed', JSON.stringify(comp));
            card.classList.add('completed');
            
            // Add checkmark explicitly if not present
            if (!card.querySelector('.completion-mark')) {
                const numBox = card.querySelector('.question-header');
                const mark = document.createElement('span');
                mark.className = 'completion-mark';
                mark.innerHTML = '✅';
                mark.style.marginLeft = '10px';
                numBox.appendChild(mark);
            }
        }
    }
    
    function renderWorksheet(unitIndex, sectionIndex) {
        // Trigger fade-in animation
        worksheetContainer.classList.remove('fade-in');
        void worksheetContainer.offsetWidth; // trigger reflow
        worksheetContainer.classList.add('fade-in');
`);

app = app.replace(/<img src="\${q\.image}" class="question-image" alt="" onerror="this\.style\.display='none'" \/>/g, 
                  '<img src="${q.image}" class="question-image" alt="" loading="lazy" onerror="this.style.display=\'none\'" />');
app = app.replace(/<img src="\${q\.answerImage}" class="answer-image" alt="" onerror="this\.style\.display='none'" \/>/g, 
                  '<img src="${q.answerImage}" class="answer-image" alt="" loading="lazy" onerror="this.style.display=\'none\'" />');
app = app.replace(/<img src="\${q\.image}" class="modal-question-image" alt="" onerror="this\.style\.display='none'" \/>/g, 
                  '<img src="${q.image}" class="modal-question-image" alt="" loading="lazy" onerror="this.style.display=\'none\'" />');
app = app.replace(/<img src="\${q\.answerImage}" class="modal-answer-image" alt="" onerror="this\.style\.display='none'" \/>/g, 
                  '<img src="${q.answerImage}" class="modal-answer-image" alt="" loading="lazy" onerror="this.style.display=\'none\'" />');

// Modify renderWorksheet logic to check completion
app = app.replace(/const card = document\.createElement\('div'\);\n\s*card\.className = 'question-card';/,
    `const uniqueId = \`q-\${unitIndex}-\${sectionIndex}-\${q.id}\`;
            const isComp = getCompleted().includes(uniqueId);
            const card = document.createElement('div');
            card.className = 'question-card' + (isComp ? ' completed' : '');`);

app = app.replace(/<div class="question-number">\${index \+ 1}<\/div>/,
    `<div class="question-number">\${index + 1}</div>\${isComp ? '<span class="completion-mark" style="margin-left:10px;">✅</span>' : ''}`);

// When answer is toggled on card, mark completed
app = app.replace(/answerText\.classList\.add\('visible'\);\n\s*btn\.textContent = '隱藏答案';/,
    `answerText.classList.add('visible');
                    btn.textContent = '隱藏答案';
                    markCompleted(uniqueId, card);`);

// When modal is opened, clear canvas if any
app = app.replace(/function openModal\(q, index\) \{/,
    `function openModal(q, index, uniqueId, card) {
        if (ctx) ctx.clearRect(0, 0, scratchpadCanvas.width, scratchpadCanvas.height);
        document.getElementById('modalCard').dataset.currentUniqueId = uniqueId;
        document.getElementById('modalCard').dataset.currentCardIndex = index;`);

// Pass uniqueId and card to openModal
app = app.replace(/openModal\(q, index\);/, `openModal(q, index, uniqueId, card);`);

// Inside openModal, mark completed when answer shown
app = app.replace(/modalAnswerText\.classList\.add\('visible'\);\n\s*modalAnswerImage\.classList\.add\('visible'\);\n\s*modalToggleBtn\.textContent = '隱藏答案';/,
    `modalAnswerText.classList.add('visible');
            modalAnswerImage.classList.add('visible');
            modalToggleBtn.textContent = '隱藏答案';
            
            const curId = document.getElementById('modalCard').dataset.currentUniqueId;
            const cardList = worksheetContainer.querySelectorAll('.question-card');
            const cIndex = document.getElementById('modalCard').dataset.currentCardIndex;
            if (cIndex !== undefined && cardList[cIndex]) markCompleted(curId, cardList[cIndex]);`);

// Inside toggleAllBtn logic
app = app.replace(/btn\.textContent = '隱藏答案';\n\s*\}\n\s*\}/g,
    `btn.textContent = '隱藏答案';
                    // Extract uniqueId from the card we stored, or re-parse. We can just use the DOM structure or add a data attribute to the card.
                    const uniqueId = card.dataset.id;
                    markCompleted(uniqueId, card);
                }
            }`);
// Wait, card.dataset.id isn't set. Let's set it.
app = app.replace(/card\.className = 'question-card' \+ \(isComp \? ' completed' : ''\);/,
    `card.className = 'question-card' + (isComp ? ' completed' : '');
            card.dataset.id = uniqueId;`);

fs.writeFileSync('app.js', app);

console.log("Modifications complete.");
