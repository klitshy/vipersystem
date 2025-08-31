// Viper Esports Training Attendance System
// Main application logic

class AttendanceSystem {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.currentUsername = null;
        this.roster = [];
        this.trainingHistory = [];
        this.trainingTime = '20:00'; // Default: 8:00 PM
        this.trainingType = 'main'; // Default: Main Roster Only
        this.scrims = []; // Array to store scrim matches
        this.tours = []; // Array to store tournament matches
        
        // Define user credentials
        this.users = {
            // Leaders
            'tarek jr': { password: 'admin', role: 'leader' },
            'note': { password: 'admin', role: 'leader' },
            
            // Players
            'klitshy': { password: '123456', role: 'player' },
            'drayko': { password: '123456', role: 'player' },
            'smile': { password: '123456', role: 'player' },
            'dodge': { password: '123456', role: 'player' },
            'tifa': { password: '123456', role: 'player' },
            'amir': { password: '123456', role: 'player' },
            'nasa': { password: '123456', role: 'player' },
            'mazen': { password: '123456', role: 'player' },
            'satan': { password: '123456', role: 'player' },
            'ezla': { password: '123456', role: 'player' }
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.checkSavedLogin();
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateStats();
        this.updateTrainingTimeDisplay();
        this.updateTrainingTypeDisplay();
        this.updateRosterManagement();
        this.updateScrimForm();
        this.updateScrimsList();
        this.updateTourForm();
        this.updateToursList();
    }

    // Initialize roster with default data
    loadData() {
        const savedRoster = localStorage.getItem('esports_roster');
        if (savedRoster) {
            this.roster = JSON.parse(savedRoster);
            // Add rosterType to existing players if missing
            this.roster.forEach(player => {
                if (!player.rosterType) {
                    player.rosterType = 'main'; // Default to main roster
                }
            });
        } else {
            // Initialize with default roster
            const defaultRoster = [
                'Klitshy', 'Drayko', 'Smile', 'Dodge', 'Tifa', 
                'Amir', 'Nasa', 'Mazen', 'Satan', 'Ezla'
            ];
            
            this.roster = defaultRoster.map(name => ({
                name: name,
                missed: 0,
                chancesLeft: 3,
                status: 'Active',
                history: [],
                rosterType: 'main' // Default to main roster
            }));
            this.saveRoster();
        }

        const savedHistory = localStorage.getItem('training_history');
        if (savedHistory) {
            this.trainingHistory = JSON.parse(savedHistory);
        }

        // Load training time
        const savedTime = localStorage.getItem('training_time');
        if (savedTime) {
            this.trainingTime = savedTime;
        }
        
        // Load training type
        const savedType = localStorage.getItem('training_type');
        if (savedType) {
            this.trainingType = savedType;
        }
        
        // Load scrims
        const savedScrims = localStorage.getItem('scrims');
        if (savedScrims) {
            this.scrims = JSON.parse(savedScrims);
        }
        
        // Load tours
        const savedTours = localStorage.getItem('tours');
        if (savedTours) {
            this.tours = JSON.parse(savedTours);
        }
    }

    // Check for saved login state
    checkSavedLogin() {
        const savedLogin = localStorage.getItem('user_login');
        if (savedLogin) {
            try {
                const loginData = JSON.parse(savedLogin);
                const { username, role, timestamp } = loginData;
                
                // Check if login is still valid (within 24 hours)
                const loginTime = new Date(timestamp);
                const now = new Date();
                const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
                
                if (hoursSinceLogin < 24 && this.users[username]) {
                    // Auto-login user
                    this.currentUsername = username;
                    this.currentRole = role;
                    this.currentUser = role === 'player' ? 'Player' : 'Leader';
                    
                    // Show app immediately
                    document.getElementById('loginSection').classList.add('hidden');
                    document.getElementById('appSection').classList.remove('hidden');
                    
                    // Update UI
                    this.updateUIForRole();
                    this.updateStats();
                    this.updateRosterGrid();
                    this.updateAttendanceTable();
                    this.updateHistoryView();
                    this.updateProfile();
                    this.updateTrainingTimeDisplay();
                    
                    this.showToast(`Welcome back, ${username}!`, 'success');
                } else {
                    // Clear expired login
                    localStorage.removeItem('user_login');
                }
            } catch (error) {
                console.error('Error parsing saved login:', error);
                localStorage.removeItem('user_login');
            }
        }
    }

    // Save login state
    saveLoginState() {
        const loginData = {
            username: this.currentUsername,
            role: this.currentRole,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('user_login', JSON.stringify(loginData));
    }

    // Save roster to localStorage
    saveRoster() {
        localStorage.setItem('esports_roster', JSON.stringify(this.roster));
        // Also save to sessionStorage for immediate access
        sessionStorage.setItem('esports_roster', JSON.stringify(this.roster));
    }

    // Save training history to localStorage
    saveHistory() {
        localStorage.setItem('training_history', JSON.stringify(this.trainingHistory));
        sessionStorage.setItem('training_history', JSON.stringify(this.trainingHistory));
    }

    // Save training time to localStorage
    saveTrainingTime() {
        localStorage.setItem('training_time', this.trainingTime);
        sessionStorage.setItem('training_time', this.trainingTime);
    }
    
    // Save training type to localStorage
    saveTrainingType() {
        localStorage.setItem('training_type', this.trainingType);
        sessionStorage.setItem('training_type', this.trainingType);
    }
    
    // Save scrims to localStorage
    saveScrims() {
        localStorage.setItem('scrims', JSON.stringify(this.scrims));
        sessionStorage.setItem('scrims', JSON.stringify(this.scrims));
    }

    // Save tours to localStorage
    saveTours() {
        localStorage.setItem('tours', JSON.stringify(this.tours));
        sessionStorage.setItem('tours', JSON.stringify(this.tours));
    }

    // Set default date to today
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sessionDate').value = today;
        document.getElementById('historyDate').value = today;
        document.getElementById('scrimDate').value = today;
        
        // Set default scrim time to 1 hour after training time
        const trainingHour = parseInt(this.trainingTime.split(':')[0]);
        const scrimHour = (trainingHour + 1) % 24;
        const scrimTime = `${scrimHour.toString().padStart(2, '0')}:00`;
        document.getElementById('scrimTime').value = scrimTime;
    }

