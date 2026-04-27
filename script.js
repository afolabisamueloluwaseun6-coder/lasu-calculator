// ============================================
// LASU Aggregate Calculator — LAMP EDTECH
// Developed by Afolabi Samuel Oluwaseun
// ============================================

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

let subjectCount = 0;

// =============================================
// COURSE DATA — Required subjects per course
// =============================================
const COURSE_SUBJECTS = {
    'Medicine & Surgery': ['English Language', 'Biology', 'Chemistry', 'Physics', 'Mathematics'],
    'Pharmacy': ['English Language', 'Biology', 'Chemistry', 'Physics', 'Mathematics'],
    'Nursing Science': ['English Language', 'Biology', 'Chemistry', 'Physics', 'Mathematics'],
    'Computer Science': ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Further Mathematics'],
    'Biochemistry': ['English Language', 'Biology', 'Chemistry', 'Physics', 'Mathematics'],
    'Microbiology': ['English Language', 'Biology', 'Chemistry', 'Physics', 'Mathematics'],
    'Physics': ['English Language', 'Physics', 'Mathematics', 'Chemistry', 'Further Mathematics'],
    'Chemistry': ['English Language', 'Chemistry', 'Mathematics', 'Physics', 'Biology'],
    'Mechanical Engineering': ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Further Mathematics'],
    'Electrical Engineering': ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Further Mathematics'],
    'Civil Engineering': ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Further Mathematics'],
    'Chemical Engineering': ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Further Mathematics'],
    'Law': ['English Language', 'Literature in English', 'Government', 'CRS', 'Economics'],
    'Accounting': ['English Language', 'Mathematics', 'Economics', 'Accounting', 'Commerce'],
    'Business Administration': ['English Language', 'Mathematics', 'Economics', 'Commerce', 'Government'],
    'Banking & Finance': ['English Language', 'Mathematics', 'Economics', 'Accounting', 'Commerce'],
    'Marketing': ['English Language', 'Mathematics', 'Economics', 'Commerce', 'Government'],
    'Mass Communication': ['English Language', 'Literature in English', 'Government', 'CRS', 'Economics'],
    'Political Science': ['English Language', 'Government', 'History', 'CRS', 'Economics'],
    'Sociology': ['English Language', 'Government', 'Economics', 'Geography', 'CRS'],
    'Economics': ['English Language', 'Mathematics', 'Economics', 'Government', 'Geography'],
    'English & Literary Studies': ['English Language', 'Literature in English', 'Government', 'CRS', 'History']
};

// Default subjects for courses not in the list
const DEFAULT_SUBJECTS = ['English Language', 'Mathematics', 'Economics', 'Government', 'Biology'];

// =============================================
// DISCLAIMER MODAL
// =============================================
function showDisclaimer() {
    // Check if disclaimer has been shown before in this session
    if (sessionStorage.getItem('lasuDisclaimerShown')) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'disclaimer-overlay';
    overlay.id = 'disclaimerOverlay';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'disclaimer-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'disclaimerTitle');

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
            <button class="disclaimer-btn-primary" onclick="acceptDisclaimer()">
                <i class="fas fa-check-circle"></i> I Understand, Proceed
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
    });

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Trap focus inside modal
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

function acceptDisclaimer() {
    const overlay = document.getElementById('disclaimerOverlay');
    
    // Animate out
    overlay.classList.remove('active');
    const modal = overlay.querySelector('.disclaimer-modal');
    modal.classList.remove('active');

    // Remove after animation
    setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        
        // Store in session storage
        sessionStorage.setItem('lasuDisclaimerShown', 'true');
    }, 400);
}

// =============================================
// INITIALIZATION
// =============================================
function init() {
    // Show disclaimer first
    showDisclaimer();
    
    // Create subject rows
    for (let i = 0; i < MIN_SUBJECTS; i++) {
        addSubjectRow(false);
    }
    updateSubjectCount();
    updateAddButtonState();
}

// =============================================
// COURSE HANDLING
// =============================================
function handleCourseChange() {
    const select = document.getElementById('courseSelect');
    const manualInput = document.getElementById('courseManual');
    const hint = document.getElementById('courseHint');

    if (select.value === '__other__') {
        manualInput.classList.add('active');
        manualInput.focus();
        hint.textContent = 'Please type your course name above';
    } else if (select.value) {
        manualInput.classList.remove('active');
        manualInput.value = '';
        const subjects = COURSE_SUBJECTS[select.value];
        if (subjects) {
            hint.innerHTML = `📌 Required subjects: <strong>${subjects.join(', ')}</strong>`;
        } else {
            hint.textContent = '';
        }
    } else {
        manualInput.classList.remove('active');
        hint.textContent = '';
    }
    updateSubjectCount();
}

