// ============================================
// LASU Aggregate Calculator — LAMP EDTECH
// Developed by Afolabi Samuel Oluwaseun
// ============================================

'use strict';

// Grade → Points mapping
const GRADE_POINTS = {
    'A1': 8,
    'B2': 7,
    'B3': 6,
    'C4': 5,
    'C5': 4,
    'C6': 3
};

// Grades that earn zero points
const ZERO_POINT_GRADES = ['D7', 'E8', 'F9'];

// Subject limits
const MAX_SUBJECTS = 9;
const MIN_SUBJECTS = 5;

// State management
let subjectCount = 0;
let isDisclaimerShown = false;

// =============================================
// DOM ELEMENT REFERENCES
// =============================================
const DOM = {
    courseInput: document.getElementById('courseInput'),
    jambScore: document.getElementById('jambScore'),
    subjectsContainer: document.getElementById('subjectsContainer'),
    addSubjectBtn: document.getElementById('addSubjectBtn'),
    subjectCount: document.getElementById('subjectCount'),
    calculateBtn: document.getElementById('calculateBtn'),
    resultContainer: document.getElementById('resultContainer'),
    aggregateScore: document.getElementById('aggregateScore'),
    breakdownContainer: document.getElementById('breakdownContainer'),
    courseHint: document.getElementById('courseHint')
};

