let transactions = [];

export function initApp() {
    listenToCloud();
    document.getElementById('btn-simpan').addEventListener('click', addTransaction);
    document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
}

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
            desc, date,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount)
        });
        document.getElementById('desc').value = '';
        document.getElementById('amount').value = '';
    } catch (e) { alert("Gagal: " + e); }
}

window.deleteTransaction = async (docId) => {
    if (confirm('Hapus data?')) {
        await window.fs.deleteDoc(window.fs.doc(window.db, "transactions", docId));
    }
};

window.showPage = (pageId, reportType = '') => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if (reportType) renderReport(reportType);
};

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
                <span style="color:${t.amount < 0 ? '#ff0055' : '#00ff88'}">Rp ${Math.abs(t.amount).toLocaleString()}</span>
                <button onclick="deleteTransaction('${t.docId}')" style="background:none; border:none; margin-left:10px">🗑️</button>
            </div>`;
        list.appendChild(li);
    });
    balanceDisplay.innerText = `Rp ${total.toLocaleString()}`;
}

function renderReport(type) {
    const container = document.getElementById('report-container');
    const title = document.getElementById('report-title');
    let html = '';
    const sorted = [...transactions].sort((a,b) => new Date(a.date) - new Date(b.date));

    if (type === 'jurnal') {
        title.innerText = "JURNAL";
        html = `<table><tr><th>Tgl</th><th>Ket</th><th>Nominal</th></tr>`;
        sorted.forEach(t => html += `<tr><td>${t.date}</td><td>${t.desc}</td><td>${t.amount.toLocaleString()}</td></tr>`);
        html += `</table>`;
    } else if (type === 'labarugi') {
        title.innerText = "LABA RUGI";
        const pendapatan = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
        const beban = transactions.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
        html = `<div class="balance-card"><h3>Laba Bersih: Rp ${(pendapatan - beban).toLocaleString()}</h3></div>`;
    } else if (type === 'neraca') {
        title.innerText = "NERACA";
        const kas = transactions.reduce((s,t) => s + t.amount, 0);
        html = `<table><tr><td>Aset (Kas)</td><td>Rp ${kas.toLocaleString()}</td></tr><tr><td>Pasiva (Modal)</td><td>Rp ${kas.toLocaleString()}</td></tr></table>`;
    }
    container.innerHTML = html;
}