function handleManualCourseFocus() {
    const select = document.getElementById('courseSelect');
    const manualInput = document.getElementById('courseManual');
    if (!manualInput.classList.contains('active')) {
        select.value = '__other__';
        manualInput.classList.add('active');
        document.getElementById('courseHint').textContent = 'Please type your course name above';
        handleCourseChange();
    }
}

function handleManualCourseInput() {
    const manualInput = document.getElementById('courseManual');
    if (manualInput.value.trim()) {
        document.getElementById('courseHint').textContent = '📝 Custom course — ensure you enter relevant subjects';
    }
}

// =============================================
// GET SELECTED COURSE NAME
// =============================================
function getSelectedCourse() {
    const select = document.getElementById('courseSelect');
    const manualInput = document.getElementById('courseManual');

    if (select.value === '__other__' && manualInput.value.trim()) {
        return manualInput.value.trim();
    }
    return select.value;
}

// =============================================
// GET RELEVANT SUBJECTS FOR COURSE
// =============================================
function getRelevantSubjects(courseName) {
    if (COURSE_SUBJECTS[courseName]) {
        return COURSE_SUBJECTS[courseName];
    }

    const lowerCourse = courseName.toLowerCase();
    for (const [key, value] of Object.entries(COURSE_SUBJECTS)) {
        if (key.toLowerCase().includes(lowerCourse) || lowerCourse.includes(key.toLowerCase())) {
            return value;
        }
    }
    return DEFAULT_SUBJECTS;
}

// =============================================
// SUBJECT ROW MANAGEMENT
// =============================================
function addSubjectRow(isRemovable = true) {
    if (subjectCount >= MAX_SUBJECTS) {
        alert('Maximum 9 subjects allowed.');
        return;
    }

    const container = document.getElementById('subjectsContainer');
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('data-subject-index', subjectCount);

    let removeBtnHTML = '';
    if (isRemovable) {
        removeBtnHTML = `<button type="button" class="remove-subject-btn" onclick="removeSubjectRow(this)">✕ Remove</button>`;
    }

    card.innerHTML = `
        <input 
            type="text" 
            class="subject-name" 
            placeholder="e.g., English Language" 
            autocomplete="off"
            aria-label="Subject Name"
        >
        <select class="subject-grade" aria-label="Subject Grade">
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
        ${removeBtnHTML}
    `;

    container.appendChild(card);
    subjectCount++;
    updateSubjectCount();
    updateAddButtonState();
}

function removeSubjectRow(button) {
    const totalRows = document.querySelectorAll('.subject-card').length;
    if (totalRows <= MIN_SUBJECTS) {
        alert('Minimum 5 subjects are required.');
        return;
    }

    const card = button.closest('.subject-card');
    card.remove();
    subjectCount--;
    updateSubjectCount();
    updateAddButtonState();
}

function updateSubjectCount() {
    const countEl = document.getElementById('subjectCount');
    const filledCount = getFilledSubjectCount();
    countEl.textContent = `${filledCount} subject(s) filled (minimum ${MIN_SUBJECTS} required)`;

    if (filledCount >= MIN_SUBJECTS) {
        countEl.classList.add('valid');
    } else {
        countEl.classList.remove('valid');
    }
}

function getFilledSubjectCount() {
    const names = document.querySelectorAll('.subject-name');
    const grades = document.querySelectorAll('.subject-grade');
    let count = 0;
    for (let i = 0; i < names.length; i++) {
        if (names[i].value.trim() && grades[i].value) {
            count++;
        }
    }
    return count;
}

function updateAddButtonState() {
    const btn = document.getElementById('addSubjectBtn');
    if (subjectCount >= MAX_SUBJECTS) {
        btn.disabled = true;
        btn.textContent = '🚫 Maximum 9 Subjects Reached';
    } else {
        btn.disabled = false;
        btn.textContent = '➕ Add Another Subject';
    }
}