// =============================================
// DISCLAIMER MODAL
// =============================================
function showDisclaimer() {
    // Check if disclaimer has been shown before in this session
    if (sessionStorage.getItem('lasuDisclaimerShown')) {
        isDisclaimerShown = true;
        return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'disclaimer-overlay';
    overlay.id = 'disclaimerOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'disclaimerTitle');

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'disclaimer-modal';

    modal.innerHTML = `
        <div class="disclaimer-icon">
            <i class="fas fa-info-circle"></i>
        </div>
        <h2 id="disclaimerTitle" class="disclaimer-title">⚠️ Important Disclaimer</h2>
        <div class="disclaimer-body">
            <p>
                This is a <strong>simulation tool</strong> designed to help you estimate your LASU admission aggregate score 
                based on the screening formula.
            </p>
            <p>
                It is <strong>NOT</strong> the official LASU screening portal. Results shown here are estimates and should 
                not be considered as your final admission score.
            </p>
            <div class="disclaimer-highlight">
                <i class="fas fa-external-link-alt"></i>
                <span>For official screening, registration, and further information, please visit:</span>
                <a href="https://www.lasu.edu.ng" target="_blank" rel="noopener noreferrer" class="disclaimer-link">
                    www.lasu.edu.ng
                </a>
            </div>
            <p class="disclaimer-footer-text">
                Lagos State University — Official Portal
            </p>
        </div>
        <div class="disclaimer-actions">
            <button class="disclaimer-btn-primary" id="acceptDisclaimerBtn">
                <i class="fas fa-check-circle"></i> I Understand, Proceed
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add styles for disclaimer
    const style = document.createElement('style');
    style.textContent = `
        .disclaimer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 1rem;
        }
        
        .disclaimer-overlay.active {
            opacity: 1;
        }
        
        .disclaimer-modal {
            background: white;
            max-width: 500px;
            width: 100%;
            border-radius: 2rem;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .disclaimer-overlay.active .disclaimer-modal {
            transform: scale(1);
        }
        
        .disclaimer-icon {
            font-size: 3rem;
            color: #d97706;
            margin-bottom: 1rem;
        }
        
        .disclaimer-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        
        .disclaimer-body {
            text-align: left;
            font-size: 0.9rem;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        
        .disclaimer-body p {
            margin-bottom: 0.8rem;
        }
        
        .disclaimer-highlight {
            background: #fef3c7;
            padding: 0.8rem;
            border-radius: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            font-size: 0.85rem;
        }
        
        .disclaimer-link {
            color: #0a3d62;
            font-weight: 700;
            text-decoration: underline;
        }
        
        .disclaimer-footer-text {
            font-size: 0.8rem;
            color: #64748b;
            text-align: center;
            margin-top: 0.8rem;
        }
        
        .disclaimer-btn-primary {
            background: #0a3d62;
            color: white;
            border: none;
            padding: 0.9rem 2rem;
            border-radius: 3rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.95rem;
            font-family: 'Poppins', sans-serif;
        }
        
        .disclaimer-btn-primary:hover {
            background: #0c4a6e;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(8, 45, 72, 0.3);
        }
    `;
    document.head.appendChild(style);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Handle accept button
    document.getElementById('acceptDisclaimerBtn').addEventListener('click', acceptDisclaimer);
}

function acceptDisclaimer() {
    const overlay = document.getElementById('disclaimerOverlay');
    
    if (!overlay) return;

    // Animate out
    overlay.classList.remove('active');

    // Remove after animation
    setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        
        // Store in session storage
        sessionStorage.setItem('lasuDisclaimerShown', 'true');
        isDisclaimerShown = true;
        
        // Remove the style element
        const disclaimerStyle = document.querySelector('style');
        if (disclaimerStyle) {
            disclaimerStyle.remove();
        }
    }, 300);
}

// =============================================
// SUBJECT ROW MANAGEMENT
// =============================================
function createSubjectCard(index, isRemovable = true) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('data-subject-index', index);
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', `Subject ${index + 1}`);

    card.innerHTML = `
        <input 
            type="text" 
            class="subject-name" 
            placeholder="e.g., English Language" 
            autocomplete="off"
            aria-label="Subject Name"
            data-subject-index="${index}"
        >
        <select class="subject-grade" aria-label="Subject Grade" data-subject-index="${index}">
            <option value="">— Grade —</option>
            <option value="A1">A1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
            <option value="C4">C4</option>
            <option value="C5">C5</option>
            <option value="C6">C6</option>
            <option value="D7">D7</option>
            <option value="E8">E8</option>
            <option value="F9">F9</option>
        </select>
        ${isRemovable ? `<button type="button" class="remove-subject-btn" aria-label="Remove subject ${index + 1}">✕ Remove</button>` : ''}
    `;

    return card;
}

function addSubjectRow(isRemovable = true) {
    if (subjectCount >= MAX_SUBJECTS) {
        showNotification('Maximum 9 subjects allowed.', 'warning');
        return false;
    }

    const card = createSubjectCard(subjectCount, isRemovable);
    DOM.subjectsContainer.appendChild(card);
    subjectCount++;
    
    updateSubjectCount();
    updateAddButtonState();
    
    // Focus on the new subject input
    const newInput = card.querySelector('.subject-name');
    if (newInput) {
        newInput.focus();
    }
    
    return true;
}

function removeSubjectRow(button) {
    const totalRows = DOM.subjectsContainer.querySelectorAll('.subject-card').length;
    
    if (totalRows <= MIN_SUBJECTS) {
        showNotification('Minimum 5 subjects are required.', 'warning');
        return;
    }

    const card = button.closest('.subject-card');
    if (!card) return;

    // Add removing animation
    card.style.animation = 'slideOut 0.3s ease';
    card.addEventListener('animationend', () => {
        card.remove();
        subjectCount--;
        updateSubjectCount();
        updateAddButtonState();
        reindexSubjectCards();
    }, { once: true });
}

function reindexSubjectCards() {
    const cards = DOM.subjectsContainer.querySelectorAll('.subject-card');
    cards.forEach((card, index) => {
        card.setAttribute('data-subject-index', index);
        const inputs = card.querySelectorAll('input, select, button');
        inputs.forEach(input => {
            input.setAttribute('data-subject-index', index);
            if (input.hasAttribute('aria-label')) {
                input.setAttribute('aria-label', input.getAttribute('aria-label').replace(/\d+/, index + 1));
            }
        });
    });
}

// =============================================
// UI UPDATE FUNCTIONS
// =============================================
function updateSubjectCount() {
    const filledCount = getFilledSubjectCount();
    const countEl = DOM.subjectCount;
    
    countEl.textContent = `${filledCount} subject(s) filled (minimum ${MIN_SUBJECTS} required)`;
    
    if (filledCount >= MIN_SUBJECTS) {
        countEl.classList.add('valid');
        countEl.style.color = '#0f6b3a';
    } else {
        countEl.classList.remove('valid');
        countEl.style.color = '#d97706';
    }
}

function updateAddButtonState() {
    const btn = DOM.addSubjectBtn;
    
    if (subjectCount >= MAX_SUBJECTS) {
        btn.disabled = true;
        btn.textContent = '🚫 Maximum 9 Subjects Reached';
        btn.setAttribute('aria-disabled', 'true');
    } else {
        btn.disabled = false;
        btn.textContent = '➕ Add Another Subject';
        btn.removeAttribute('aria-disabled');
    }
}

function getFilledSubjectCount() {
    const names = DOM.subjectsContainer.querySelectorAll('.subject-name');
    const grades = DOM.subjectsContainer.querySelectorAll('.subject-grade');
    let count = 0;
    
    for (let i = 0; i < names.length; i++) {
        if (names[i].value.trim() && grades[i].value) {
            count++;
        }
    }
    
    return count;
}

// =============================================
// DATA COLLECTION
// =============================================
function collectSubjectData() {
    const names = DOM.subjectsContainer.querySelectorAll('.subject-name');
    const grades = DOM.subjectsContainer.querySelectorAll('.subject-grade');
    const subjects = [];

    for (let i = 0; i < names.length; i++) {
        const name = names[i].value.trim();
        const grade = grades[i].value;
        
        if (name && grade) {
            subjects.push({
                name: name,
                grade: grade,
                points: GRADE_POINTS[grade] || 0
            });
        }
    }
    
    return subjects;
}

// =============================================
// VALIDATION
// =============================================
function validateInputs() {
    const errors = [];
    
    // Validate course
    const course = DOM.courseInput.value.trim();
    if (!course) {
        errors.push('Please enter your course name.');
        DOM.courseInput.focus();
    }
    
    // Validate JAMB score
    const jambScore = parseInt(DOM.jambScore.value);
    if (isNaN(jambScore) || jambScore < 0 || jambScore > 400) {
        errors.push('Please enter a valid JAMB score between 0 and 400.');
        if (!DOM.courseInput.value.trim()) {
            DOM.jambScore.focus();
        }
    }
    
    // Validate subjects
    const subjects = collectSubjectData();
    if (subjects.length < MIN_SUBJECTS) {
        errors.push(`Please enter at least ${MIN_SUBJECTS} subjects with grades.`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        course: course,
        jambScore: jambScore,
        subjects: subjects
    };
}

// =============================================
// CALCULATION
// =============================================
function calculateAggregate() {
    const validation = validateInputs();
    
    if (!validation.isValid) {
        showNotification(validation.errors[0], 'error');
        return;
    }

    const { course, jambScore, subjects } = validation;

    // Sort subjects by points (descending) and take top 5
    const sortedSubjects = [...subjects].sort((a, b) => b.points - a.points);
    const top5Subjects = sortedSubjects.slice(0, 5);
    
    // Calculate O'Level total
    const olevelTotal = top5Subjects.reduce((sum, subject) => sum + subject.points, 0);
    
    // Calculate JAMB points (× 0.15)
    const jambPoints = jambScore * 0.15;
    
    // Calculate aggregate
    const aggregate = jambPoints + olevelTotal;

    // Display result
    displayResult(course, jambScore, jambPoints, top5Subjects, olevelTotal, aggregate, subjects.length);
}

// =============================================
// DISPLAY RESULT
// =============================================
function displayResult(course, jambScore, jambPoints, top5Subjects, olevelTotal, aggregate, totalEntered) {
    // Show result container
    DOM.resultContainer.classList.add('show');
    
    // Update aggregate score display
    DOM.aggregateScore.textContent = aggregate.toFixed(2);
    
    // Build top 5 subjects HTML
    let top5HTML = '';
    
    if (top5Subjects.length === 0) {
        top5HTML = `
            <div class="breakdown-item" style="color: #dc2626;">
                <span class="breakdown-label">⚠️ No subjects with points</span>
                <span class="breakdown-value">0 pt</span>
            </div>
        `;
    } else {
        top5Subjects.forEach((subject, index) => {
            top5HTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${index + 1}. ${subject.name} (${subject.grade})</span>
                    <span class="breakdown-value">${subject.points} pt</span>
                </div>
            `;
        });
    }
    
    // Build complete breakdown HTML
    const breakdownHTML = `
        <div class="breakdown-section">
            <div class="breakdown-item">
                <span class="breakdown-label">🎯 Course Applied</span>
                <span class="breakdown-value">${escapeHTML(course)}</span>
            </div>
            
            <div class="breakdown-item">
                <span class="breakdown-label">📝 JAMB Raw Score</span>
                <span class="breakdown-value">${jambScore}</span>
            </div>
            
            <div class="breakdown-item">
                <span class="breakdown-label">✖️ JAMB Points (× 0.15)</span>
                <span class="breakdown-value">${jambPoints.toFixed(2)}</span>
            </div>
            
            <div class="breakdown-divider">
                <strong>📚 Best 5 O'Level Subjects (by points):</strong>
            </div>
            
            ${top5HTML}
            
            <div class="breakdown-total">
                <span>TOTAL O'LEVEL POINTS</span>
                <span>${olevelTotal} pts</span>
            </div>
            
            <div class="breakdown-aggregate">
                <span>⭐ AGGREGATE SCORE</span>
                <span>${aggregate.toFixed(2)}%</span>
            </div>
            
            <div class="breakdown-summary">
                <p><strong>Formula:</strong> JAMB × 0.15 + Best 5 O'Level Points</p>
                <p><strong>Calculation:</strong> ${jambScore} × 0.15 + ${olevelTotal} = ${aggregate.toFixed(2)}%</p>
                <p><strong>Total subjects entered:</strong> ${totalEntered}</p>
                <p><strong>Subjects used:</strong> Best 5 of ${totalEntered} by grade points</p>
            </div>
        </div>
    `;
    
    DOM.breakdownContainer.innerHTML = breakdownHTML;
    
    // Add styles for breakdown
    addBreakdownStyles();
    
    // Scroll to result
    DOM.resultContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function addBreakdownStyles() {
    if (document.getElementById('breakdown-dynamic-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'breakdown-dynamic-styles';
    style.textContent = `
        .breakdown-section {
            padding: 0.5rem;
        }
        
        .breakdown-divider {
            margin-top: 1rem;
            padding-top: 0.8rem;
            border-top: 2px dashed #cbd5e1;
            font-size: 0.9rem;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        .breakdown-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.7rem 0;
            border-top: 2px solid #e2e8f0;
            font-weight: 700;
            color: #0a3d62;
            margin-top: 0.5rem;
        }
        
        .breakdown-aggregate {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 1rem;
            background: linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%);
            border-radius: 1rem;
            font-size: 1.1rem;
            font-weight: 800;
            color: #0a3d62;
            margin: 0.8rem 0;
            border: 2px solid #bfdbfe;
        }
        
        .breakdown-summary {
            margin-top: 1rem;
            padding: 0.8rem;
            background: #f8fafc;
            border-radius: 0.8rem;
            font-size: 0.8rem;
            color: #475569;
            line-height: 1.6;
        }
        
        .breakdown-summary p {
            margin-bottom: 0.3rem;
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
}

// =============================================
// NOTIFICATIONS
// =============================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close notification">✕</button>
    `;
    
    document.body.appendChild(notification);
    
    // Add notification styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: 1rem 1.5rem;
                border-radius: 1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                font-weight: 500;
                font-size: 0.9rem;
            }
            
            .notification-error {
                background: #fee2e2;
                color: #991b1b;
                border-left: 4px solid #dc2626;
            }
            
            .notification-warning {
                background: #fef3c7;
                color: #92400e;
                border-left: 4px solid #d97706;
            }
            
            .notification-info {
                background: #dbeafe;
                color: #1e40af;
                border-left: 4px solid #2563eb;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.2rem;
                color: inherit;
                padding: 0.2rem;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// =============================================
// EVENT LISTENERS
// =============================================
function initializeEventListeners() {
    // Add subject button
    DOM.addSubjectBtn.addEventListener('click', () => {
        addSubjectRow(true);
    });
    
    // Calculate button
    DOM.calculateBtn.addEventListener('click', calculateAggregate);
    
    // Subject container delegation for remove buttons and input changes
    DOM.subjectsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-subject-btn')) {
            removeSubjectRow(e.target);
        }
    });
    
    DOM.subjectsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('subject-name') || 
            e.target.classList.contains('subject-grade')) {
            updateSubjectCount();
        }
    });
    
    // Course input validation
    DOM.courseInput.addEventListener('input', () => {
        const course = DOM.courseInput.value.trim();
        if (course.length > 0) {
            DOM.courseHint.textContent = '✓ Course entered — now add your O\'Level subjects';
            DOM.courseHint.style.color = '#0f6b3a';
        } else {
            DOM.courseHint.textContent = 'Enter your exact course name — no automatic subject mapping';
            DOM.courseHint.style.color = '#64748b';
        }
    });
    
    // JAMB score validation
    DOM.jambScore.addEventListener('input', () => {
        const score = parseInt(DOM.jambScore.value);
        const hint = document.getElementById('jambHint');
        
        if (isNaN(score) || score < 0 || score > 400) {
            hint.textContent = 'Please enter a valid JAMB score (0-400)';
            hint.style.color = '#dc2626';
        } else {
            hint.textContent = `JAMB Points: ${(score * 0.15).toFixed(2)} (${score} × 0.15)`;
            hint.style.color = '#0f6b3a';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            calculateAggregate();
        }
        
        // Escape to close notifications
        if (e.key === 'Escape') {
            const notification = document.querySelector('.notification-toast');
            if (notification) {
                notification.remove();
            }
        }
    });
}

// =============================================
// INITIALIZATION
// =============================================
function initializeApp() {
    // Show disclaimer first
    showDisclaimer();
    
    // Create initial 5 subject rows
    for (let i = 0; i < MIN_SUBJECTS; i++) {
        const isRemovable = i >= MIN_SUBJECTS; // First 5 are not removable initially
        createInitialSubjectRow(isRemovable);
    }
    
    // Update UI
    updateSubjectCount();
    updateAddButtonState();
}

function createInitialSubjectRow(isRemovable) {
    const card = createSubjectCard(subjectCount, isRemovable);
    DOM.subjectsContainer.appendChild(card);
    subjectCount++;
}

// =============================================
// START THE APPLICATION
// =============================================
window.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clear any sensitive data if needed
    DOM.courseInput.value = '';
    DOM.jambScore.value = '';
    
    const subjectInputs = DOM.subjectsContainer.querySelectorAll('input');
    subjectInputs.forEach(input => {
        input.value = '';
    });
});