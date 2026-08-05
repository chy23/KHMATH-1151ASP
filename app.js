/* 網站建立自楊家驊老師 The website was created by Teacher ChiahuaYang */
console.log("%c網站建立自楊家驊老師 The website was created by Teacher ChiahuaYang", "color: #e5e7eb; font-size: 1px;");

import worksheetData from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebarNav');
    const worksheetContainer = document.getElementById('worksheetContainer');
    const unitTitle = document.getElementById('unitTitle');
    const sectionTitle = document.getElementById('sectionTitle');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const appContainer = document.getElementById('appContainer');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');

    // Modal elements
    const questionModal = document.getElementById('questionModal');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    let currentSectionData = null;
    let allAnswersVisible = false;

    // ─── Sidebar Toggle ───────────────────────────────────────────────
    sidebarToggleBtn.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-collapsed');
        sidebarToggleIcon.textContent = appContainer.classList.contains('sidebar-collapsed') ? '▶' : '◀';
    });

    // ─── Modal Logic ──────────────────────────────────────────────────
    function openModal(q, index) {
        modalBody.innerHTML = `
            <div class="modal-question-number">${index + 1}</div>
            <div class="modal-question-text">${q.text}</div>
            ${q.image ? `<img src="${q.image}" class="modal-question-image" alt="" onerror="this.style.display='none'" />` : ''}
            <div class="modal-answer-section">
                <button class="btn btn-outline modal-toggle-btn">顯示答案</button>
                <div class="modal-answer-text">${q.answer || ''}</div>
                ${q.answerImage ? `<img src="${q.answerImage}" class="modal-answer-image" alt="" onerror="this.style.display='none'" />` : ''}
            </div>
        `;

        // Render math
        if (window.renderMathInElement) {
            window.renderMathInElement(modalBody, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false}
                ],
                throwOnError: false
            });
        }

        // Answer toggle inside modal
        const toggleBtn = modalBody.querySelector('.modal-toggle-btn');
        const answerText = modalBody.querySelector('.modal-answer-text');
        const answerImg = modalBody.querySelector('.modal-answer-image');

        toggleBtn.addEventListener('click', () => {
            const visible = answerText.classList.contains('visible');
            if (visible) {
                answerText.classList.remove('visible');
                if (answerImg) answerImg.classList.remove('visible');
                toggleBtn.textContent = '顯示答案';
            } else {
                answerText.classList.add('visible');
                if (answerImg) answerImg.classList.add('visible');
                toggleBtn.textContent = '隱藏答案';
            }
        });

        questionModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        questionModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalCloseBtn.addEventListener('click', closeModal);
    questionModal.addEventListener('click', (e) => {
        if (e.target === questionModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ─── Sidebar Nav ──────────────────────────────────────────────────
    function renderSidebar() {
        sidebarNav.innerHTML = '';
        
        // Filter data based on URL parameter ?level=N
        let activeData = worksheetData;
        const urlParams = new URLSearchParams(window.location.search);
        const level = parseInt(urlParams.get('level'));
        if (!isNaN(level) && level > 0 && level <= worksheetData.length) {
            activeData = worksheetData.slice(0, level);
        }

        activeData.forEach((unitData, unitIndex) => {
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

    // ─── Load Section ────────────────────────────────────────────────
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

            // Click card → open modal (but not if clicking the answer button)
            card.addEventListener('click', (e) => {
                if (e.target.closest('.toggle-answer-btn')) return;
                openModal(q, index);
            });

            // Individual toggle
            const btn = card.querySelector('.toggle-answer-btn');
            const answerText = card.querySelector('.answer-text');
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger card click
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

    // ─── Toggle All Answers ──────────────────────────────────────────
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
    }

    // ─── Initialize ──────────────────────────────────────────────────
    renderSidebar();
});