// =============================================
// COLLECT ALL SUBJECT DATA
// =============================================
function collectSubjectData() {
    const names = document.querySelectorAll('.subject-name');
    const grades = document.querySelectorAll('.subject-grade');
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
// NORMALIZE SUBJECT NAME FOR MATCHING
// =============================================
function normalizeSubjectName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// =============================================
// CHECK IF A SUBJECT MATCHES RELEVANT LIST
// =============================================
function isRelevantSubject(studentSubject, relevantList) {
    const normStudent = normalizeSubjectName(studentSubject);

    for (const relevant of relevantList) {
        const normRelevant = normalizeSubjectName(relevant);

        if (normStudent === normRelevant) return true;
        if (normStudent.includes(normRelevant) || normRelevant.includes(normStudent)) return true;

        // Handle common abbreviations
        if ((normStudent === 'maths' || normStudent === 'math') && normRelevant === 'mathematics') return true;
        if (normStudent === 'eng' && normRelevant === 'english language') return true;
        if (normStudent === 'lit in eng' && normRelevant === 'literature in english') return true;
        if (normStudent.includes('literature') && normRelevant.includes('literature')) return true;
        if (normStudent === 'further maths' && normRelevant === 'further mathematics') return true;
        if ((normStudent === 'crs' || normStudent === 'irs' || normStudent.includes('christian') || normStudent.includes('islamic')) && normRelevant === 'crs') return true;
    }
    return false;
}

// =============================================
// MAIN CALCULATION FUNCTION
// =============================================
function calculateAggregate() {
    const course = getSelectedCourse();
    if (!course) {
        alert('⚠️ Please select or type your course.');
        document.getElementById('courseSelect').focus();
        return;
    }

    const jambScoreInput = document.getElementById('jambScore');
    const jambScore = parseInt(jambScoreInput.value);
    if (isNaN(jambScore) || jambScore < 0 || jambScore > 400) {
        alert('⚠️ Please enter a valid JAMB score between 0 and 400.');
        jambScoreInput.focus();
        return;
    }

    const allSubjects = collectSubjectData();
    if (allSubjects.length < MIN_SUBJECTS) {
        alert(`⚠️ Please enter at least ${MIN_SUBJECTS} subjects with grades.`);
        return;
    }

    const relevantSubjects = getRelevantSubjects(course);

    const relevantList = [];
    const irrelevantList = [];

    allSubjects.forEach(subject => {
        if (isRelevantSubject(subject.name, relevantSubjects)) {
            relevantList.push(subject);
        } else {
            irrelevantList.push(subject);
        }
    });

    relevantList.sort((a, b) => b.points - a.points);

    const top5 = relevantList.slice(0, 5);
    const olevelTotal = top5.reduce((sum, s) => sum + s.points, 0);

    const jambPoints = jambScore * 0.15;
    const aggregate = jambPoints + olevelTotal;

    displayResult(jambScore, jambPoints, top5, olevelTotal, aggregate, relevantSubjects, allSubjects, relevantList.length);
}

// =============================================
// DISPLAY RESULT
// =============================================
function displayResult(jambScore, jambPoints, top5Subjects, olevelTotal, aggregate, relevantSubjectNames, allSubjects, totalRelevantFound) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.add('show');

    document.getElementById('aggregateScore').textContent = aggregate.toFixed(2) + '%';

    let top5HTML = '';
    if (top5Subjects.length === 0) {
        top5HTML = `
            <div class="breakdown-item" style="color: #dc2626;">
                <span class="breakdown-label">⚠️ No relevant subjects found</span>
                <span class="breakdown-value">0 pt</span>
            </div>
        `;
    } else {
        top5Subjects.forEach((s, index) => {
            top5HTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${index + 1}. ${s.name} (${s.grade})</span>
                    <span class="breakdown-value">${s.points} pt</span>
                </div>
            `;
        });
    }

    const breakdownHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">🎯 Course</span>
            <span class="breakdown-value">${getSelectedCourse()}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">📝 JAMB Raw Score</span>
            <span class="breakdown-value">${jambScore}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">✖️ JAMB Points (×0.15)</span>
            <span class="breakdown-value">${jambPoints.toFixed(2)}</span>
        </div>
        <div style="margin-top: 15px; padding-top: 10px; border-top: 2px dashed #cbd5e1;">
            <strong style="font-size:0.9rem; color:#1e293b;">📚 Best 5 Relevant O'Level Subjects:</strong>
        </div>
        ${top5HTML}
        <div class="breakdown-item" style="font-weight: 800; font-size: 1.1rem; color: #0a3d62; margin-top: 10px; border-top: 2px solid #e2e8f0;">
            <span>⭐ TOTAL AGGREGATE</span>
            <span>${aggregate.toFixed(2)}%</span>
        </div>
        <div class="relevant-subjects-list">
            <strong>📌 Relevant subjects for this course:</strong> ${relevantSubjectNames.join(', ')}<br>
            <strong>📊 Total relevant subjects found:</strong> ${totalRelevantFound} of ${allSubjects.length} entered<br>
            <strong>✅ Best 5 total:</strong> ${olevelTotal} O'Level points + ${jambPoints.toFixed(2)} JAMB points
        </div>
    `;

    document.getElementById('breakdownContainer').innerHTML = breakdownHTML;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// =============================================
// LISTEN FOR SUBJECT INPUT CHANGES
// =============================================
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('subject-name') || e.target.classList.contains('subject-grade')) {
        updateSubjectCount();
    }
});

// =============================================
// START THE APP
// =============================================
window.onload = init;