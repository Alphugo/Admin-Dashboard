// Staff Dashboard JavaScript

let bookings = [];
let currentView = 'assignments';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadDashboardData();
    setupInactivityTimer();
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (!data.user) {
            window.location.href = '/login.html';
            return;
        }
        
        // Display user info
        document.getElementById('userInfo').textContent = `${data.user.full_name} (Staff)`;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login.html';
    });
    
    // Search
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchBookings(e.target.value);
    });
    
    // Close modal
    document.querySelector('#bookingDetailsModal .close')?.addEventListener('click', () => {
        document.getElementById('bookingDetailsModal').style.display = 'none';
    });
    document.getElementById('closeDetailsBtn')?.addEventListener('click', () => {
        document.getElementById('bookingDetailsModal').style.display = 'none';
    });
    
    // Add booking button
    document.getElementById('addBookingBtn')?.addEventListener('click', () => {
        document.getElementById('bookingModal').style.display = 'block';
    });
    
    // Close booking modal
    document.querySelector('#bookingModal .close')?.addEventListener('click', () => {
        document.getElementById('bookingModal').style.display = 'none';
    });
    
    document.getElementById('cancelBookingBtn')?.addEventListener('click', () => {
        document.getElementById('bookingModal').style.display = 'none';
    });
    
    // Booking form submit
    document.getElementById('addBookingForm')?.addEventListener('submit', handleAddBooking);
    
    // Update available rooms when dates change
    document.getElementById('checkInInput')?.addEventListener('change', updateAvailableRooms);
    document.getElementById('checkOutInput')?.addEventListener('change', updateAvailableRooms);
}