    // Check if current time is at or after training time
    isTrainingTime() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format
        
        // Convert training time to comparable format
        const trainingTimeParts = this.trainingTime.split(':');
        const currentTimeParts = currentTime.split(':');
        
        const trainingMinutes = parseInt(trainingTimeParts[0]) * 60 + parseInt(trainingTimeParts[1]);
        const currentMinutes = parseInt(currentTimeParts[0]) * 60 + parseInt(currentTimeParts[1]);
        
        return currentMinutes >= trainingMinutes;
    }

    // Get time until training starts
    getTimeUntilTraining() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        
        const trainingTimeParts = this.trainingTime.split(':');
        const currentTimeParts = currentTime.split(':');
        
        const trainingMinutes = parseInt(trainingTimeParts[0]) * 60 + parseInt(currentTimeParts[1]);
        const currentMinutes = parseInt(currentTimeParts[0]) * 60 + parseInt(currentTimeParts[1]);
        
        if (currentMinutes >= trainingMinutes) {
            return 0; // Training time has passed
        }
        
        const minutesUntil = trainingMinutes - currentMinutes;
        const hours = Math.floor(minutesUntil / 60);
        const minutes = minutesUntil % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m until training`;
        } else {
            return `${minutes}m until training`;
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Login
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        
        // Enter key on password field
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToSection(e.target.dataset.section));
        });
        
        // Attendance actions
        document.getElementById('markAttendanceBtn').addEventListener('click', () => this.markAttendance());
        document.getElementById('resetSeasonBtn').addEventListener('click', () => this.resetSeason());
        
        // Export data
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        
        // Date changes
        document.getElementById('sessionDate').addEventListener('change', () => this.updateAttendanceTable());
        document.getElementById('historyDate').addEventListener('change', () => this.updateHistoryView());
        
        // Training time management
        document.getElementById('editTimeBtn').addEventListener('click', () => this.showTimeEdit());
        document.getElementById('saveTimeBtn').addEventListener('click', () => this.saveTrainingTime());
        document.getElementById('cancelTimeBtn').addEventListener('click', () => this.cancelTimeEdit());
        
        // Scrim management
        document.getElementById('createScrimBtn').addEventListener('click', () => this.createScrim());
        document.getElementById('clearScrimFormBtn').addEventListener('click', () => this.clearScrimForm());
        document.getElementById('clearAllScrimsBtn').addEventListener('click', () => this.clearAllScrims());
        
        // Tour management
        document.getElementById('createTourBtn').addEventListener('click', () => this.createTour());
        document.getElementById('clearTourFormBtn').addEventListener('click', () => this.clearTourForm());
        document.getElementById('clearAllToursBtn').addEventListener('click', () => this.clearAllTours());
        
        // Add event listeners for main player selection changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('#mainPlayersSelection input[type="checkbox"]')) {
                this.updateIglOptions();
                this.updatePlayerCounts();
            }
        });
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => this.autoSave());
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }

    // Auto-save function
    autoSave() {
        if (this.currentUser) {
            this.saveRoster();
            this.saveHistory();
            this.saveTrainingTime();
            this.saveTrainingType();
            this.saveScrims();
            this.saveTours();
            if (this.currentUsername) {
                this.saveLoginState();
            }
        }
    }

    // Show time editing interface
    showTimeEdit() {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can change training time', 'error');
            return;
        }
        
        document.getElementById('timeControls').style.display = 'block';
        document.getElementById('editTimeBtn').style.display = 'none';
        document.getElementById('newTrainingTime').value = this.trainingTime;
    }

    // Save new training time
    saveTrainingTime() {
        const newTime = document.getElementById('newTrainingTime').value;
        if (!newTime) {
            this.showToast('Please select a valid time', 'error');
            return;
        }
        
        this.trainingTime = newTime;
        this.saveTrainingTime();
        this.updateTrainingTimeDisplay();
        this.hideTimeEdit();
        this.showToast('Training time updated successfully', 'success');
        
        // Auto-save
        this.autoSave();
    }

    // Cancel time editing
    cancelTimeEdit() {
        this.hideTimeEdit();
    }

    // Hide time editing interface
    hideTimeEdit() {
        document.getElementById('timeControls').style.display = 'none';
        document.getElementById('editTimeBtn').style.display = 'inline-block';
    }

    // Update training time display
    updateTrainingTimeDisplay() {
        const timeDisplay = document.getElementById('trainingTimeDisplay');
        const time = new Date(`2000-01-01T${this.trainingTime}`);
        const formattedTime = time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        timeDisplay.textContent = formattedTime;
    }
    
    // Update training type
    updateTrainingType(type) {
        this.trainingType = type;
        this.saveTrainingType();
        this.showToast(`Training type updated to: ${type === 'main' ? 'Main Roster Only' : 'Main + Academy'}`, 'success');
    }
    
    // Update training type display
    updateTrainingTypeDisplay() {
        if (this.trainingType === 'main') {
            document.getElementById('mainOnly').checked = true;
        } else {
            document.getElementById('mainAcademy').checked = true;
        }
    }

    // Login functionality
    login() {
        const username = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showToast('Please enter both username and password', 'error');
            return;
        }

        // Check if user exists
        if (!this.users[username]) {
            this.showToast('Invalid username', 'error');
            return;
        }

        // Check password
        if (this.users[username].password !== password) {
            this.showToast('Invalid password', 'error');
            return;
        }

        // Login successful
        this.currentUsername = username;
        this.currentRole = this.users[username].role;
        this.currentUser = this.users[username].role === 'player' ? 'Player' : 'Leader';
        
        // Save login state
        this.saveLoginState();
        
        // Hide login, show app
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('appSection').classList.remove('hidden');
        
        // Update UI based on role
        this.updateUIForRole();
        this.updateStats();
        this.updateRosterGrid();
        this.updateAttendanceTable();
        this.updateHistoryView();
        this.updateProfile();
        this.updateTrainingTimeDisplay();
        
        this.showToast(`Welcome, ${username}!`, 'success');
        
        // Clear login fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Auto-save
        this.autoSave();
    }

    // Logout functionality
    logout() {
        this.currentUser = null;
        this.currentRole = null;
        this.currentUsername = null;
        
        // Clear saved login
        localStorage.removeItem('user_login');
        sessionStorage.removeItem('user_login');
        
        // Show login, hide app
        document.getElementById('appSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
        
        this.showToast('Logged out successfully', 'success');
    }

    // Update UI based on user role
    updateUIForRole() {
        const userRoleSpan = document.getElementById('userRole');
        const userNameSpan = document.getElementById('userName');
        
        userRoleSpan.textContent = this.currentRole === 'leader' ? 'Leader' : 'Player';
        userNameSpan.textContent = this.currentUsername;
        
        // Show/hide elements based on role
        const resetSeasonBtn = document.getElementById('resetSeasonBtn');
        resetSeasonBtn.style.display = this.currentRole === 'leader' ? 'inline-block' : 'none';
        
        // Update attendance table based on role
        this.updateAttendanceTable();
    }

    // Navigate between sections
    navigateToSection(sectionName) {
        // Remove active class from all sections and nav links
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to selected section and nav link
        document.getElementById(`${sectionName}Section`).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    }

    // Update statistics
    updateStats() {
        const totalPlayers = this.roster.length;
        const activePlayers = this.roster.filter(player => player.status === 'Active').length;
        const kickedPlayers = this.roster.filter(player => player.status === 'Kicked').length;
        const mainRosterCount = this.roster.filter(player => player.rosterType === 'main' && player.status === 'Active').length;
        const academyCount = this.roster.filter(player => player.rosterType === 'academy' && player.status === 'Active').length;
        
        // Calculate total normal absences (the ones that count against chances)
        const totalNormalAbsences = this.roster.reduce((total, player) => {
            const normalAbsences = player.history.filter(h => !h.attended && h.type === 'normal').length;
            return total + normalAbsences;
        }, 0);
        
        document.getElementById('totalPlayers').textContent = totalPlayers;
        document.getElementById('activePlayers').textContent = activePlayers;
        document.getElementById('kickedPlayers').textContent = kickedPlayers;
        document.getElementById('mainRosterCount').textContent = mainRosterCount;
        document.getElementById('academyCount').textContent = academyCount;
        
        // Update the stats display to show normal absences
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            const existingAbsenceStat = statsGrid.querySelector('#totalNormalAbsences');
            if (!existingAbsenceStat) {
                const absenceStatCard = document.createElement('div');
                absenceStatCard.className = 'stat-card';
                absenceStatCard.innerHTML = `
                    <h3>Total Normal Absences</h3>
                    <p id="totalNormalAbsences">${totalNormalAbsences}</p>
                `;
                statsGrid.appendChild(absenceStatCard);
            } else {
                existingAbsenceStat.textContent = totalNormalAbsences;
            }
        }
    }

    // Update roster grid on home page
    updateRosterGrid() {
        const rosterGrid = document.getElementById('rosterGrid');
        rosterGrid.innerHTML = '';
        
        this.roster.forEach(player => {
            // Calculate different types of absences
            const normalAbsences = player.history.filter(h => !h.attended && h.type === 'normal').length;
            const reasonedAbsences = player.history.filter(h => !h.attended && h.type === 'reasoned').length;
            
            const rosterItem = document.createElement('div');
            rosterItem.className = `roster-item ${player.status === 'Kicked' ? 'kicked' : ''}`;
            
            const rosterTypeBadge = player.rosterType === 'main' ? 
                '<span style="background: #27ae60; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; margin-right: 8px;">🏆 Main</span>' :
                '<span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; margin-right: 8px;">🎓 Academy</span>';
            
            rosterItem.innerHTML = `
                <div class="player-name">${rosterTypeBadge}${player.name}</div>
                <div class="player-status ${player.status.toLowerCase()}">${player.status}</div>
                <div style="font-size: 0.8rem; color: #cccccc; margin-top: 0.5rem;">
                    Normal Missed: ${normalAbsences} | Reasoned: ${reasonedAbsences} | Chances: ${player.chancesLeft}
                </div>
            `;
            
            rosterGrid.appendChild(rosterItem);
        });
    }

    // Update attendance table
    updateAttendanceTable() {
        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = '';
        
        this.roster.forEach(player => {
            // Calculate different types of absences
            const normalAbsences = player.history.filter(h => !h.attended && h.type === 'normal').length;
            const reasonedAbsences = player.history.filter(h => !h.attended && h.type === 'reasoned').length;
            
            const row = document.createElement('tr');
            if (player.status === 'Kicked') {
                row.classList.add('kicked');
            }
            
            const actions = this.currentRole === 'leader' ? 
                this.createLeaderActions(player) : 
                this.createPlayerActions(player);
            
            row.innerHTML = `
                <td>${player.name}</td>
                <td>
                    <span class="player-status ${player.status.toLowerCase()}">${player.status}</span>
                </td>
                <td>${normalAbsences} (${reasonedAbsences} with reason)</td>
                <td>${player.chancesLeft}</td>
                <td>${actions}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        this.addActionButtonListeners();
    }

    // Create action buttons for leaders
    createLeaderActions(player) {
        if (player.status === 'Kicked') {
            return '<span style="color: #ff4757;">Actions Disabled</span>';
        }
        
        return `
            <div class="attendance-actions">
                <button class="btn btn-success mark-present" data-player="${player.name}">Present</button>
                <button class="btn btn-warning mark-absent-reason" data-player="${player.name}">Absent with Reason</button>
                <button class="btn btn-danger mark-absent" data-player="${player.name}">Normal Absent</button>
            </div>
        `;
    }

    // Create action buttons for players
    createPlayerActions(player) {
        if (player.status === 'Kicked') {
            return '<span style="color: #ff4757;">Actions Disabled</span>';
        }
        
        // Only show check-in button for the current player
        if (player.name.toLowerCase() === this.currentUsername) {
            // Check if it's training time
            if (!this.isTrainingTime()) {
                const timeUntil = this.getTimeUntilTraining();
                return `<span style="color: #ff6b35;">⏰ ${timeUntil}</span>`;
            }
            
            return `
                <div class="attendance-actions">
                    <button class="btn btn-success check-in" data-player="${player.name}">Check In</button>
                </div>
            `;
        } else {
            return '<span style="color: #cccccc;">Not your account</span>';
        }
    }

    // Add event listeners to action buttons
    addActionButtonListeners() {
        // Present buttons
        document.querySelectorAll('.mark-present').forEach(btn => {
            btn.addEventListener('click', (e) => this.markPlayerPresent(e.target.dataset.player));
        });
        
        // Absent buttons
        document.querySelectorAll('.mark-absent').forEach(btn => {
            btn.addEventListener('click', (e) => this.markPlayerAbsent(e.target.dataset.player));
        });
        
        // Absent with Reason buttons
        document.querySelectorAll('.mark-absent-reason').forEach(btn => {
            btn.addEventListener('click', (e) => this.markPlayerAbsentWithReason(e.target.dataset.player));
        });
        
        // Check-in buttons
        document.querySelectorAll('.check-in').forEach(btn => {
            btn.addEventListener('click', (e) => this.playerCheckIn(e.target.dataset.player));
        });
    }

    // Mark player as present
    markPlayerPresent(playerName) {
        const sessionDate = document.getElementById('sessionDate').value;
        const player = this.roster.find(p => p.name === playerName);
        
        if (!player) return;
        
        // Check if already marked for today
        const todayRecord = player.history.find(h => h.date === sessionDate);
        if (todayRecord) {
            this.showToast(`${playerName} already has attendance marked for today`, 'warning');
            return;
        }
        
        // Add to history
        player.history.push({
            date: sessionDate,
            attended: true
        });
        
        this.saveRoster();
        this.updateAttendanceTable();
        this.updateStats();
        this.updateRosterGrid();
        
        this.showToast(`${playerName} marked as present`, 'success');
        
        // Auto-save
        this.autoSave();
    }

    // Mark player as absent with reason
    markPlayerAbsentWithReason(playerName) {
        const sessionDate = document.getElementById('sessionDate').value;
        const player = this.roster.find(p => p.name === playerName);
        
        if (!player) return;
        
        // Check if already marked for today
        const todayRecord = player.history.find(h => h.date === sessionDate);
        if (todayRecord) {
            this.showToast(`${playerName} already has attendance marked for today`, 'warning');
            return;
        }
        
        // Show modal for reason input
        const reason = prompt('Enter reason for absence:');
        if (reason) {
            // Add to history but DON'T count against chances
            player.history.push({
                date: sessionDate,
                attended: false,
                reason: reason,
                type: 'reasoned'
            });
            
            // NO penalty - player keeps their chances
            // player.missed stays the same
            // player.chancesLeft stays the same
            
            this.saveRoster();
            this.updateAttendanceTable();
            this.updateStats();
            this.updateRosterGrid();
            
            this.showToast(`${playerName} marked as absent with reason: ${reason} (No penalty)`, 'info');
        }
        
        // Auto-save
        this.autoSave();
    }

    // Mark player as absent (normal absence - counts against chances)
    markPlayerAbsent(playerName) {
        const sessionDate = document.getElementById('sessionDate').value;
        const player = this.roster.find(p => p.name === playerName);
        
        if (!player) return;
        
        // Check if already marked for today
        const todayRecord = player.history.find(h => h.date === sessionDate);
        if (todayRecord) {
            this.showToast(`${playerName} already has attendance marked for today`, 'warning');
            return;
        }
        
        // Add to history as normal absence
        player.history.push({
            date: sessionDate,
            attended: false,
            type: 'normal'
        });
        
        // Increment missed count and reduce chances
        player.missed++;
        player.chancesLeft--;
        
        // Check if player should be kicked
        if (player.chancesLeft <= 0) {
            player.status = 'Kicked';
            this.showToast(`${playerName} has been kicked!`, 'error');
        }
        
        this.saveRoster();
        this.updateAttendanceTable();
        this.updateStats();
        this.updateRosterGrid();
        
        this.showToast(`${playerName} marked as absent (1 chance lost)`, 'warning');
        
        // Auto-save
        this.autoSave();
    }

    // Player check-in
    playerCheckIn(playerName) {
        // Check if it's training time
        if (!this.isTrainingTime()) {
            const timeUntil = this.getTimeUntilTraining();
            this.showToast(`Training hasn't started yet. ${timeUntil}`, 'warning');
            return;
        }
        
        const sessionDate = document.getElementById('sessionDate').value;
        const player = this.roster.find(p => p.name === playerName);
        
        if (!player) return;
        
        // Check if already checked in for today
        const todayRecord = player.history.find(h => h.date === sessionDate);
        if (todayRecord) {
            this.showToast('You have already checked in for today', 'warning');
            return;
        }
        
        // Add to history
        player.history.push({
            date: sessionDate,
            attended: true
        });
        
        this.saveRoster();
        this.updateAttendanceTable();
        this.updateStats();
        this.updateRosterGrid();
        
        this.showToast('Check-in successful!', 'success');
        
        // Auto-save
        this.autoSave();
    }

    // Mark attendance for all players (leader function)
    markAttendance() {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can mark attendance', 'error');
            return;
        }
        
        const sessionDate = document.getElementById('sessionDate').value;
        if (!sessionDate) {
            this.showToast('Please select a date', 'error');
            return;
        }
        
        // Check if session already exists
        const existingSession = this.trainingHistory.find(s => s.date === sessionDate);
        if (existingSession) {
            this.showToast('Attendance already marked for this date', 'warning');
            return;
        }
        
        // Create new training session
        const session = {
            date: sessionDate,
            players: this.roster.map(player => ({
                name: player.name,
                attended: false // Default to absent, leaders mark individually
            }))
        };
        
        this.trainingHistory.push(session);
        this.saveHistory();
        
        this.showToast('Training session created. Mark individual attendance.', 'success');
        
        // Auto-save
        this.autoSave();
    }

    // Reset season (clear all data)
    resetSeason() {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can reset the season', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to reset the season? This will clear all attendance data.')) {
            // Reset roster
            this.roster.forEach(player => {
                player.missed = 0;
                player.chancesLeft = 3;
                player.status = 'Active';
                player.history = [];
            });
            
            // Clear training history
            this.trainingHistory = [];
            
            this.saveRoster();
            this.saveHistory();
            
            this.updateStats();
            this.updateRosterGrid();
            this.updateAttendanceTable();
            this.updateHistoryView();
            
            this.showToast('Season reset successfully', 'success');
            
            // Auto-save
            this.autoSave();
        }
    }

    // Update history view
    updateHistoryView() {
        const historyContent = document.getElementById('historyContent');
        const selectedDate = document.getElementById('historyDate').value;
        
        if (!selectedDate) {
            historyContent.innerHTML = '<p style="text-align: center; color: #cccccc;">Select a date to view history</p>';
            return;
        }
        
        const session = this.trainingHistory.find(s => s.date === selectedDate);
        
        if (!session) {
            historyContent.innerHTML = '<p style="text-align: center; color: #cccccc;">No training session found for this date</p>';
            return;
        }
        
        let historyHTML = `
            <div class="history-session">
                <h4>Training Session - ${new Date(selectedDate).toLocaleDateString()}</h4>
                <div class="history-players">
        `;
        
        session.players.forEach(player => {
            const statusClass = player.attended ? 'present' : 'absent';
            const statusText = player.attended ? 'Present' : 'Absent';
            
            // Check if it's a reasoned absence
            let reasonText = '';
            if (!player.attended && player.reason) {
                reasonText = `<br><small style="color: #ffa726;">Reason: ${player.reason}</small>`;
            }
            
            historyHTML += `
                <div class="history-player ${statusClass}">
                    <span>${player.name}</span>
                    <span>${statusText}${reasonText}</span>
                </div>
            `;
        });
        
        historyHTML += '</div></div>';
        historyContent.innerHTML = historyHTML;
    }

    // Update profile information
    updateProfile() {
        if (this.currentRole === 'player') {
            // For players, show their own info
            const player = this.roster.find(p => p.name.toLowerCase() === this.currentUsername);
            if (player) {
                // Calculate different types of absences
                const normalAbsences = player.history.filter(h => !h.attended && h.type === 'normal').length;
                const reasonedAbsences = player.history.filter(h => !h.attended && h.type === 'reasoned').length;
                const totalAbsences = player.history.filter(h => !h.attended).length;
                
                document.getElementById('profileRole').textContent = 'Player';
                document.getElementById('profileName').textContent = player.name;
                document.getElementById('profileStatus').textContent = player.status;
                document.getElementById('profileMissed').textContent = `${normalAbsences} (${reasonedAbsences} with reason)`;
                document.getElementById('profileChances').textContent = player.chancesLeft;
            }
        } else {
            // For leaders, show general info
            document.getElementById('profileRole').textContent = 'Leader';
            document.getElementById('profileName').textContent = this.currentUsername;
            document.getElementById('profileStatus').textContent = 'Active';
            document.getElementById('profileMissed').textContent = 'N/A';
            document.getElementById('profileChances').textContent = 'N/A';
        }
    }

    // Export data as JSON
    exportData() {
        const data = {
            roster: this.roster,
            trainingHistory: this.trainingHistory,
            trainingTime: this.trainingTime,
            trainingType: this.trainingType,
            scrims: this.scrims,
            tours: this.tours,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `vpr-attendance-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Data exported successfully', 'success');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Update scrim form with player checkboxes
    updateScrimForm() {
        const mainPlayersSelection = document.getElementById('mainPlayersSelection');
        const substituteSelection = document.getElementById('substituteSelection');
        const iglSelect = document.getElementById('iglPlayer');
        
        // Clear existing content
        mainPlayersSelection.innerHTML = '';
        substituteSelection.innerHTML = '';
        iglSelect.innerHTML = '<option value="">Select IGL from main players</option>';
        
        // Add main roster players
        this.roster.forEach(player => {
            if (player.status === 'Active') {
                // Main players selection
                const mainCheckbox = document.createElement('div');
                mainCheckbox.className = 'player-checkbox';
                mainCheckbox.innerHTML = `
                    <label>
                        <input type="checkbox" id="main_${player.name}" data-player="${player.name}">
                        <span>${player.name}</span>
                    </label>
                `;
                mainPlayersSelection.appendChild(mainCheckbox);
                
                // IGL selection
                const iglOption = document.createElement('option');
                iglOption.value = player.name;
                iglOption.textContent = player.name;
                iglSelect.appendChild(iglOption);
                
                // Substitute selection
                const subCheckbox = document.createElement('div');
                subCheckbox.className = 'player-checkbox';
                subCheckbox.innerHTML = `
                    <label>
                        <input type="checkbox" id="sub_${player.name}" data-player="${player.name}">
                        <span>${player.name}</span>
                    </label>
                `;
                substituteSelection.appendChild(subCheckbox);
            }
        });
        
        // Add event listeners for main player selection
        mainPlayersSelection.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const checkedMainPlayers = mainPlayersSelection.querySelectorAll('input[type="checkbox"]:checked');
                
                // If trying to select more than 5, uncheck the current one
                if (checkedMainPlayers.length > 5) {
                    e.target.checked = false;
                    this.showToast('Maximum 5 main players allowed', 'warning');
                    return;
                }
                
                // Update IGL options and counts
                this.updateIglOptions();
                this.updatePlayerCounts();
            });
        });
        
        // Add event listeners for substitute selection (max 1)
        substituteSelection.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const checkedSubs = substituteSelection.querySelectorAll('input[type="checkbox"]:checked');
                
                // If trying to select more than 1 substitute, uncheck others
                if (checkedSubs.length > 1) {
                    checkedSubs.forEach(cb => {
                        if (cb !== e.target) {
                            cb.checked = false;
                        }
                    });
                    this.showToast('Maximum 1 substitute allowed', 'warning');
                }
                
                // Update counts
                this.updatePlayerCounts();
            });
        });
        
        // Initialize player counts
        this.updatePlayerCounts();
    }
    
    // Update IGL options based on selected main players
    updateIglOptions() {
        const iglSelect = document.getElementById('iglPlayer');
        const selectedMainPlayers = Array.from(document.querySelectorAll('#mainPlayersSelection input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.player);
        
        // Clear and repopulate IGL options
        iglSelect.innerHTML = '<option value="">Select IGL from main players</option>';
        selectedMainPlayers.forEach(playerName => {
            const option = document.createElement('option');
            option.value = playerName;
            option.textContent = playerName;
            iglSelect.appendChild(option);
        });
    }
    
    // Create a new scrim
    createScrim() {
        console.log('createScrim method called');
        
        if (this.currentRole !== 'leader') {
            console.log('User is not a leader:', this.currentRole);
            this.showToast('Only leaders can create scrims', 'error');
            return;
        }
        
        const date = document.getElementById('scrimDate').value;
        const time = document.getElementById('scrimTime').value;
        const opponent = document.getElementById('scrimOpponent').value.trim();
        
        console.log('Form values:', { date, time, opponent });
        
        if (!date || !time || !opponent) {
            this.showToast('Please fill in all scrim details', 'error');
            return;
        }
        
        // Get selected main players
        const selectedMainPlayers = Array.from(document.querySelectorAll('#mainPlayersSelection input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.player);
        
        console.log('Selected main players:', selectedMainPlayers);
        
        if (selectedMainPlayers.length !== 5) {
            this.showToast(`Please select exactly 5 main players. Currently selected: ${selectedMainPlayers.length}`, 'error');
            return;
        }
        
        // Get selected substitute
        const selectedSubstitute = Array.from(document.querySelectorAll('#substituteSelection input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.player)[0] || null;
        
        console.log('Selected substitute:', selectedSubstitute);
        
        // Get IGL
        const igl = document.getElementById('iglPlayer').value;
        console.log('Selected IGL:', igl);
        
        if (!igl) {
            this.showToast('Please select an In-Game Leader', 'error');
            return;
        }
        
        // Create scrim object
        const scrim = {
            id: Date.now().toString(),
            date: date,
            time: time,
            opponent: opponent,
            mainPlayers: selectedMainPlayers,
            substitute: selectedSubstitute,
            igl: igl,
            status: 'scheduled',
            result: null,
            createdAt: new Date().toISOString()
        };
        
        console.log('Created scrim object:', scrim);
        
        this.scrims.push(scrim);
        this.saveScrims();
        this.updateScrimsList();
        
        this.showToast(`Scrim created successfully vs ${opponent}`, 'success');
        this.clearScrimForm();
        
        // Auto-save
        this.autoSave();
    }
    
    // Clear scrim form
    clearScrimForm() {
        document.getElementById('scrimDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('scrimTime').value = '21:00';
        document.getElementById('scrimOpponent').value = '';
        
        // Uncheck all checkboxes
        document.querySelectorAll('.player-checkbox input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        // Reset IGL selection
        document.getElementById('iglPlayer').innerHTML = '<option value="">Select IGL from main players</option>';
    }
    
    // Update scrims list display
    updateScrimsList() {
        const scrimsList = document.getElementById('activeScrimsList');
        scrimsList.innerHTML = '';
        
        if (this.scrims.length === 0) {
            scrimsList.innerHTML = '<p style="text-align: center; color: #cccccc;">No scrims scheduled</p>';
            return;
        }
        
        // Sort scrims by date (newest first)
        const sortedScrims = [...this.scrims].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedScrims.forEach(scrim => {
            const scrimItem = document.createElement('div');
            scrimItem.className = 'scrim-item';
            
            const statusClass = scrim.status === 'completed' ? 'completed' : 'scheduled';
            const resultButtons = scrim.status === 'scheduled' ? `
                <div class="scrim-result">
                    <button class="result-btn win" onclick="attendanceSystem.markScrimResult('${scrim.id}', 'win')">Mark Win</button>
                    <button class="result-btn lose" onclick="attendanceSystem.markScrimResult('${scrim.id}', 'lose')">Mark Loss</button>
                </div>
            ` : `<div class="scrim-result"><strong>Result: ${scrim.result}</strong></div>`;
            
            scrimItem.innerHTML = `
                <div class="scrim-header">
                    <div class="scrim-title">vs ${scrim.opponent}</div>
                    <div class="scrim-status ${statusClass}">${scrim.status}</div>
                </div>
                <div class="scrim-details">
                    <strong>Date:</strong> ${new Date(scrim.date).toLocaleDateString()}<br>
                    <strong>Time:</strong> ${scrim.time}<br>
                    <strong>IGL:</strong> <span class="igl-player">${scrim.igl}</span>
                </div>
                <div class="scrim-players">
                    <div class="player-category">
                        <h5>Main Players (5)</h5>
                        <div class="player-list">${scrim.mainPlayers.join(', ')}</div>
                    </div>
                    <div class="player-category">
                        <h5>Substitute</h5>
                        <div class="player-list">${scrim.substitute || 'None'}</div>
                    </div>
                </div>
                ${resultButtons}
            `;
            
            scrimsList.appendChild(scrimItem);
        });
    }
    
    // Mark scrim result and handle player penalties
    markScrimResult(scrimId, result) {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can mark scrim results', 'error');
            return;
        }
        
        const scrim = this.scrims.find(s => s.id === scrimId);
        if (!scrim) return;
        
        scrim.status = 'completed';
        scrim.result = result;
        
        // Check for no-show players and apply penalties
        const allSelectedPlayers = [...scrim.mainPlayers];
        if (scrim.substitute) allSelectedPlayers.push(scrim.substitute);
        
        allSelectedPlayers.forEach(playerName => {
            const player = this.roster.find(p => p.name === playerName);
            if (player) {
                // Check if player attended training on scrim date
                const trainingRecord = player.history.find(h => h.date === scrim.date);
                
                if (!trainingRecord || !trainingRecord.attended) {
                    // Player didn't attend training, lose 1 chance
                    player.missed++;
                    player.chancesLeft--;
                    
                    if (player.chancesLeft <= 0) {
                        player.status = 'Kicked';
                        this.showToast(`${playerName} has been kicked for missing scrim!`, 'error');
                    } else {
                        this.showToast(`${playerName} lost 1 chance for missing scrim`, 'warning');
                    }
                }
            }
        });
        
        this.saveScrims();
        this.saveRoster();
        this.updateScrimsList();
        this.updateStats();
        this.updateRosterGrid();
        this.updateAttendanceTable();
        
        this.showToast(`Scrim marked as ${result.toUpperCase()}`, 'success');
        
        // Auto-save
        this.autoSave();
    }

    // Update player count displays
    updatePlayerCounts() {
        const mainCount = document.querySelectorAll('#mainPlayersSelection input[type="checkbox"]:checked').length;
        const subCount = document.querySelectorAll('#substituteSelection input[type="checkbox"]:checked').length;
        
        document.getElementById('mainPlayerCount').textContent = `${mainCount}/5`;
        document.getElementById('substituteCount').textContent = `${subCount}/1`;
        
        // Update colors based on selection
        const mainCountElement = document.getElementById('mainPlayerCount');
        const subCountElement = document.getElementById('substituteCount');
        
        if (mainCount === 5) {
            mainCountElement.style.color = '#27ae60'; // Green when complete
        } else {
            mainCountElement.style.color = '#3498db'; // Blue when incomplete
        }
        
        if (subCount === 1) {
            subCountElement.style.color = '#27ae60'; // Green when complete
        } else {
            subCountElement.style.color = '#f39c12'; // Orange when incomplete
        }
    }
    
    // Clear all scrims
    clearAllScrims() {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can clear all scrims', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to clear ALL scrims? This action cannot be undone.')) {
            this.scrims = [];
            this.saveScrims();
            this.updateScrimsList();
            this.showToast('All scrims cleared successfully', 'success');
            this.autoSave();
        }
    }
    
    // Update tour form with main roster player checkboxes
    updateTourForm() {
        const tourPlayersSelection = document.getElementById('tourPlayersSelection');
        const tourIglSelect = document.getElementById('tourIglPlayer');
        
        // Clear existing content
        tourPlayersSelection.innerHTML = '';
        tourIglSelect.innerHTML = '<option value="">Select Tournament IGL</option>';
        
        // Add only main roster players
        this.roster.forEach(player => {
            if (player.status === 'Active' && player.rosterType === 'main') {
                // Tour players selection
                const tourCheckbox = document.createElement('div');
                tourCheckbox.className = 'player-checkbox';
                tourCheckbox.innerHTML = `
                    <label>
                        <input type="checkbox" id="tour_${player.name}" data-player="${player.name}">
                        <span>${player.name}</span>
                    </label>
                `;
                tourPlayersSelection.appendChild(tourCheckbox);
                
                // Tour IGL selection
                const tourIglOption = document.createElement('option');
                tourIglOption.value = player.name;
                tourIglOption.textContent = player.name;
                tourIglSelect.appendChild(tourIglOption);
            }
        });
        
        // Add event listeners for tour player selection with max limit
        tourPlayersSelection.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const checkedTourPlayers = tourPlayersSelection.querySelectorAll('input[type="checkbox"]:checked');
                
                // If trying to select more than 5, uncheck the current one
                if (checkedTourPlayers.length > 5) {
                    e.target.checked = false;
                    this.showToast('Maximum 5 tour players allowed', 'warning');
                    return;
                }
                
                // Update tour player counts
                this.updateTourPlayerCounts();
            });
        });
        
        // Initialize tour player counts
        this.updateTourPlayerCounts();
    }
    
    // Update tour player count display
    updateTourPlayerCounts() {
        const tourCount = document.querySelectorAll('#tourPlayersSelection input[type="checkbox"]:checked').length;
        document.getElementById('tourPlayerCount').textContent = `${tourCount}/5`;
        
        // Update color based on selection
        const tourCountElement = document.getElementById('tourPlayerCount');
        if (tourCount === 5) {
            tourCountElement.style.color = '#27ae60'; // Green when complete
        } else {
            tourCountElement.style.color = '#3498db'; // Blue when incomplete
        }
    }
    
    // Create a new tour
    createTour() {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can create tours', 'error');
            return;
        }
        
        const date = document.getElementById('tourDate').value;
        const time = document.getElementById('tourTime').value;
        const tourName = document.getElementById('tourName').value.trim();
        
        if (!date || !time || !tourName) {
            this.showToast('Please fill in all tour details', 'error');
            return;
        }
        
        // Get selected tour players
        const selectedTourPlayers = Array.from(document.querySelectorAll('#tourPlayersSelection input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.player);
        
        if (selectedTourPlayers.length !== 5) {
            this.showToast(`Please select exactly 5 tour players. Currently selected: ${selectedTourPlayers.length}`, 'error');
            return;
        }
        
        // Get tour IGL
        const tourIgl = document.getElementById('tourIglPlayer').value;
        if (!tourIgl) {
            this.showToast('Please select a Tournament IGL', 'error');
            return;
        }
        
        // Create tour object
        const tour = {
            id: Date.now().toString(),
            date: date,
            time: time,
            name: tourName,
            players: selectedTourPlayers,
            igl: tourIgl,
            status: 'scheduled',
            result: null,
            createdAt: new Date().toISOString()
        };
        
        this.tours.push(tour);
        this.saveTours();
        this.updateToursList();
        
        this.showToast(`Tour created successfully: ${tourName}`, 'success');
        this.clearTourForm();
        
        // Auto-save
        this.autoSave();
    }
    
    // Clear tour form
    clearTourForm() {
        document.getElementById('tourDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('tourTime').value = '19:00';
        document.getElementById('tourName').value = '';
        
        // Uncheck all checkboxes
        document.querySelectorAll('#tourPlayersSelection input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        // Reset tour IGL selection
        document.getElementById('tourIglPlayer').innerHTML = '<option value="">Select Tournament IGL</option>';
        
        // Update tour player counts
        this.updateTourPlayerCounts();
    }
    
    // Clear all tours
    clearAllTours() {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can clear all tours', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to clear ALL tours? This action cannot be undone.')) {
            this.tours = [];
            this.saveTours();
            this.updateToursList();
            this.showToast('All tours cleared successfully', 'success');
            this.autoSave();
        }
    }
    
    // Update tours list display
    updateToursList() {
        const toursList = document.getElementById('activeToursList');
        toursList.innerHTML = '';
        
        if (this.tours.length === 0) {
            toursList.innerHTML = '<p style="text-align: center; color: #cccccc;">No tours scheduled</p>';
            return;
        }
        
        // Sort tours by date (newest first)
        const sortedTours = [...this.tours].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedTours.forEach(tour => {
            const tourItem = document.createElement('div');
            tourItem.className = 'tour-item';
            
            const statusClass = tour.status === 'completed' ? 'completed' : 'scheduled';
            const resultButtons = tour.status === 'scheduled' ? `
                <div class="tour-result">
                    <button class="result-btn win" onclick="attendanceSystem.markTourResult('${tour.id}', 'win')">Mark Win</button>
                    <button class="result-btn lose" onclick="attendanceSystem.markTourResult('${tour.id}', 'lose')">Mark Loss</button>
                </div>
            ` : `<div class="tour-result"><strong>Result: ${tour.result}</strong></div>`;
            
            tourItem.innerHTML = `
                <div class="tour-header">
                    <div class="tour-title">${tour.name}</div>
                    <div class="tour-status ${statusClass}">${tour.status}</div>
                </div>
                <div class="tour-details">
                    <strong>Date:</strong> ${new Date(tour.date).toLocaleDateString()}<br>
                    <strong>Time:</strong> ${tour.time}<br>
                    <strong>IGL:</strong> <span class="tour-igl-player">${tour.igl}</span>
                </div>
                <div class="tour-players">
                    <h5>Tour Players (5)</h5>
                    <div class="tour-player-list">${tour.players.join(', ')}</div>
                </div>
                ${resultButtons}
            `;
            
            toursList.appendChild(tourItem);
        });
    }
    
    // Mark tour result
    markTourResult(tourId, result) {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can mark tour results', 'error');
            return;
        }
        
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;
        
        tour.status = 'completed';
        tour.result = result;
        
        this.saveTours();
        this.updateToursList();
        
        this.showToast(`Tour marked as ${result.toUpperCase()}`, 'success');
        
        // Auto-save
        this.autoSave();
    }
    
    // Update roster management display
    updateRosterManagement() {
        if (this.currentRole !== 'leader') {
            // Hide roster management for non-leaders
            const rosterSection = document.querySelector('.roster-management-section');
            if (rosterSection) {
                rosterSection.style.display = 'none';
            }
            return;
        }
        
        const rosterManagementGrid = document.getElementById('rosterManagementGrid');
        rosterManagementGrid.innerHTML = '';
        
        // Create main roster section
        const mainRosterSection = document.createElement('div');
        mainRosterSection.className = 'roster-category main-roster';
        mainRosterSection.innerHTML = '<h4>Main Roster</h4>';
        
        // Create academy section
        const academySection = document.createElement('div');
        academySection.className = 'roster-category academy';
        academySection.innerHTML = '<h4>Academy</h4>';
        
        // Add players to appropriate sections
        this.roster.forEach(player => {
            if (player.status === 'Active') {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-roster-item';
                
                if (player.rosterType === 'main') {
                    playerItem.innerHTML = `
                        <span class="player-roster-name">${player.name}</span>
                        <div class="roster-actions">
                            <button class="roster-btn move-to-academy" onclick="attendanceSystem.movePlayerToAcademy('${player.name}')">Move to Academy</button>
                        </div>
                    `;
                    mainRosterSection.appendChild(playerItem);
                } else {
                    playerItem.innerHTML = `
                        <span class="player-roster-name">${player.name}</span>
                        <div class="roster-actions">
                            <button class="roster-btn move-to-main" onclick="attendanceSystem.movePlayerToMain('${player.name}')">Move to Main</button>
                        </div>
                    `;
                    academySection.appendChild(playerItem);
                }
            }
        });
        
        rosterManagementGrid.appendChild(mainRosterSection);
        rosterManagementGrid.appendChild(academySection);
    }
    
    // Move player to main roster
    movePlayerToMain(playerName) {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can manage roster', 'error');
            return;
        }
        
        const player = this.roster.find(p => p.name === playerName);
        if (player) {
            player.rosterType = 'main';
            this.saveRoster();
            this.updateRosterManagement();
            this.updateStats();
            this.updateTourForm(); // Update tour form to include new main roster player
            this.showToast(`${playerName} moved to Main Roster`, 'success');
            this.autoSave();
        }
    }
    
    // Move player to academy
    movePlayerToAcademy(playerName) {
        if (this.currentRole !== 'leader') {
            this.showToast('Only leaders can manage roster', 'error');
            return;
        }
        
        const player = this.roster.find(p => p.name === playerName);
        if (player) {
            player.rosterType = 'academy';
            this.saveRoster();
            this.updateRosterManagement();
            this.updateStats();
            this.updateTourForm(); // Update tour form to exclude academy player
            this.showToast(`${playerName} moved to Academy`, 'success');
            this.autoSave();
        }
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceSystem = new AttendanceSystem();
});
