let transactions = [];

export function initApp() {
    listenToCloud();
    document.getElementById('btn-simpan').addEventListener('click', addTransaction);
    
    // Default tanggal hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
}

// Navigasi Antar Halaman
window.showPage = function(pageId, reportType = '') {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if (reportType) renderReport(reportType);
}

// Mendengarkan Data dari Cloud (Real-time)
function listenToCloud() {
    const { db, fs } = window;
    const q = fs.query(fs.collection(db, "transactions"), fs.orderBy("date", "desc"));
    
    fs.onSnapshot(q, (snapshot) => {
        transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ docId: doc.id, ...doc.data() });
        });
        updateUI();
    });
}

// Tambah Transaksi ke Cloud
async function addTransaction() {
    const { db, fs } = window;
    const desc = document.getElementById('desc').value;
    const date = document.getElementById('transaction-date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!desc || isNaN(amount) || !date) return alert('Data tidak lengkap!');

    try {
        await fs.addDoc(fs.collection(db, "transactions"), {
            id: Date.now(),
            desc: desc,
            date: date,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount)
        });
        document.getElementById('desc').value = '';
        document.getElementById('amount').value = '';
    } catch (e) {
        alert("Gagal simpan: " + e);
    }
}

// Hapus Transaksi dari Cloud
window.deleteTransaction = async function(docId) {
    if (confirm('Hapus transaksi dari cloud?')) {
        const { db, fs } = window;
        await fs.deleteDoc(fs.doc(db, "transactions", docId));
    }
}

// Update Tampilan Utama
function updateUI() {
    const list = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('total-balance');
    let total = 0;
    list.innerHTML = '';

    transactions.forEach((t) => {
        total += t.amount;
        const li = document.createElement('li');
        li.className = "transaction-item";
        li.style.borderLeft = t.amount < 0 ? '4px solid #ff0055' : '4px solid #00ff88';
        li.innerHTML = `
            <div style="flex:1"><strong>${t.desc}</strong><br><small>${t.date}</small></div>
            <div style="display:flex; align-items:center">
                <span style="color:${t.amount < 0 ? '#ff0055' : '#00ff88'}">
                    Rp ${Math.abs(t.amount).toLocaleString()}
                </span>
                <button onclick="deleteTransaction('${t.docId}')" class="delete-btn">🗑️</button>
            </div>`;
        list.appendChild(li);
    });
    balanceDisplay.innerText = `Rp ${total.toLocaleString()}`;
    balanceDisplay.style.color = total < 0 ? '#ff0055' : '#00ff88';
}

// Generate Laporan
function renderReport(type) {
    const container = document.getElementById('report-container');
    const title = document.getElementById('report-title');
    let html = '';

    if (type === 'jurnal') {
        title.innerText = "JURNAL UMUM";
        html = `<table><tr><th>Tgl</th><th>Ket</th><th>Nominal</th></tr>`;
        transactions.forEach(t => {
            html += `<tr><td>${t.date}</td><td>${t.desc}</td><td class="text-right">${t.amount.toLocaleString()}</td></tr>`;
        });
        html += `</table>`;
    } else if (type === 'labarugi') {
        title.innerText = "LABA RUGI";
        const pendapatan = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const beban = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        html = `
            <div class="balance-card" style="border-color:#f0f">
                <p>Total Pendapatan: Rp ${pendapatan.toLocaleString()}</p>
                <p>Total Beban: Rp ${beban.toLocaleString()}</p>
                <hr>
                <h3>Laba Bersih: Rp ${(pendapatan - beban).toLocaleString()}</h3>
            </div>`;
    } else if (type === 'neraca') {
        title.innerText = "NERACA KEUANGAN";
        const kas = transactions.reduce((s, t) => s + t.amount, 0);
        html = `
            <table>
                <tr><th colspan="2">AKTIVA</th></tr>
                <tr><td>Kas & Bank</td><td class="text-right">Rp ${kas.toLocaleString()}</td></tr>
                <tr><th colspan="2">PASIVA</th></tr>
                <tr><td>Modal Pemilik</td><td class="text-right">Rp ${kas.toLocaleString()}</td></tr>
            </table>`;
    }
    container.innerHTML = html;
}