// Switch view
function switchView(viewName) {
    currentView = viewName;
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');
    
    // Load view-specific data
    if (viewName === 'assignments') {
        renderAssignments();
    } else if (viewName === 'today') {
        renderTodaysSchedule();
    } else if (viewName === 'checkins') {
        renderCheckIns();
    } else if (viewName === 'checkouts') {
        renderCheckOuts();
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load all bookings for availability checking and full display
        const allBookingsResponse = await fetch('/api/bookings');
        const allBookingsData = await allBookingsResponse.json();
        bookings = allBookingsData.bookings || [];
        
        // Also get staff-specific data for today's schedule
        const staffResponse = await fetch('/api/dashboard/staff');
        const staffData = await staffResponse.json();
        
        renderAssignments();
        renderTodaysSchedule();
        renderCheckIns();
        renderCheckOuts();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Render assignments
function renderAssignments(bookingsToRender = null) {
    const tbody = document.getElementById('assignmentsTableBody');
    const pendingCount = document.getElementById('pendingCount');
    const confirmedCount = document.getElementById('confirmedCount');
    
    if (!tbody) return;
    
    // Use provided bookings or all bookings
    const displayBookings = bookingsToRender || bookings;
    
    // Count pending and confirmed from ALL bookings (not filtered)
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    pendingCount.textContent = pendingBookings.length;
    confirmedCount.textContent = confirmedBookings.length;
    
    tbody.innerHTML = displayBookings.map(booking => `
        <tr>
            <td>${booking.guest_name}</td>
            <td>${booking.guest_email}<br><small>${booking.guest_phone || 'N/A'}</small></td>
            <td>${booking.room_type}</td>
            <td>${formatDate(booking.check_in)}</td>
            <td>${formatDate(booking.check_out)}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="viewBookingDetails('${booking.id}')">View</button>
                ${booking.status === 'pending' ? `
                    <button class="btn btn-small btn-success" onclick="confirmBooking('${booking.id}')">Confirm</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Render today's schedule
function renderTodaysSchedule() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayCheckIns = bookings.filter(b => b.check_in === today);
    const todayCheckOuts = bookings.filter(b => b.check_out === today);
    
    document.getElementById('todayCheckIns').innerHTML = todayCheckIns.map(booking => `
        <div class="schedule-item">
            <strong>${booking.guest_name}</strong>
            <span>${booking.room_type}</span>
            <button class="btn btn-small btn-secondary" onclick="viewBookingDetails('${booking.id}')">Details</button>
        </div>
    `).join('') || '<p>No check-ins today</p>';
    
    document.getElementById('todayCheckOuts').innerHTML = todayCheckOuts.map(booking => `
        <div class="schedule-item">
            <strong>${booking.guest_name}</strong>
            <span>${booking.room_type}</span>
            <button class="btn btn-small btn-secondary" onclick="viewBookingDetails('${booking.id}')">Details</button>
        </div>
    `).join('') || '<p>No check-outs today</p>';
}

// Render check-ins
function renderCheckIns() {
    const tbody = document.getElementById('checkInsTableBody');
    if (!tbody) return;
    
    const today = new Date();
    const upcomingCheckIns = bookings.filter(b => new Date(b.check_in) >= today);
    
    tbody.innerHTML = upcomingCheckIns.map(booking => `
        <tr>
            <td>${booking.guest_name}</td>
            <td>${booking.room_type}</td>
            <td>${formatDate(booking.check_in)}</td>
            <td>${booking.guest_email}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="viewBookingDetails('${booking.id}')">View</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align: center;">No upcoming check-ins</td></tr>';
}

// Render check-outs
function renderCheckOuts() {
    const tbody = document.getElementById('checkOutsTableBody');
    if (!tbody) return;
    
    const today = new Date();
    const upcomingCheckOuts = bookings.filter(b => new Date(b.check_out) >= today);
    
    tbody.innerHTML = upcomingCheckOuts.map(booking => `
        <tr>
            <td>${booking.guest_name}</td>
            <td>${booking.room_type}</td>
            <td>${formatDate(booking.check_out)}</td>
            <td>${booking.guest_email}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="viewBookingDetails('${booking.id}')">View</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align: center;">No upcoming check-outs</td></tr>';
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    document.getElementById('bookingDetailsContent').innerHTML = `
        <div class="details-group">
            <strong>Guest Information:</strong>
            <p>Name: ${booking.guest_name}</p>
            <p>Email: ${booking.guest_email}</p>
            <p>Phone: ${booking.guest_phone || 'N/A'}</p>
        </div>
        <div class="details-group">
            <strong>Booking Information:</strong>
            <p>Room Type: ${booking.room_type}</p>
            <p>Check-in: ${formatDate(booking.check_in)}</p>
            <p>Check-out: ${formatDate(booking.check_out)}</p>
            <p>Status: ${booking.status}</p>
        </div>
    `;
    
    document.getElementById('bookingDetailsModal').style.display = 'block';
    document.getElementById('confirmBookingBtn').onclick = () => confirmBooking(bookingId);
}

// Confirm booking
async function confirmBooking(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'confirmed' })
        });
        
        if (response.ok) {
            alert('Booking confirmed successfully!');
            document.getElementById('bookingDetailsModal').style.display = 'none';
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error confirming booking:', error);
        alert('Failed to confirm booking');
    }
}

// Search bookings
function searchBookings(query) {
    // If search is empty, show all bookings
    if (!query || query.trim() === '') {
        renderAssignments();
        return;
    }
    
    const searchLower = query.toLowerCase();
    const filteredBookings = bookings.filter(booking => 
        booking.guest_name.toLowerCase().includes(searchLower) ||
        booking.guest_email.toLowerCase().includes(searchLower) ||
        booking.room_type.toLowerCase().includes(searchLower) ||
        booking.status.toLowerCase().includes(searchLower)
    );
    
    renderAssignments(filteredBookings);
}

// Setup inactivity timer
let inactivityTimer;
function setupInactivityTimer() {
    const inactivityPeriod = 30 * 60 * 1000; // 30 minutes
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            alert('Session expired due to inactivity. Please login again.');
            fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login.html';
        }, inactivityPeriod);
    }
    
    // Reset timer on user activity
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

