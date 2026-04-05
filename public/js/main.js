document.addEventListener('DOMContentLoaded', () => {
    // Fetch stats
    fetchStats();
    // Fetch bin status
    fetchBins();
    // Fetch notifications
    fetchNotifications();

    // Auto refresh data every 30 seconds to simulate real-time updates
    setInterval(() => {
        fetchStats();
        fetchBins();
    }, 30000);
});

async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (document.getElementById('daily-collected')) document.getElementById('daily-collected').textContent = data.total_collected.daily + ' kg';
        if (document.getElementById('weekly-trend')) document.getElementById('weekly-trend').textContent = data.trend;
        if (document.getElementById('recycling-rate')) document.getElementById('recycling-rate').textContent = Math.round((data.segregation.recyclable / 100) * 100) + '%';
        if (document.getElementById('eco-score')) document.getElementById('eco-score').textContent = data.sustainability_score;

        initSegregationChart(data.segregation);
        if (data.historical) {
            initWeeklyChart(data.historical);
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

async function fetchBins() {
    try {
        const response = await fetch('/api/bins');
        const { data } = await response.json();
        
        const binList = document.getElementById('bin-list') || document.getElementById('locations-list');
        if (!binList) return;
        binList.innerHTML = '';
        
        let fullBinsCount = 0;

        data.forEach(bin => {
            if (bin.status.toLowerCase() === 'full') {
                fullBinsCount++;
            }

            const iconClass = bin.type.toLowerCase() === 'recyclable' ? 'recyclable' : 
                              bin.type.toLowerCase() === 'wet' ? 'wet' : 'dry';
            
            const iconFa = bin.type.toLowerCase() === 'recyclable' ? 'fa-bottle-water' : 
                           bin.type.toLowerCase() === 'wet' ? 'fa-apple-whole' : 'fa-box';

            const statusClass = bin.status.toLowerCase() === 'low' ? 'status-low' :
                                bin.status.toLowerCase() === 'medium' ? 'status-medium' : 'status-full';
            
            let progressColor = '#4CAF50';
            if(bin.fill_level > 50 && bin.fill_level <= 80) progressColor = '#FF9800';
            if(bin.fill_level > 80) progressColor = '#F44336';

            const binHTML = `
                <div class="bin-item">
                    <div class="bin-info">
                        <div class="bin-icon ${iconClass}">
                            <i class="fa-solid ${iconFa}"></i>
                        </div>
                        <div class="bin-details">
                            <h4>${bin.location}</h4>
                            <p>${bin.type} Waste</p>
                        </div>
                    </div>
                    <div class="bin-status">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${bin.fill_level}%; background-color: ${progressColor}"></div>
                        </div>
                        <span class="status-badge ${statusClass}">${bin.fill_level}%</span>
                    </div>
                </div>
            `;
            binList.insertAdjacentHTML('beforeend', binHTML);
        });

        if (document.getElementById('active-alerts')) {
            document.getElementById('active-alerts').textContent = fullBinsCount;
        }

    } catch (error) {
        console.error('Error fetching bins:', error);
    }
}

async function fetchNotifications() {
    try {
        const response = await fetch('/api/notifications');
        const { data } = await response.json();
        
        const notifList = document.getElementById('notification-list');
        if (!notifList) return;
        notifList.innerHTML = '';
        
        data.forEach(notif => {
            let iconClass = '';
            if(notif.type === 'alert') iconClass = 'fa-triangle-exclamation';
            if(notif.type === 'awareness') iconClass = 'fa-lightbulb';
            if(notif.type === 'success') iconClass = 'fa-leaf';

            const notifHTML = `
                <div class="notification-item ${notif.type}">
                    <div class="notif-icon">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="notif-content">
                        <p>${notif.message}</p>
                        <small>Just now</small>
                    </div>
                </div>
            `;
            notifList.insertAdjacentHTML('beforeend', notifHTML);
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

let segregationChartInstance = null;
let weeklyChartInstance = null;

function initSegregationChart(data) {
    const ctx = document.getElementById('segregationChart');
    if (!ctx) return;

    if (segregationChartInstance) {
        segregationChartInstance.destroy();
    }

    segregationChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wet', 'Dry', 'Recyclable'],
            datasets: [{
                data: [data.wet, data.dry, data.recyclable],
                backgroundColor: ['#8BC34A', '#03A9F4', '#FFC107'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, font: { family: "'Inter', sans-serif" } }
                }
            }
        }
    });
}

function initWeeklyChart(data) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                { label: 'Wet', data: data.wet, backgroundColor: '#8BC34A' },
                { label: 'Dry', data: data.dry, backgroundColor: '#03A9F4' },
                { label: 'Recyclable', data: data.recyclable, backgroundColor: '#FFC107' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, font: { family: "'Inter', sans-serif" } }
                }
            }
        }
    });
}
