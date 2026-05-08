let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function addTransaction() {
    const desc = document.getElementById('desc').value;
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;

    if (desc === '' || amount === '') return alert('Isi semua bidang!');

    const transaction = {
        id: Date.now(),
        desc,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount)
    };

    transactions.push(transaction);
    updateUI();
    saveData();
}

function updateUI() {
    const list = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('total-balance');
    list.innerHTML = '';

    let total = 0;
    transactions.forEach(t => {
        total += t.amount;
        const li = document.createElement('li');
        li.innerHTML = `${t.desc} <span>Rp ${t.amount.toLocaleString()}</span>`;
        list.appendChild(li);
    });

    balanceDisplay.innerText = `Rp ${total.toLocaleString()}`;
}

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

updateUI();
