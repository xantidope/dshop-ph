// customer.js
let cart = [];

// Load Menu from Supabase
async function loadMenu() {
    try {
        const { data, error } = await supabase.from('menu_items').select('*').eq('is_available', true);
        if (error) throw error;
        
        const container = document.getElementById('menu-container');
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-2 text-center py-8">No menu items available.</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="bg-white rounded-lg shadow p-4 flex gap-4">
                <img src="${item.image_url || 'https://via.placeholder.com/100'}" class="w-20 h-20 rounded object-cover">
                <div class="flex-1">
                    <h3 class="font-bold">${item.name}</h3>
                    <p class="text-sm text-gray-500">${item.category || 'Food'}</p>
                    <p class="text-orange-500 font-bold mt-1">₱${item.price}</p>
                </div>
                <button onclick="addToCart(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})" class="self-center bg-orange-100 text-orange-500 px-3 py-1 rounded-full font-bold">+</button>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error loading menu:", err);
        document.getElementById('menu-container').innerHTML = '<p class="text-red-500 text-center py-8">Error loading menu. Check config.js keys.</p>';
    }
}

// Add Item to Cart
function addToCart(id, name, price) {
    cart.push({ id, name, price });
    updateCartUI();
}

// Update Cart Visuals
function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-count').innerText = cart.length;
    document.getElementById('cart-total').innerText = total.toFixed(2);
    document.getElementById('cart-items-count').innerText = cart.length;
    
    const cartBar = document.getElementById('cart-bar');
    if (cart.length > 0) {
        cartBar.classList.remove('hidden');
    } else {
        cartBar.classList.add('hidden');
    }
}

// Checkout Process
async function checkout() {
    const name = prompt("Enter your name:");
    const address = prompt("Enter delivery address:");
    if (!name || !address) return alert("Name and address are required.");

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    const { error } = await supabase.from('orders').insert({
        customer_name: name,
        delivery_address: address,
        items_json: cart,
        total_price: total,
        status: 'pending'
    });

    if (error) {
        alert("Error placing order: " + error.message);
    } else {
        alert("Order placed successfully! The admin will prepare your food.");
        cart = [];
        updateCartUI();
    }
}

// Initialize Customer App
loadMenu();