// Update available rooms based on selected dates
function updateAvailableRooms() {
    const checkInInput = document.getElementById('checkInInput');
    const checkOutInput = document.getElementById('checkOutInput');
    const roomTypeSelect = document.getElementById('roomTypeSelect');
    
    if (!checkInInput || !checkOutInput || !roomTypeSelect) return;
    
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    
    if (!checkIn || !checkOut) {
        return;
    }
    
    // Get confirmed bookings that overlap with the selected dates
    const conflictingBookings = bookings.filter(b => {
        if (b.status !== 'confirmed') return false;
        
        const bookingCheckIn = new Date(b.check_in);
        const bookingCheckOut = new Date(b.check_out);
        const selectedCheckIn = new Date(checkIn);
        const selectedCheckOut = new Date(checkOut);
        
        // Check for overlap: booking overlaps if new check_in < existing check_out AND new check_out > existing check_in
        return bookingCheckIn < selectedCheckOut && bookingCheckOut > selectedCheckIn;
    });
    
    // Count occupied rooms by type
    const occupiedRooms = {};
    conflictingBookings.forEach(booking => {
        const roomType = booking.room_type;
        occupiedRooms[roomType] = (occupiedRooms[roomType] || 0) + 1;
    });
    
    // Total rooms available by type (only Standard rooms exist)
    const totalRooms = {
        'standard': 4
    };
    
    // Populate room select with availability info
    const availableRooms = [];
    
    // Standard rooms
    const standardOccupied = occupiedRooms['standard'] || 0;
    const standardAvailable = totalRooms['standard'] - standardOccupied;
    
    if (standardAvailable > 0) {
        availableRooms.push(`<option value="standard">Standard (${standardAvailable} available)</option>`);
    } else {
        availableRooms.push(`<option value="standard" disabled>Standard (Fully Booked)</option>`);
    }
    
    // Update select
    const currentValue = roomTypeSelect.value;
    roomTypeSelect.innerHTML = '<option value="">Select Room Type</option>' + availableRooms.join('');
    
    // Restore previous selection if still available
    if (currentValue && roomTypeSelect.querySelector(`option[value="${currentValue}"]`)) {
        roomTypeSelect.value = currentValue;
    }
}

// Handle add booking
async function handleAddBooking(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const adults = parseInt(formData.get('adults')) || 0;
    const kids = parseInt(formData.get('kids')) || 0;
    const visitTime = formData.get('visit_time');
    const cottage = formData.get('cottage');
    
    // Calculate entrance fees
    const adultPrice = visitTime === 'morning' ? 70 : visitTime === 'night' ? 120 : 0;
    const kidPrice = visitTime === 'morning' ? 60 : visitTime === 'night' ? 100 : 0;
    const entranceFee = (adults * adultPrice) + (kids * kidPrice);
    
    // Calculate cottage fee
    const cottagePrices = {
        'tropahan': 300,
        'barkads': 400,
        'family': 500
    };
    const cottageFee = cottage ? (cottagePrices[cottage] || 0) : 0;
    
    // Calculate total guest count (adults + kids)
    const guestCount = adults + kids;
    
    const bookingData = {
        guest_name: formData.get('guest_name'),
        guest_email: formData.get('guest_email'),
        guest_phone: formData.get('guest_phone'),
        adults: adults,
        kids: kids,
        visit_time: visitTime,
        cottage: cottage || null,
        entrance_fee: entranceFee,
        cottage_fee: cottageFee,
        guest_count: guestCount,
        room_type: formData.get('room_type'),
        check_in: formData.get('check_in'),
        check_out: formData.get('check_out'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
        status: formData.get('status')
    };
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Failed to create booking');
            return;
        }
        
        document.getElementById('bookingModal').style.display = 'none';
        document.getElementById('addBookingForm').reset();
        loadDashboardData();
        alert('Booking created successfully!');
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('An error occurred');
    }
}

// Set date inputs to today's date
window.addEventListener('load', () => {
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.querySelector('input[name="check_in"]');
    if (checkInInput) {
        checkInInput.min = today;
    }
    const checkOutInput = document.querySelector('input[name="check_out"]');
    if (checkOutInput) {
        checkOutInput.min = today;
    }
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
