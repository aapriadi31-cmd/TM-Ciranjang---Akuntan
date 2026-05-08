let transactions = [];

export function initApp() {export function initApp() {
    listenToCloud();
    document.getElementById('btn-simpan').addEventListener('click', addTransaction);
    
    // Set default tanggal ke hari ini (WIB)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
}

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
    const selectedDate = document.getElementById('transaction-date').value; // Ambil tanggal input

    if (!desc || isNaN(amount) || !selectedDate) return alert('Isi data dengan benar!');

    try {
        await fs.addDoc(fs.collection(db, "transactions"), {
            id: Date.now(),
            desc: desc,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            date: selectedDate // Simpan tanggal yang dipilih user
        });
        
        // Reset form tapi biarkan tanggal tetap di hari ini
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
    
    // Urutkan transaksi berdasarkan tanggal (paling baru di atas)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    if (type === 'jurnal') {
        html = `<table><tr><th>Tgl</th><th>Ket</th><th>Nominal</th></tr>`;
        sortedTransactions.forEach(t => {
            // Format tanggal agar lebih enak dibaca (DD/MM/YYYY)
            const displayDate = new Date(t.date).toLocaleDateString('id-ID');
            html += `<tr><td>${displayDate}</td><td>${t.desc}</td><td>${t.amount.toLocaleString()}</td></tr>`;
        });
        html += `</table>`;
    }
    // ... sisa kode labarugi dan neraca tetap sama
    container.innerHTML = html;
}

