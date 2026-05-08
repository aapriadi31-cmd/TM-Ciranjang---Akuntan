// Navigasi Halaman
function showPage(pageId, reportType = '') {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    if (reportType) renderReport(reportType);
}

// Kita tidak lagi pakai array lokal, tapi mendengarkan database cloud
const { db, fs } = window;

// Ambil data secara Real-Time dari Cloud
function listenToCloud() {
    const q = fs.query(fs.collection(db, "transactions"), fs.orderBy("id", "desc"));
    
    fs.onSnapshot(q, (snapshot) => {
        transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ docId: doc.id, ...doc.data() });
        });
        updateUI(); // Tampilan otomatis update tiap ada perubahan di Cloud
    });
}

// Tambah Transaksi ke Cloud
async function addTransaction() {
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!desc || isNaN(amount)) return alert('Data tidak valid!');

    const newDate = new Date().toLocaleDateString('id-ID');
    
    await fs.addDoc(fs.collection(db, "transactions"), {
        id: Date.now(),
        desc: desc,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        date: newDate
    });

    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
}

// Hapus Transaksi dari Cloud
async function deleteTransaction(docId) {
    if (confirm('Hapus data dari cloud?')) {
        await fs.deleteDoc(fs.doc(db, "transactions", docId));
    }
}

// Jalankan fungsi pendengar cloud saat aplikasi dibuka
setTimeout(listenToCloud, 1000); 
