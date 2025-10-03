let currentRole = null;
let gradeDistributionChart, progressComparisonChart, aiVsManualChart, aiEfficiencyChart, gradeTrendChart, rubricScoreChart, adminSystemLoadChart;

const ROLES = {
    'lecturer': {
        name: 'Giảng viên', icon: 'bi-person-workspace', routes: [
            { id: 'l_grading', title: 'Chấm & Quản lý Bài thi', icon: 'bi-file-text' },
            { id: 'l_plagiarism', title: 'Kiểm tra Đạo văn', icon: 'bi-patch-check' },
            { id: 'l_reports', title: 'Báo cáo Thống kê', icon: 'bi-bar-chart-line' },
        ]
    },
    'student': {
        name: 'Sinh viên', icon: 'bi-person', routes: [
            { id: 's_submission', title: 'Nộp Bài thi', icon: 'bi-upload' },
            { id: 's_history', title: 'Lịch sử Bài làm', icon: 'bi-clock-history' },
            { id: 's_reports', title: 'Báo cáo Học tập', icon: 'bi-file-bar-chart' },
        ]
    },
    'admin': {
        name: 'Quản trị viên', icon: 'bi-gear', routes: [
            { id: 'a_users', title: 'Quản lý Tài khoản', icon: 'bi-people' },
            { id: 'a_system', title: 'Giám sát Hệ thống', icon: 'bi-activity' },
        ]
    }
};

const DEMO_STUDENT_ID = "S.SV105";

// Mảng dữ liệu giả lập cho danh sách bài thi
let examData = [
    { id: 1, studentId: 'SV101', name: 'Nguyễn Văn A', score: 'N/A', plagiarism: 'N/A', status: 'Pending', feedback: 'Chưa chấm' },
    { id: 2, studentId: 'SV102', name: 'Trần Thị B', score: 'N/A', plagiarism: 'N/A', status: 'Pending', feedback: 'Chưa chấm' },
    { id: 3, studentId: 'SV103', name: 'Lê Văn C', score: '8.5', plagiarism: '12%', status: 'Graded', feedback: 'Đã gửi' },
    { id: 4, studentId: 'SV104', name: 'Phạm Thị D', score: '6.2', plagiarism: '35%', status: 'Graded', feedback: 'Chưa gửi' },
];


// ------------------ UTILITIES ------------------

function showToast(message, type = 'success') {
    const toastElement = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toast-message');

    toastElement.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function clearCharts() {
    if (gradeDistributionChart) gradeDistributionChart.destroy();
    if (progressComparisonChart) progressComparisonChart.destroy();
    if (aiVsManualChart) aiVsManualChart.destroy();
    if (aiEfficiencyChart) aiEfficiencyChart.destroy();
    if (gradeTrendChart) gradeTrendChart.destroy();
    if (rubricScoreChart) rubricScoreChart.destroy();
    if (adminSystemLoadChart) adminSystemLoadChart.destroy();
}

// ------------------ AUTHENTICATION LOGIC ------------------

function login() {
    const role = document.getElementById('roleSelect').value;
    const username = document.getElementById('username').value;

    if (!username) {
        showToast('Vui lòng nhập tên đăng nhập.', 'danger');
        return;
    }

    currentRole = role;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex'; // Use flex for layout

    const userInfo = (role === 'lecturer') ? 'Giảng viên L.GV001' :
        (role === 'student') ? `Sinh viên ${DEMO_STUDENT_ID}` :
            'Quản trị viên A.ADM01';

    document.getElementById('userRoleDisplay').textContent = `Vai trò: ${ROLES[role].name}`;
    document.getElementById('current-user-info').textContent = `Xin chào, ${userInfo}`;

    loadDashboard();
    showToast(`Đăng nhập thành công với vai trò: ${ROLES[role].name}`, 'primary');
}

function logout() {
    currentRole = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
    clearCharts();
    // Reset demo data for next login
    examData = [
        { id: 1, studentId: 'SV101', name: 'Nguyễn Văn A', score: 'N/A', plagiarism: 'N/A', status: 'Pending', feedback: 'Chưa chấm' },
        { id: 2, studentId: 'SV102', name: 'Trần Thị B', score: 'N/A', plagiarism: 'N/A', status: 'Pending', feedback: 'Chưa chấm' },
        { id: 3, studentId: 'SV103', name: 'Lê Văn C', score: '8.5', plagiarism: '12%', status: 'Graded', feedback: 'Đã gửi' },
        { id: 4, studentId: 'SV104', name: 'Phạm Thị D', score: '6.2', plagiarism: '35%', status: 'Graded', feedback: 'Chưa gửi' },
    ];
    showToast('Đã đăng xuất khỏi hệ thống.', 'secondary');
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    login();
});

// ------------------ DASHBOARD RENDERING ------------------

function loadDashboard() {
    if (!currentRole) return;

    const routes = ROLES[currentRole].routes;
    const sidebarNav = document.getElementById('dashboardSidebarNav');
    const tabContent = document.getElementById('dashboardTabsContent');

    sidebarNav.innerHTML = '';
    tabContent.innerHTML = '';

    routes.forEach((route, index) => {
        const isActive = index === 0;

        // Add Sidebar Link
        sidebarNav.innerHTML += `
    <li class="nav-item">
        <button class="nav-link ${isActive ? 'active' : ''}"
            id="${route.id}-tab" data-bs-toggle="pill"
            data-bs-target="#${route.id}-content" type="button"
            role="tab" aria-controls="${route.id}-content"
            aria-selected="${isActive}">
            <i class="bi ${route.icon} me-2"></i> ${route.title}
        </button>
    </li>
    `;

        // Add Tab Content
        tabContent.innerHTML += `
    <div class="tab-pane fade ${isActive ? 'show active' : ''}"
        id="${route.id}-content" role="tabpanel"
        aria-labelledby="${route.id}-tab">
    </div>
    `;
    });

    // Load content for all tabs
    routes.forEach(route => {
        const contentDiv = document.getElementById(`${route.id}-content`);
        contentDiv.innerHTML = generateContent(route.id);
    });

    // Set initial title and initialize first chart
    document.getElementById('current-title').textContent = routes[0].title;
    initializeCharts(routes[0].id);

    // Add event listener for tab switching to handle title and charts
    const tabEl = document.getElementById('dashboardSidebarNav');
    tabEl.addEventListener('shown.bs.tab', event => {
        const targetId = event.target.getAttribute('data-bs-target').substring(1).replace('-content', '');
        document.getElementById('current-title').textContent = event.target.textContent.trim();
        initializeCharts(targetId);
    });
}

