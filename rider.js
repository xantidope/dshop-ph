// rider.js
let isOnline = false;
// NOTE: In a real app, get this from Supabase Auth. For prototype, we hardcode ID 1.
const currentRiderId = 1; 

// Toggle Rider Online/Offline Status
async function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('toggle-btn');
    const badge = document.getElementById('status-badge');
    
    if (isOnline) {
        btn.innerText = "GO OFFLINE";
        btn.className = "w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg shadow mb-6 text-lg";
        badge.innerText = "ONLINE";
        badge.className = "bg-green-500 px-3 py-1 rounded-full text-sm font-bold";
        await supabase.from('riders').update({ is_online: true }).eq('id', currentRiderId);
        loadJobs();
    } else {
        btn.innerText = "GO ONLINE";
        btn.className = "w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow mb-6 text-lg";
        badge.innerText = "OFFLINE";
        badge.className = "bg-red-500 px-3 py-1 rounded-full text-sm font-bold";
        await supabase.from('riders').update({ is_online: false }).eq('id', currentRiderId);
        document.getElementById('jobs-container').innerHTML = '<p class="text-center text-gray-500 py-8">Go online to see available jobs.</p>';
    }
}

// Fetch Available Jobs (Orders marked 'ready' without a rider)
async function loadJobs() {
    if (!isOnline) return;
    
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ready')
        .is('rider_id', null);
    
    const container = document.getElementById('jobs-container');
    if (error || !data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">No available jobs right now. Please wait.</p>';
        return;
    }

    container.innerHTML = data.map(order => `
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div class="flex justify-between mb-2">
                <span class="font-bold">Order #${order.id}</span>
                <span class="text-green-600 font-bold">₱${order.total_price}</span>
            </div>
            <p class="text-sm text-gray-600 mb-1">📍 ${order.delivery_address}</p>
            <p class="text-sm text-gray-500 mb-4">Items: ${order.items_json.map(i => i.name).join(', ')}</p>
            <button onclick="acceptJob(${order.id})" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded">
                Accept Job
            </button>
        </div>
    `).join('');
}

// Accept a Delivery Job
async function acceptJob(orderId) {
    const { error } = await supabase.from('orders').update({ 
        status: 'out_for_delivery', 
        rider_id: currentRiderId 
    }).eq('id', orderId);

    if (!error) {
        alert("Job Accepted! Proceed to pickup location.");
        loadJobs(); // Refresh the list
    } else {
        alert("Error accepting job. Someone else might have taken it.");
    }
}

// Auto-refresh jobs every 5 seconds when online
setInterval(() => {
    if (isOnline) loadJobs();
}, 5000);