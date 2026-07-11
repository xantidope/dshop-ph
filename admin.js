// admin.js

// Load Dashboard Stats and Orders
async function loadDashboard() {
    try {
        // Fetch Data
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        const { data: riders } = await supabase.from('riders').select('*');
        
        // Calculate Stats
        const revenue = orders ? orders.reduce((sum, o) => sum + (o.total_price || 0), 0) : 0;
        const pendingCount = orders ? orders.filter(o => o.status === 'pending').length : 0;
        const onlineRiders = riders ? riders.filter(r => r.is_online).length : 0;
        const totalRiders = riders ? riders.length : 0;

        // Update UI Stats
        document.getElementById('stat-revenue').innerText = revenue.toFixed(2);
        document.getElementById('stat-orders').innerText = orders ? orders.length : 0;
        document.getElementById('stat-riders').innerText = `${onlineRiders} <span class="text-sm text-gray-500">of ${totalRiders} total</span>`;
        
        // Update Pending Badge (if element exists)
        const pendingBadge = document.getElementById('pending-count');
        if(pendingBadge) pendingBadge.innerText = pendingCount;

        // Render Orders Table
        const tbody = document.getElementById('orders-table-body');
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No orders yet.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#${o.id}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${o.customer_name}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">₱${o.total_price}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(o.status)}">
                        ${o.status.replace('_', ' ')}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    ${getActionButtons(o.id, o.status)}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

// Helper: Get Color for Status Badge
function getStatusColor(status) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        out_for_delivery: 'bg-purple-100 text-purple-800',
        delivered: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Helper: Generate Action Buttons based on Status
function getActionButtons(orderId, status) {
    if (status === 'pending') return `<button onclick="updateStatus(${orderId}, 'preparing')" class="text-blue-600 hover:underline font-bold">Start Prep</button>`;
    if (status === 'preparing') return `<button onclick="updateStatus(${orderId}, 'ready')" class="text-green-600 hover:underline font-bold">Mark Ready</button>`;
    if (status === 'ready') return `<span class="text-gray-500 italic">Waiting for Rider...</span>`;
    if (status === 'out_for_delivery') return `<button onclick="updateStatus(${orderId}, 'delivered')" class="text-purple-600 hover:underline font-bold">Mark Delivered</button>`;
    if (status === 'delivered') return `<span class="text-gray-400">Completed</span>`;
    return '';
}

// Update Order Status
async function updateStatus(orderId, newStatus) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) alert("Error updating order: " + error.message);
    else loadDashboard(); // Refresh UI
}

// Tab Switching Logic
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// Initialize Admin Dashboard
loadDashboard();

// Auto-refresh the dashboard every 3 seconds to catch new orders instantly
setInterval(loadDashboard, 3000);