function generateExamTable() {
    let tableRows = '';
    examData.forEach(item => {
        const scoreDisplay = item.status === 'Graded' ?
            `<span class="fw-bold text-${item.score >= 7 ? 'success' : 'warning'}">${item.score} / 10</span>` :
            `<span class="badge bg-secondary">${item.status}</span>`;
        const plagiarismDisplay = item.status === 'Graded' ?
            `<span class="text-${parseFloat(item.plagiarism) > 30 ? 'danger' : 'success'} fw-bold">${item.plagiarism}</span>` : 'N/A';
        const feedbackDisplay = item.feedback === 'Đã gửi' ?
            `<span class="badge bg-success">${item.feedback}</span>` :
            `<span class="badge bg-secondary">${item.feedback}</span>`;
        const actionButton = item.status === 'Graded' ?
            `<button class="btn btn-sm btn-info text-white view-details-btn"
        data-student-name="${item.name}"
        data-score="${item.score}"
        data-plagiarism="${item.plagiarism}"><i class="bi bi-eye"></i> Chi tiết</button>` :
            `<button class="btn btn-sm btn-light text-muted" disabled><i class="bi bi-slash-circle"></i> Chưa chấm</button>`;

        tableRows += `
    <tr data-id="${item.id}" data-score="${item.score}" data-plagiarism="${item.plagiarism}" data-student-name="${item.name}">
        <td>${item.studentId}</td>
        <td>${item.name}</td>
        <td>${scoreDisplay}</td>
        <td>${plagiarismDisplay}</td>
        <td>${feedbackDisplay}</td>
        <td>${actionButton}</td>
    </tr>
    `;
    });

    return `
    <table class="table table-hover table-striped small" id="examTable">
        <thead>
            <tr>
                <th>Mã SV</th>
                <th>Tên Sinh viên</th>
                <th>Điểm AI</th>
                <th>Đạo văn (%)</th>
                <th>Phản hồi</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `;
}

