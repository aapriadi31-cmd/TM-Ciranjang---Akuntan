let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function addTransaction() {
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!desc || isNaN(amount)) {
        alert('Data tidak valid, periksa kembali!');
        return;
    }

    const transaction = {
        id: Date.now(),
        desc,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        date: new Date().toLocaleDateString('id-ID')
    };

    transactions.push(transaction);
    updateUI();
    saveData();
    
    // Reset form
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
}

function updateUI() {
    const list = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('total-balance');
    list.innerHTML = '';

    let total = 0;
    transactions.forEach((t, index) => {
        total += t.amount;
        const li = document.createElement('li');
        // Warna neon berbeda untuk masuk/keluar
        li.style.borderLeft = t.amount < 0 ? '4px solid #ff0055' : '4px solid #00ff88';
        li.innerHTML = `
            <div>
                <strong>${t.desc}</strong><br>
                <small style="color: #888;">${t.date}</small>
            </div>
            <span style="color: ${t.amount < 0 ? '#ff0055' : '#00ff88'}">
                ${t.amount < 0 ? '-' : '+'} Rp ${Math.abs(t.amount).toLocaleString()}
            </span>
        `;
        list.appendChild(li);
    });

    balanceDisplay.innerText = `Rp ${total.toLocaleString()}`;
    balanceDisplay.style.color = total < 0 ? '#ff0055' : '#00ff88';
}

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fungsi Tambahan: Download Data (Backup)
function exportData() {
    const dataStr = JSON.stringify(transactions);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'backup_akuntansi.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

updateUI();
