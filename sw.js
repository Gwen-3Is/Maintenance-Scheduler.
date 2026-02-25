// sw.js - FIXED VERSION
let schedules = []; // Store schedules here

// Listen for messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SYNC_SCHEDULES') {
        schedules = event.data.schedules || [];
        console.log('Schedules updated:', schedules.length);
    }
});

function checkSchedules() {
    const now = new Date();
    
    schedules.forEach(task => {
        if (task.notified) return;
        
        const taskTime = new Date(task.date + 'T' + task.time);
        const diff = taskTime - now;
        
        // Notify if within 5 minutes and not past 1 hour overdue
        if (diff <= 300000 && diff > -3600000) {
            self.registration.showNotification('🔧 Maintenance Due!', {
                body: `${task.computer} - ${task.type} at ${task.time}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
                data: { taskId: task.id }
            });
            
            // Mark as notified to prevent repeats
            task.notified = true;
            
            // Notify main thread to update localStorage
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'TASK_DUE',
                        taskId: task.id
                    });
                });
            });
        }
    });
}

// Check every minute
setInterval(checkSchedules, 60000);
