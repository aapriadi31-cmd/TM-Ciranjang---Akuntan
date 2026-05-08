let transactions = [];

export function initApp() {
    listenToCloud();
    document.getElementById('btn-simpan').addEventListener('click', addTransaction);
}

// Navigasi
window.showPage = function(pageId, reportType = '') {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if (reportType) renderReport(reportType);
}

// Ambil Data Real-time
function listenToCloud() {
    const { db, fs } = window;
    const q = fs.query(fs.collection(db, "transactions"), fs.orderBy("id", "desc"));
    
    fs.onSnapshot(q, (snapshot) => {
        transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ docId: doc.id, ...doc.data() });
        });
        updateUI();
    });
}

// Tambah Data
async function addTransaction() {
    const { db, fs } = window;
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!desc || isNaN(amount)) return alert('Isi data dengan benar!');

    try {
        await fs.addDoc(fs.collection(db, "transactions"), {
            id: Date.now(),
            desc: desc,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            date: new Date().toLocaleDateString('id-ID')
        });
        document.getElementById('desc').value = '';
        document.getElementById('amount').value = '';
    } catch (e) {
        alert("Error simpan: " + e);
    }
}

// Hapus Data
window.deleteTransaction = async function(docId) {
    if (confirm('Hapus dari cloud?')) {
        const { db, fs } = window;
        await fs.deleteDoc(fs.doc(db, "transactions", docId));
    }
}

function updateUI() {
    const list = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('total-balance');
    let total = 0;
    list.innerHTML = '';

    transactions.forEach((t) => {
        total += t.amount;
        const li = document.createElement('li');
        li.style.borderLeft = t.amount < 0 ? '4px solid #ff0055' : '4px solid #00ff88';
        li.innerHTML = `
            <div style="flex:1"><strong>${t.desc}</strong><br><small>${t.date}</small></div>
            <div style="display:flex; align-items:center">
                <span style="color:${t.amount < 0 ? '#ff0055' : '#00ff88'}">
                    Rp ${Math.abs(t.amount).toLocaleString()}
                </span>
                <button onclick="deleteTransaction('${t.docId}')" style="background:none; border:none; margin-left:10px">🗑️</button>
            </div>`;
        list.appendChild(li);
    });
    balanceDisplay.innerText = `Rp ${total.toLocaleString()}`;
}

function renderReport(type) {
    const container = document.getElementById('report-container');
    let html = '';
    if (type === 'jurnal') {
        html = `<table><tr><th>Tgl</th><th>Ket</th><th>Nominal</th></tr>`;
        transactions.forEach(t => {
            html += `<tr><td>${t.date}</td><td>${t.desc}</td><td>${t.amount.toLocaleString()}</td></tr>`;
        });
        html += `</table>`;
    } else if (type === 'labarugi') {
        const pendapatan = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const beban = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        html = `<div class="balance-card"><h3>Laba Bersih: Rp ${(pendapatan - beban).toLocaleString()}</h3></div>`;
    } else if (type === 'neraca') {
        const total = transactions.reduce((s, t) => s + t.amount, 0);
        html = `<table><tr><td>Kas</td><td>Rp ${total.toLocaleString()}</td></tr><tr><td>Modal</td><td>Rp ${total.toLocaleString()}</td></tr></table>`;
    }
    container.innerHTML = html;
}
