import worksheetData from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebarNav');
    const worksheetContainer = document.getElementById('worksheetContainer');
    const unitTitle = document.getElementById('unitTitle');
    const sectionTitle = document.getElementById('sectionTitle');
    const toggleAllBtn = document.getElementById('toggleAllBtn');

    let currentSectionData = null;
    let allAnswersVisible = false;

    // Initialize sidebar
    function renderSidebar() {
        sidebarNav.innerHTML = '';
        
        worksheetData.forEach((unitData, unitIndex) => {
            const unitEl = document.createElement('div');
            unitEl.className = 'nav-unit';
            if (unitIndex === 0) unitEl.classList.add('active'); // First unit open by default

            const headerEl = document.createElement('div');
            headerEl.className = 'nav-unit-header';
            headerEl.innerHTML = `
                <span>${unitData.unitName}</span>
                <span class="nav-unit-icon">▼</span>
            `;
            headerEl.addEventListener('click', () => {
                unitEl.classList.toggle('active');
            });

            const sectionsEl = document.createElement('div');
            sectionsEl.className = 'nav-sections';

            unitData.sections.forEach(sectionData => {
                const itemEl = document.createElement('div');
                itemEl.className = 'nav-section-item';
                itemEl.textContent = `${sectionData.section} ${sectionData.sectionName}`;
                
                itemEl.addEventListener('click', () => {
                    // Remove active from all items
                    document.querySelectorAll('.nav-section-item').forEach(el => el.classList.remove('active'));
                    itemEl.classList.add('active');
                    
                    loadSection(unitData, sectionData);
                });

                sectionsEl.appendChild(itemEl);
            });

            unitEl.appendChild(headerEl);
            unitEl.appendChild(sectionsEl);
            sidebarNav.appendChild(unitEl);
        });
    }

    // Load a specific section
    function loadSection(unitData, sectionData) {
        currentSectionData = sectionData;
        allAnswersVisible = false;
        
        // Update header
        unitTitle.textContent = unitData.unitName;
        sectionTitle.textContent = `${sectionData.section} ${sectionData.sectionName}`;
        toggleAllBtn.style.display = 'inline-flex';
        toggleAllBtn.textContent = '顯示全部答案';
        toggleAllBtn.className = 'btn btn-primary';

        // Render questions
        worksheetContainer.innerHTML = '';
        
        if (!sectionData.questions || sectionData.questions.length === 0) {
            worksheetContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>這個小節目前沒有題目。</p>
                </div>
            `;
            return;
        }

        sectionData.questions.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            
            card.innerHTML = `
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-text">${q.text}</div>
                </div>
                ${q.image ? `<img src="${q.image}" class="question-image" alt="" onerror="this.style.display='none'" />` : ''}
                <div class="answer-area">
                    <button class="btn btn-outline toggle-answer-btn">顯示答案</button>
                    <div class="answer-text">
                        ${q.answer}
                        ${q.answerImage ? `<img src="${q.answerImage}" class="answer-image" alt="" onerror="this.style.display='none'" />` : ''}
                    </div>
                </div>
            `;

            // Individual toggle
            const btn = card.querySelector('.toggle-answer-btn');
            const answerText = card.querySelector('.answer-text');
            
            btn.addEventListener('click', () => {
                const isVisible = answerText.classList.contains('visible');
                if (isVisible) {
                    answerText.classList.remove('visible');
                    btn.textContent = '顯示答案';
                } else {
                    answerText.classList.add('visible');
                    btn.textContent = '隱藏答案';
                }
                
                updateToggleAllButtonState();
            });

            worksheetContainer.appendChild(card);
        });

        // Render math in the container
        if (window.renderMathInElement) {
            window.renderMathInElement(worksheetContainer, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false}
                ],
                throwOnError: false
            });
        }
    }

    // Toggle all answers
    toggleAllBtn.addEventListener('click', () => {
        const answerTexts = document.querySelectorAll('.answer-text');
        const toggleBtns = document.querySelectorAll('.toggle-answer-btn');
        
        allAnswersVisible = !allAnswersVisible;
        
        if (allAnswersVisible) {
            toggleAllBtn.textContent = '隱藏全部答案';
            toggleAllBtn.classList.replace('btn-primary', 'btn-outline');
            
            answerTexts.forEach(el => el.classList.add('visible'));
            toggleBtns.forEach(btn => btn.textContent = '隱藏答案');
        } else {
            toggleAllBtn.textContent = '顯示全部答案';
            toggleAllBtn.classList.replace('btn-outline', 'btn-primary');
            
            answerTexts.forEach(el => el.classList.remove('visible'));
            toggleBtns.forEach(btn => btn.textContent = '顯示答案');
        }
    });

    // Update global toggle button based on individual toggles
    function updateToggleAllButtonState() {
        const total = document.querySelectorAll('.answer-text').length;
        const visibleCount = document.querySelectorAll('.answer-text.visible').length;
        
        if (visibleCount === total && total > 0) {
            allAnswersVisible = true;
            toggleAllBtn.textContent = '隱藏全部答案';
            toggleAllBtn.classList.replace('btn-primary', 'btn-outline');
        } else if (visibleCount === 0) {
            allAnswersVisible = false;
            toggleAllBtn.textContent = '顯示全部答案';
            toggleAllBtn.classList.replace('btn-outline', 'btn-primary');
        }
        // If partially visible, keep the current state of global button, 
        // or we could add a "mixed" state, but simple is better here.
    }

    // Initialize
    renderSidebar();
});