function generateContent(viewId) {
    // --- Content Generation by Role/View ---

    if (currentRole === 'lecturer') {
        if (viewId === 'l_grading') {
            // Lecturer: Grading & Exam Management
            return `
    <h4 class="text-primary mb-4 border-bottom pb-2">Chấm & Quản lý Bài thi (Môn: Nhập môn AI - K20)</h4>
    <p class="text-muted small">Quản lý danh sách bài thi tự luận, xem kết quả chấm điểm AI và phản hồi nhanh tới sinh viên.</p>
    <div class="d-flex justify-content-between mb-3">
        <div>
            <input type="text" class="form-control form-control-sm w-50" placeholder="Tìm kiếm theo Mã SV/Tên bài thi...">
        </div>
        <div>
            <button class="btn btn-success me-2" id="autoGradeBtn" onclick="startAutomatedGrading()">
                <i class="bi bi-robot me-1"></i> Chấm điểm Tự động (AI)
            </button>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#uploadModal">
                <i class="bi bi-cloud-arrow-up me-1"></i> Tải Bài làm Mới
            </button>
        </div>
    </div>
    <div class="card shadow-sm">
        <div class="card-body">
            ${generateExamTable()}
            <button class="btn btn-outline-danger btn-sm me-2 mt-2" onclick="showToast('Đã tải Báo cáo Tổng hợp (PDF).', 'danger')"><i class="bi bi-file-earmark-pdf me-1"></i> Tải Báo cáo Tổng</button>
        </div>
    </div>
    `;
        } else if (viewId === 'l_create_assignment') {
            // Lecturer: Create Assignment
            return `
    <h4 class="text-primary mb-4 border-bottom pb-2">Tạo Bài tập Mới & Thiết lập Rubric</h4>
    <p class="text-muted small">Thiết lập chi tiết bài tập/khóa luận, gán cho lớp môn, và định nghĩa tiêu chí chấm điểm tự động.</p>
    <div class="card shadow-sm p-4">
        <form id="createAssignmentForm">
            <div class="mb-3">
                <label for="assignmentTitle" class="form-label fw-bold">1. Tên Bài tập</label>
                <input type="text" class="form-control" id="assignmentTitle" value="Phân tích mô hình học sâu RNN" required>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="assignmentCourse" class="form-label fw-bold">2. Gán cho Lớp môn</label>
                    <select class="form-select" id="assignmentCourse" required>
                        <option selected>Nhập môn AI (K20)</option>
                        <option>Lập trình Web (K21)</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="assignmentDeadline" class="form-label fw-bold">3. Hạn chót Nộp bài</label>
                    <input type="datetime-local" class="form-control" id="assignmentDeadline" value="2025-10-15T23:59" required>
                </div>
            </div>
            <div class="mb-4">
                <label for="assignmentInstruction" class="form-label fw-bold">4. Mô tả/Yêu cầu Bài tập</label>
                <textarea class="form-control" id="assignmentInstruction" rows="4" placeholder="Nhập yêu cầu chi tiết của bài tập, định dạng nộp, v.v."></textarea>
            </div>

            <h5 class="mt-4 border-bottom pb-2">5. Tiêu chí Chấm điểm Tự động (Rubric AI)</h5>
            <div id="rubricCriteria" class="mb-4">
                <div class="row mb-2">
                    <div class="col-8"><input type="text" class="form-control form-control-sm" value="Tính Logic và Chính xác Kỹ thuật" placeholder="Tên tiêu chí"></div>
                    <div class="col-3"><input type="number" class="form-control form-control-sm" value="40" placeholder="Trọng số (%)"></div>
                    <div class="col-1 text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeRubric(this)"><i class="bi bi-x"></i></button></div>
                </div>
                <div class="row mb-2">
                    <div class="col-8"><input type="text" class="form-control form-control-sm" value="Cấu trúc và Ngôn ngữ Trình bày" placeholder="Tên tiêu chí"></div>
                    <div class="col-3"><input type="number" class="form-control form-control-sm" value="30" placeholder="Trọng số (%)"></div>
                    <div class="col-1 text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeRubric(this)"><i class="bi bi-x"></i></button></div>
                </div>
                <div class="row mb-2">
                    <div class="col-8"><input type="text" class="form-control form-control-sm" value="Tham khảo và Liêm chính Học thuật (Đạo văn)" placeholder="Tên tiêu chí"></div>
                    <div class="col-3"><input type="number" class="form-control form-control-sm" value="30" placeholder="Trọng số (%)"></div>
                    <div class="col-1 text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeRubric(this)"><i class="bi bi-x"></i></button></div>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-success mb-4" onclick="addRubricCriteria()"><i class="bi bi-plus-circle me-1"></i> Thêm Tiêu chí</button>
            <div class="d-grid">
                <button type="submit" class="btn btn-primary btn-lg" onclick="handleCreateAssignment(event)"><i class="bi bi-save me-2"></i> Lưu & Giao Bài tập</button>
            </div>
        </form>
    </div>
    `;
        } else if (viewId === 'l_notifications') {
            // Lecturer: Send Notifications
            return `
    <h4 class="text-primary mb-4 border-bottom pb-2">Gửi Thông báo Đẩy cho Sinh viên</h4>
    <p class="text-muted small">Gửi thông báo quan trọng về bài tập, điểm số hoặc cảnh báo đến toàn bộ lớp môn hoặc nhóm sinh viên cụ thể.</p>
    <div class="card shadow-sm p-4">
        <form id="sendNotificationForm">
            <div class="mb-3">
                <label for="notificationTarget" class="form-label fw-bold">1. Đối tượng Nhận</label>
                <select class="form-select" id="notificationTarget" required>
                    <option selected>Toàn bộ Sinh viên (Nhập môn AI - K20)</option>
                    <option>Toàn bộ Sinh viên (Lập trình Web - K21)</option>
                    <option>Chỉ Sinh viên có Điểm Dưới 5.0 (AI - K20)</option>
                    <option>Tất cả Sinh viên</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="notificationType" class="form-label fw-bold">2. Phân loại Thông báo</label>
                <select class="form-select" id="notificationType" required>
                    <option value="deadline">Nhắc nhở Hạn chót</option>
                    <option value="feedback" selected>Phản hồi/Điểm số mới</option>
                    <option value="alert">Cảnh báo Quan trọng</option>
                    <option value="general">Thông báo Chung</option>
                </select>
            </div>
            <div class="mb-4">
                <label for="notificationMessage" class="form-label fw-bold">3. Nội dung Thông báo (Ngắn)</label>
                <textarea class="form-control" id="notificationMessage" rows="3" placeholder="Ví dụ: Bài tập Phân tích mô hình học sâu sắp hết hạn nộp vào 23:59 ngày 15/10/2025."></textarea>
            </div>
            <div class="d-grid">
                <button type="submit" class="btn btn-warning btn-lg fw-bold" onclick="handleSendNotification(event)"><i class="bi bi-send me-2"></i> Gửi Thông báo Đẩy</button>
            </div>
        </form>
    </div>
    `;
        }
        else if (viewId === 'l_plagiarism') {
            // Lecturer: Plagiarism Check
            return `
    <h4 class="text-primary mb-4 border-bottom pb-2">Kiểm tra Đạo văn & Liêm chính Học thuật</h4>
    <p class="text-muted small">Kiểm tra tính trùng lặp của bài luận, bài tập môn học hoặc khóa luận tốt nghiệp dựa trên kho dữ liệu nội bộ và công khai.</p>
    <div class="card shadow-sm p-4">
        <!-- Input Section -->
        <div class="mb-3">
            <label for="plagiarismFile" class="form-label fw-bold">Tải lên file (.doc, .docx, .pdf, .txt)</label>
            <input type="file" class="form-control" id="plagiarismFile" accept=".doc,.docx,.pdf,.txt">
                <div class="form-text">Hệ thống sẽ tự động đọc nội dung file và hiển thị bên dưới để kiểm tra.</div>
        </div>
        <textarea id="plagiarismInput" class="form-control mb-3" rows="10" placeholder="Dán nội dung hoặc tải file để kiểm tra... (Tối thiểu 100 ký tự)">Trí tuệ nhân tạo đang thay đổi cách chúng ta học tập và làm việc. Việc áp dụng các thuật toán máy học vào hệ thống đánh giá tự động như HouScore-AI giúp tăng tính khách quan và giảm gánh nặng cho giảng viên. Tuy nhiên, thách thức lớn nhất là đảm bảo tính minh bạch và độ chính xác của mô hình, đặc biệt là trong việc phân tích ngữ nghĩa phức tạp của các bài tự luận. Công cụ này cần được đào tạo trên bộ dữ liệu lớn và đa dạng để tránh các sai lệch về mặt chủng tộc hoặc giới tính.</textarea>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <select class="form-select w-30 small" id="plagiarismType">
                <option selected>Bài luận môn học</option>
                <option>Bài tập cá nhân</option>
                <option>Khóa luận Tốt nghiệp</option>
                <option>Báo cáo Nghiên cứu</option>
            </select>
            <button class="btn btn-warning fw-bold" onclick="checkPlagiarism()">
                <i class="bi bi-search me-2"></i> Kích hoạt Kiểm tra Đạo văn
            </button>
        </div>
        <!-- Output Section -->
        <div id="plagiarismResult" class="mt-4 border p-3 rounded bg-white" style="min-height: 150px; display: none;">
            <div class="text-center p-5" id="plagiarismLoader"></div>
        </div>

        <!-- Output Section -->
        <div id="plagiarismResult" class="mt-4 border p-3 rounded bg-white" style="min-height: 150px; display: none;">
            <div class="text-center p-5" id="plagiarismLoader"></div>
        </div>
    </div>
    `;
        }
        else if (viewId === 'l_classes') {
            // Lecturer: Class Management 
            return `
    <h4 class="text-primary mb-4 border-bottom pb-2">Quản lý Lớp Môn và Danh sách Sinh viên</h4>
    <p class="text-muted small">Xem danh sách các lớp môn giảng viên đang phụ trách. Quản lý sinh viên và gán quyền chấm bài.</p>
    <div class="row g-4">
        <div class="col-md-6">
            <div class="card shadow-sm info-card">
                <div class="card-header fw-bold bg-primary text-white">Nhập môn AI (K20)</div>
                <div class="card-body">
                    <p class="mb-1 small">Mã môn: AI101</p>
                    <p class="mb-1 small">Số lượng SV: 65</p>
                    <p class="mb-3 small">Học kỳ: 2024 - 2025/1</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="showStudentList('AI101')"><i class="bi bi-person-lines-fill me-1"></i> Danh sách Sinh viên</button>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card shadow-sm info-card">
                <div class="card-header fw-bold bg-secondary text-white">Lập trình Web (K21)</div>
                <div class="card-body">
                    <p class="mb-1 small">Mã môn: WEB202</p>
                    <p class="mb-1 small">Số lượng SV: 42</p>
                    <p class="mb-3 small">Học kỳ: 2024 - 2025/1</p>
                    <button class="btn btn-sm btn-outline-secondary" onclick="showStudentList('WEB202')"><i class="bi bi-person-lines-fill me-1"></i> Danh sách Sinh viên</button>
                </div>
            </div>
        </div>
    </div>
    `;
        } else if (viewId === 'l_reports') {
            // Lecturer: Statistical Reports
            return `
    <h4 class="text-primary mb-4 border-bottom pb-2">Báo cáo Thống kê & Phân tích Điểm</h4>
    <p class="text-muted small">Phân tích chuyên sâu về hiệu suất của các lớp môn học và đánh giá độ chính xác của AI Engine.</p>
    <div class="card shadow-sm mb-4">
        <div class="card-header fw-bold">1. Phân phối Điểm theo Lớp (So sánh)</div>
        <div class="card-body">
            <div style="height: 350px;">
                <canvas id="gradeDistributionChart"></canvas>
            </div>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">2. Hiệu suất Chấm điểm Tự động (AI vs. Thủ công)</div>
                <div class="card-body">
                    <div style="height: 300px;">
                        <canvas id="aiVsManualChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">3. Hiệu quả Xử lý của AI Engine (Hàng tháng)</div>
                <div class="card-body">
                    <div style="height: 300px;">
                        <canvas id="aiEfficiencyChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
        }
    } else if (currentRole === 'student') {
        if (viewId === 's_progress') {
            // Student: Personalized Learning Roadmap & Progress
            return `
    <h4 class="text-success mb-4 border-bottom pb-2">Lộ trình Cá nhân hóa & Phân tích Kỹ năng</h4>
    <p class="text-muted small">Theo dõi tiến độ hoàn thành các mục tiêu học tập và **lộ trình cá nhân hóa dựa trên điểm mạnh/yếu** được AI phân tích.</p>
    <div class="row g-4">
        <div class="col-md-5">
            <div class="card shadow-sm h-100 bg-light">
                <div class="card-header fw-bold bg-success text-white">LỘ TRÌNH GỢI Ý (Đến Hết Học kỳ)</div>
                <div class="card-body progress-timeline">
                    <div class="timeline-item">
                        <h6 class="fw-bold text-success">Hoàn thành Cấu trúc Dữ liệu</h6>
                        <p class="small text-muted mb-0"><i class="bi bi-check-circle-fill me-1"></i> Đã hoàn thành (Điểm TB: 8.5). **Mục tiêu tiếp theo: Phân tích.**</p>
                    </div>
                    <div class="timeline-item">
                        <h6 class="fw-bold text-warning">Tăng cường Kỹ năng Phân tích (Môn AI101)</h6>
                        <p class="small text-muted mb-0"><i class="bi bi-clock-fill me-1"></i> Đang tiến hành. AI gợi ý: Hoàn thành bài tập ứng dụng số 3 để tăng cường 10% kỹ năng phân tích.</p>
                        <div class="alert alert-warning p-1 mt-1 small" role="alert">
                            **Gợi ý AI:** Tham khảo bài giảng bổ sung về **"Hồi quy Logistic"**.
                        </div>
                    </div>
                    <div class="timeline-item" style="opacity: 0.7;">
                        <h6 class="fw-bold text-secondary">Mục tiêu Kỹ năng: Logic Lập trình Nâng cao</h6>
                        <p class="small text-muted mb-0"><i class="bi bi-arrow-right-circle-fill me-1"></i> Dự kiến Bắt đầu: 11/2025 (Sau khi hoàn thành Bài tập 3).</p>
                    </div>
                    <span class="badge bg-success position-absolute top-0 start-0 translate-middle-x ms-3 mt-3">PLR STATUS</span>
                </div>
            </div>
        </div>
        <div class="col-md-7">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">Phân tích Kỹ năng Chuyên sâu (Môn AI101)</div>
                <div class="card-body">
                    <div style="height: 350px;">
                        <canvas id="progressComparisonChart"></canvas>
                    </div>
                    <p class="small text-center text-muted mt-2">So sánh điểm kỹ năng cá nhân với điểm trung bình lớp. **Điểm yếu nhất: Cấu trúc (7.5)**</p>
                    <div class="alert alert-info p-2 mt-2 small" role="alert">
                        **Hành động Đề xuất:** AI nhận thấy kỹ năng **Cấu trúc** yếu hơn, đề xuất xem lại mẫu báo cáo chuẩn của khoa và áp dụng trong Bài tập 3.
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
        } else if (viewId === 's_notifications') {
            // Student: Notifications Center
            return `
    <h4 class="text-success mb-4 border-bottom pb-2">Hộp Thông báo Đẩy (Push Notifications)</h4>
    <p class="text-muted small">Quản lý các thông báo quan trọng về hạn chót, điểm số và phản hồi chi tiết từ Giảng viên/Hệ thống AI.</p>
    <div class="card shadow-sm">
        <ul class="list-group list-group-flush" id="notificationList">
            <li class="list-group-item d-flex justify-content-between align-items-center bg-info-subtle">
                <div>
                    <span class="badge bg-danger me-2">DEADLINE</span>
                    <span class="fw-bold">Hạn chót Bài tập Phân tích mô hình học sâu sắp hết hạn (15/10).</span>
                </div>
                <span class="text-muted small">Hệ thống AI - 5 phút trước</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-success me-2">FEEDBACK</span>
                    <span class="fw-bold">Bài thi cuối kỳ môn AI101 đã có điểm. Vui lòng kiểm tra mục Lịch sử Bài làm.</span>
                </div>
                <span class="text-muted small">Giảng viên L.GV001 - 1 giờ trước</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-warning text-dark me-2">CẢNH BÁO</span>
                    Tỷ lệ đạo văn trong Bài làm 1 vượt ngưỡng 30%. Vui lòng xem xét sửa đổi.
                </div>
                <span class="text-muted small">AI Engine - 1 ngày trước</span>
            </li>
        </ul>
    </div>
    <div class="d-grid mt-3">
        <button class="btn btn-outline-secondary btn-sm" onclick="showToast('Đã đánh dấu tất cả thông báo là đã đọc.', 'secondary')"><i class="bi bi-check-all me-1"></i> Đánh dấu Đã đọc</button>
    </div>
    `;
        }
        else if (viewId === 's_submission') {
            // Student: Exam Submission
            return `
    <h4 class="text-success mb-4 border-bottom pb-2">Nộp Bài thi Tự luận/Báo cáo</h4>
    <p class="text-muted small">Nộp bài thi khi có yêu cầu từ Giảng viên. Hệ thống HouScore-AI sẽ tự động chấm điểm và kiểm tra đạo văn.</p>
    <div class="card shadow-sm">
        <div class="card-header fw-bold">Bài thi/Bài tập đang chờ nộp</div>
        <div class="card-body">
            <ul class="list-group mb-3">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Phân tích mô hình học sâu RNN (AI101)
                    <span class="badge bg-danger">Hạn chót: 15/10/2025</span>
                </li>
            </ul>
            <h6 class="mt-4">Khu vực Nộp bài</h6>
            <div class="mb-3">
                <label for="fileSubmission" class="form-label small">Tải tệp Bài làm (.docx, .pdf)</label>
                <input class="form-control" type="file" id="fileSubmission" accept=".docx,.pdf,.txt">
            </div>
            <div class="d-grid">
                <button class="btn btn-success" onclick="handleStudentSubmission()"><i class="bi bi-check-circle me-1"></i> Xác nhận Nộp Bài</button>
            </div>
        </div>
    </div>
    `;
        } else if (viewId === 's_history') {
            // Student: Assignment History
            return `
    <h4 class="text-success mb-4 border-bottom pb-2">Lịch sử Bài làm & Phản hồi</h4>
    <p class="text-muted small">Danh sách các bài làm đã được chấm điểm và phản hồi chi tiết từ Giảng viên/AI Engine.</p>
    <div class="card shadow-sm">
        <div class="card-body">
            <table class="table table-hover table-striped small">
                <thead>
                    <tr>
                        <th>Môn học</th>
                        <th>Bài làm</th>
                        <th>Ngày nộp</th>
                        <th>Điểm AI</th>
                        <th>Phản hồi</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Nhập môn AI</td>
                        <td>Bài thi Tự luận cuối kỳ</td>
                        <td>15/12/2024</td>
                        <td class="fw-bold text-success">8.5</td>
                        <td><span class="badge bg-warning text-dark">Phản hồi Nhanh từ GV</span></td>
                        <td><button class="btn btn-sm btn-outline-info" onclick="viewStudentDetailedFeedback()">Xem chi tiết</button></td>
                    </tr>
                    <tr>
                        <td>Lập trình Web</td>
                        <td>Báo cáo giữa kỳ</td>
                        <td>20/10/2024</td>
                        <td class="fw-bold text-success">7.8</td>
                        <td><span class="badge bg-primary">Phản hồi AI Engine</span></td>
                        <td><button class="btn btn-sm btn-outline-info" onclick="viewStudentDetailedFeedback()">Xem chi tiết</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;
        } else if (viewId === 's_reports') {
            // Student: Personal Progress Report
            return `
    <h4 class="text-success mb-4 border-bottom pb-2">Báo cáo Thống kê Tình hình Học tập Cá nhân</h4>
    <p class="text-muted small">Phân tích sự tiến bộ của cá nhân theo thời gian (Điểm trung bình, Tỷ lệ đạo văn, Điểm kỹ năng).</p>
    <div class="row g-4">
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">Tiến bộ Điểm TB (3 Học kỳ)</div>
                <div class="card-body">
                    <canvas id="gradeTrendChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">Điểm số Theo Tiêu chí Rubric (Trung bình)</div>
                <div class="card-body">
                    <canvas id="rubricScoreChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    `;
        }
    } else if (currentRole === 'admin') {
        if (viewId === 'a_users') {
            // Admin: User Management
            return `
    <h4 class="text-danger mb-4 border-bottom pb-2">Quản lý Tài khoản & Phân quyền</h4>
    <p class="text-muted small">Quản lý tài khoản Giảng viên, Sinh viên, và Admin. Thiết lập quyền truy cập hệ thống.</p>
    <div class="d-flex justify-content-between mb-3">
        <input type="text" class="form-control form-control-sm w-25" placeholder="Tìm kiếm tài khoản...">
            <button class="btn btn-danger"><i class="bi bi-person-plus me-1"></i> Thêm Người dùng Mới</button>
    </div>
    <div class="card shadow-sm">
        <div class="card-body">
            <table class="table table-sm table-striped small">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>L.GV001</td>
                        <td>vuanh@hcmut.edu.vn</td>
                        <td><span class="badge bg-primary">Giảng viên</span></td>
                        <td><span class="badge bg-success">Active</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i> Sửa</button>
                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i> Xóa</button>
                        </td>
                    </tr>
                    <tr>
                        <td>S.SV105</td>
                        <td>lehoa@student.hcmut.edu.vn</td>
                        <td><span class="badge bg-success">Sinh viên</span></td>
                        <td><span class="badge bg-success">Active</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i> Sửa</button>
                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i> Xóa</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;
        } else if (viewId === 'a_system') {
            // Admin: System Monitoring
            return `
    <h4 class="text-danger mb-4 border-bottom pb-2">Giám sát Hoạt động & Hiệu năng Hệ thống</h4>
    <p class="text-muted small">Theo dõi hiệu năng của AI Engine và số lượng công việc được xử lý theo thời gian.</p>
    <div class="row g-4">
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">Tải Công việc Xử lý (Bài làm)</div>
                <div class="card-body">
                    <canvas id="adminSystemLoadChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header fw-bold">Các Chỉ số Hệ thống Chính</div>
                <div class="card-body">
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Thời gian xử lý TB (1 bài)
                            <span class="badge bg-primary">15 giây</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Tỷ lệ lỗi AI Engine
                            <span class="badge bg-success">0.1%</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Người dùng đang Online
                            <span class="badge bg-warning text-dark">55</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `;
        }
    }
    return `<div class="alert alert-info">Nội dung cho vai trò/trang này đang được phát triển.</div>`;
}

// ------------------ EVENT HANDLERS (Simulated Actions) ------------------

// Lecturer - Assignment Creation Helpers
function addRubricCriteria() {
    const rubricDiv = document.getElementById('rubricCriteria');
    const newCriteria = document.createElement('div');
    newCriteria.className = 'row mb-2';
    newCriteria.innerHTML = `
    <div class="col-8"><input type="text" class="form-control form-control-sm" placeholder="Tên tiêu chí" required></div>
    <div class="col-3"><input type="number" class="form-control form-control-sm" placeholder="Trọng số (%)" required></div>
    <div class="col-1 text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeRubric(this)"><i class="bi bi-x"></i></button></div>
    `;
    rubricDiv.appendChild(newCriteria);
}

function removeRubric(button) {
    button.closest('.row').remove();
}

function handleCreateAssignment(event) {
    event.preventDefault();
    const title = document.getElementById('assignmentTitle').value;
    const course = document.getElementById('assignmentCourse').value;
    const deadline = document.getElementById('assignmentDeadline').value;

    // Simulate validation for total weight
    const rubricInputs = document.querySelectorAll('#rubricCriteria input[type="number"]');
    let totalWeight = 0;
    rubricInputs.forEach(input => {
        totalWeight += parseInt(input.value) || 0;
    });

    if (totalWeight !== 100) {
        showToast(`Tổng trọng số Rubric phải là 100%. Hiện tại: ${totalWeight}%`, 'danger');
        return;
    }

    showToast(`Đã tạo và giao bài tập "${title}" cho lớp ${course}. Hạn chót: ${new Date(deadline).toLocaleString('vi-VN')}.`, 'success');

    // Simulate sending an automatic notification to students
    setTimeout(() => {
        showToast(`Hệ thống đã tự động gửi thông báo push về bài tập mới cho sinh viên lớp ${course}.`, 'info');
    }, 1500);
}

function handleSendNotification(event) {
    event.preventDefault();
    const target = document.getElementById('notificationTarget').value;
    const type = document.getElementById('notificationType').value;
    const message = document.getElementById('notificationMessage').value;

    if (!message.trim()) {
        showToast('Vui lòng nhập nội dung thông báo.', 'warning');
        return;
    }

    let typeText;
    let typeClass;
    switch (type) {
        case 'deadline': typeText = 'Hạn chót'; typeClass = 'danger'; break;
        case 'feedback': typeText = 'Phản hồi'; typeClass = 'success'; break;
        case 'alert': typeText = 'Cảnh báo'; typeClass = 'warning'; break;
        default: typeText = 'Chung'; typeClass = 'primary';
    }

    showToast(`Đã gửi [${typeText}] tới "${target}" với nội dung: "${message.substring(0, 50)}..."`, 'warning');
}


function handleUpload() {
    const uploadModal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
    uploadModal.hide();
    // Simulate adding a new batch of pending exams if needed, but for now just show confirmation
    showToast("Đã tải lên tệp bài làm. Bài làm đang chờ Giảng viên kích hoạt Chấm điểm Tự động.", 'primary');
}

function updateExamTableUI() {
    const examTableContainer = document.querySelector('#l_grading-content .card-body');
    if (examTableContainer) {
        examTableContainer.innerHTML = generateExamTable() +
            '<button class="btn btn-outline-danger btn-sm me-2 mt-2" onclick="showToast(\'Đã tải Báo cáo Tổng hợp (PDF).\', \'danger\')"><i class="bi bi-file-earmark-pdf me-1"></i> Tải Báo cáo Tổng</button>';
    }
}

function startAutomatedGrading() {
    const btn = document.getElementById('autoGradeBtn');
    const pendingExams = examData.filter(e => e.status === 'Pending');

    if (pendingExams.length === 0) {
        showToast('Không có bài thi nào đang chờ chấm điểm tự động.', 'warning');
        return;
    }

    // 1. Loading State
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý AI...';
    showToast(`Bắt đầu chấm ${pendingExams.length} bài thi. Vui lòng chờ đợi...`, 'info');

    // 2. Simulate AI Processing Delay (3 seconds)
    setTimeout(() => {
        let gradedCount = 0;

        // 3. Update Data Model with Simulated Results
        examData = examData.map(item => {
            if (item.status === 'Pending') {
                item.status = 'Graded';
                // Simulate random score (6.0 to 9.5) and plagiarism (5% to 25%)
                item.score = (Math.random() * (9.5 - 6.0) + 6.0).toFixed(1);
                item.plagiarism = Math.floor(Math.random() * (25 - 5) + 5) + '%';
                item.feedback = 'Chưa gửi';
                gradedCount++;
            }
            return item;
        });

        // 4. Update UI
        updateExamTableUI();

        // 5. Reset button and show success
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-robot me-1"></i> Chấm điểm Tự động (AI)';
        showToast(`Hoàn thành chấm điểm tự động cho ${gradedCount} bài thi. Giảng viên có thể xem chi tiết.`, 'success');

    }, 3000); // 3 seconds delay for simulation
}

function checkPlagiarism() {
    const input = document.getElementById('plagiarismInput').value.trim();
    const type = document.getElementById('plagiarismType').value;
    const resultDiv = document.getElementById('plagiarismResult');
    const loaderDiv = document.getElementById('plagiarismLoader');

    if (input.length < 100) {
        showToast('Vui lòng dán nội dung bài làm có độ dài tối thiểu 100 ký tự để kiểm tra.', 'warning');
        return;
    }

    // Show loading state
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<div class="text-center p-5"><span class="spinner-border text-warning me-2"></span> Đang phân tích ${input.length} ký tự... (Khoảng 5 giây)</div>`;

    // Simulate Plagiarism Check API Call (5 seconds delay)
    setTimeout(() => {
        const score = (Math.random() * (50 - 5) + 5).toFixed(1);
        const isHighRisk = parseFloat(score) > 25;
        const scoreClass = isHighRisk ? 'text-danger' : 'text-success';
        const warningMessage = isHighRisk ? 'HỆ THỐNG CẢNH BÁO: Rủi ro đạo văn CAO! Cần kiểm tra chi tiết.' : 'Tỷ lệ trùng lặp ở mức thấp. Cần xem xét các nguồn phụ.';

        // Clear loading and insert result content
        resultDiv.innerHTML = `
    <p class="text-muted fw-bold">Kết quả Phân tích (HouScore-AI Engine):</p>
    <div class="mb-3 border-bottom pb-2">
        <p class="mb-1">Tỷ lệ Trùng lặp/Đạo văn:
            <span class="fs-4 fw-bold ${scoreClass}">${score}%</span>
            <span class="badge bg-secondary">${type}</span>
        </p>
        <p class="small fw-bold ${scoreClass} mb-0">${warningMessage}</p>
    </div>

    <h6 class="mt-3">Nguồn Trùng lặp Chính (Mô phỏng):</h6>
    <ul class="list-group list-group-flush small">
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Khoá luận Tốt nghiệp K19: "Tối ưu hoá mô hình NLP..."
            <span class="badge bg-danger rounded-pill">Chiếm 15%</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Wikipedia tiếng Việt: "Trí tuệ nhân tạo..."
            <span class="badge bg-warning text-dark rounded-pill">Chiếm 8%</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Bài giảng Thầy A - Môn AI101
            <span class="badge bg-info text-dark rounded-pill">Chiếm 3%</span>
        </li>
    </ul>
    <p class="small text-muted mt-3 mb-0">Giảng viên có thể tải Báo cáo Chi tiết để xem từng câu/đoạn bị đánh dấu.</p>
    `;

        showToast(`Kiểm tra đạo văn hoàn tất. Tỷ lệ trùng lặp: ${score}%.`, isHighRisk ? 'danger' : 'success');

    }, 5000); // 5 seconds delay for plagiarism check
}

function sendQuickFeedback() {
    const feedback = document.getElementById('quickFeedbackText').value;
    const studentName = document.getElementById('detail-student-name').textContent;
    const detailModal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
    detailModal.hide();
    showToast(`Đã gửi phản hồi nhanh: "${feedback.substring(0, 30)}..." tới ${studentName}.`, 'warning');
}

function handleStudentSubmission() {
    const file = document.getElementById('fileSubmission').value;
    if (file) {
        showToast('Bài làm đã được nộp thành công và đang chờ AI Engine xử lý.', 'success');
    } else {
        showToast('Vui lòng chọn tệp để nộp.', 'warning');
    }
}

function showStudentList(courseId) {
    showToast(`Hiển thị danh sách 65 sinh viên thuộc lớp ${courseId}. Chức năng này sẽ mở ra Modal/Offcanvas chi tiết.`, 'info');
}

function viewStudentDetailedFeedback() {
    showToast('Mở Modal chi tiết phản hồi AI Engine và nhận xét của Giảng viên.', 'info');
    // Simulate opening a modal by triggering the lecturer detail modal, but change the header for student view
    const modalEl = document.getElementById('detailModal');
    const modalTitle = document.getElementById('detailModalLabel');
    const score = 8.5;
    const plagiarism = 12;

    document.getElementById('detail-student-name').textContent = DEMO_STUDENT_ID;
    document.getElementById('detail-score').textContent = score;
    document.getElementById('detail-plagiarism').textContent = plagiarism + '%';

    modalTitle.innerHTML = `Bài làm Chi tiết & Phản hồi AI: <span class="fw-bold text-success">${DEMO_STUDENT_ID}</span>`;

    const detailModal = new bootstrap.Modal(modalEl);
    detailModal.show();
}

// ------------------ CHART INITIALIZATION ------------------

function initializeCharts(viewId) {
    clearCharts(); // Clear previous charts

    if (viewId === 'l_reports') {
        // CHART 1: Grade Distribution
        const ctx1 = document.getElementById('gradeDistributionChart').getContext('2d');
        gradeDistributionChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Nhập môn AI (K20)', 'Lập trình Web (K21)', 'Cấu trúc Dữ liệu'],
                datasets: [
                    { label: 'Điểm A (9-10)', data: [15, 8, 20], backgroundColor: '#198754' },
                    { label: 'Điểm B (7-8.9)', data: [35, 25, 30], backgroundColor: '#0d6efd' },
                    { label: 'Điểm C (5-6.9)', data: [10, 5, 15], backgroundColor: '#ffc107' },
                    { label: 'Điểm D (< 5)', data: [5, 4, 3], backgroundColor: '#dc3545' },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: 'Số lượng Sinh viên' } } },
                plugins: { title: { display: false } }
            }
        });

        // CHART 2: AI Grading Performance (Deviation)
        const ctx2 = document.getElementById('aiVsManualChart').getContext('2d');
        aiVsManualChart = new Chart(ctx2, {
            type: 'radar',
            data: {
                labels: ['Tính Logic', 'Phân tích', 'Cấu trúc', 'Ngôn ngữ'],
                datasets: [
                    {
                        label: 'Sai lệch TB (AI - GV)',
                        data: [0.5, 0.2, 0.4, 0.3], // Deviation in score (max 1.0)
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgb(255, 99, 132)',
                        pointBackgroundColor: 'rgb(255, 99, 132)'
                    },
                    {
                        label: 'Điểm chuẩn TB (GV)',
                        data: [8.5, 9.0, 7.5, 8.0],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
                        pointBackgroundColor: 'rgb(54, 162, 235)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { suggestedMin: 0, suggestedMax: 10, pointLabels: { font: { size: 11 } } } },
                plugins: { title: { display: true, text: 'So sánh Điểm Chấm Tự động và Thủ công' } }
            }
        });

        // CHART 3: AI Engine Efficiency (Processing Time)
        const ctx3 = document.getElementById('aiEfficiencyChart').getContext('2d');
        aiEfficiencyChart = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6'],
                datasets: [
                    {
                        label: 'Thời gian xử lý TB (giây/bài)',
                        data: [17, 15, 14, 12, 13, 11.5],
                        borderColor: '#0dcaf0', // Info color
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Tỷ lệ lỗi (%)',
                        data: [0.5, 0.3, 0.2, 0.1, 0.1, 0.05],
                        borderColor: '#dc3545', // Danger color
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Thời gian (giây)' } },
                    y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Tỷ lệ lỗi (%)' }, grid: { drawOnChartArea: false } }
                },
                plugins: { legend: { position: 'bottom' } }
            }
        });
    } else if (viewId === 's_progress') {
        const ctx = document.getElementById('progressComparisonChart').getContext('2d');
        progressComparisonChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Tính Logic', 'Phân tích', 'Cấu trúc', 'Ngôn ngữ', 'Sáng tạo'],
                datasets: [
                    {
                        label: 'Điểm Cá nhân (S.SV105)',
                        data: [8, 9, 7.5, 9, 8],
                        backgroundColor: 'rgba(25, 135, 84, 0.2)', // Success
                        borderColor: '#198754',
                        pointBackgroundColor: '#198754'
                    },
                    {
                        label: 'Điểm Trung bình Lớp',
                        data: [7.5, 8, 7, 8.5, 7],
                        backgroundColor: 'rgba(13, 110, 253, 0.2)', // Primary
                        borderColor: '#0d6efd',
                        pointBackgroundColor: '#0d6efd'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { suggestedMin: 0, suggestedMax: 10, ticks: { display: false } } },
                plugins: { legend: { position: 'bottom' } }
            }
        });
    } else if (viewId === 's_reports') {
        // Grade Trend Chart
        const ctxTrend = document.getElementById('gradeTrendChart').getContext('2d');
        gradeTrendChart = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: ['HK 2023/1', 'HK 2023/2', 'HK 2024/1 (Hiện tại)'],
                datasets: [
                    {
                        label: 'Điểm TB Tích lũy',
                        data: [7.5, 8.1, 8.5],
                        borderColor: '#198754',
                        tension: 0.3,
                        fill: false,
                        pointBackgroundColor: '#198754'
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, min: 7, max: 10 } } }
        });

        // Rubric Score Chart
        const ctxRubric = document.getElementById('rubricScoreChart').getContext('2d');
        rubricScoreChart = new Chart(ctxRubric, {
            type: 'polarArea',
            data: {
                labels: ['Logic', 'Phân tích', 'Cấu trúc', 'Sáng tạo'],
                datasets: [{
                    data: [8.5, 9.0, 7.5, 8.0],
                    backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 10, ticks: { display: false } } }, plugins: { legend: { position: 'right' } } }
        });
    } else if (viewId === 'a_system') {
        const ctxAdmin = document.getElementById('adminSystemLoadChart').getContext('2d');
        adminSystemLoadChart = new Chart(ctxAdmin, {
            type: 'line',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
                datasets: [
                    { label: 'Số bài xử lý (Nghìn)', data: [1.5, 2.0, 3.5, 4.0, 3.8, 4.5], borderColor: '#dc3545', fill: true, backgroundColor: 'rgba(220, 53, 69, 0.2)', tension: 0.4 },
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', function () {
    // Logic to handle lecturer detail button clicks
    document.addEventListener('click', function (e) {
        if (e.target.matches('.view-details-btn')) {
            const row = e.target.closest('tr');
            const studentName = row.getAttribute('data-student-name');
            const score = row.getAttribute('data-score');
            const plagiarism = row.getAttribute('data-plagiarism');

            document.getElementById('detail-student-name').textContent = studentName;
            document.getElementById('detail-score').textContent = score;
            document.getElementById('detail-plagiarism').textContent = plagiarism;

            // Set color based on plagiarism risk
            const plgElement = document.getElementById('detail-plagiarism');
            if (parseFloat(plagiarism) > 30) {
                plgElement.className = 'fw-bold text-danger';
            } else {
                plgElement.className = 'fw-bold text-success';
            }

            // Reset title for lecturer view
            document.getElementById('detailModalLabel').innerHTML = `Kết quả Chi tiết Bài làm: <span id="detail-student-name" class="fw-bold text-primary">${studentName}</span>`;

            const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
            detailModal.show();
        }
    });
});

// PDF.js CDN for PDF text extraction
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
// File upload handler for plagiarism check
document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('plagiarismFile');
    if (fileInput) {
        fileInput.addEventListener('change', async function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const ext = file.name.split('.').pop().toLowerCase();
            const textarea = document.getElementById('plagiarismInput');
            if (ext === 'txt') {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    textarea.value = evt.target.result;
                };
                reader.readAsText(file);
            } else if (ext === 'pdf') {
                // Dynamically load PDF.js if not loaded
                if (typeof window.pdfjsLib === 'undefined') {
                    await loadScript(PDFJS_URL);
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                }
                const reader = new FileReader();
                reader.onload = async function (evt) {
                    const typedarray = new Uint8Array(evt.target.result);
                    const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(item => item.str).join(' ') + ' ';
                    }
                    textarea.value = text.trim();
                };
                reader.readAsArrayBuffer(file);
            } else if (ext === 'doc' || ext === 'docx') {
                textarea.value = '';
                showToast('Đọc file .doc/.docx chưa được hỗ trợ trực tiếp trên trình duyệt. Vui lòng chuyển sang PDF hoặc TXT.', 'warning');
            } else {
                textarea.value = '';
                showToast('Định dạng file không hỗ trợ. Chỉ hỗ trợ .doc, .docx, .pdf, .txt', 'danger');
            }
        });
    }
});
// Helper to dynamically load external JS
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}



// const firebaseConfig = {
//     apiKey: "AIzaSyA-6etFIXIDHHDNXvLnONuISE2mlmAg6qI",
//     authDomain: "houscore-ai.firebaseapp.com",
//     projectId: "houscore-ai",
//     storageBucket: "houscore-ai.firebasestorage.app",
//     messagingSenderId: "467542358045",
//     appId: "1:467542358045:web:d609e702cf9e2e16f62ef4",
//     measurementId: "G-JKGHJTQKE2"
// };
// firebase.initializeApp(firebaseConfig);
// if (firebase.analytics) {
//     firebase.analytics();
// }
