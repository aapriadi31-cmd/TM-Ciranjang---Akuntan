// KONFIGURASI FIREBASE ANDA
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 1. Ambil Data Summary (Laba Rugi)
function loadSummary() {
    db.collection('summary').doc('latest').onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('stat-sales').innerText = formatIDR(data.penjualan);
            document.getElementById('stat-expense').innerText = formatIDR(data.beban);
            document.getElementById('stat-profit').innerText = formatIDR(data.penjualan - data.beban);
        }
    });
}

// 2. Ambil Data Jurnal Transaksi
function loadJournal() {
    db.collection('transactions').orderBy('date', 'desc').limit(10).onSnapshot((snapshot) => {
        const journalBody = document.getElementById('journal-body');
        journalBody.innerHTML = '';
        snapshot.forEach((doc) => {
            const tr = doc.data();
            journalBody.innerHTML += `
                <tr>
                    <td>${tr.date}</td>
                    <td>${tr.desc}</td>
                    <td><span class="badge debit">${tr.debit}</span> <span class="badge kredit">${tr.kredit}</span></td>
                    <td class="amount-table">${formatIDR(tr.nominal)}</td>
                </tr>
            `;
        });
    });
}

// 3. Fungsi Simpan Transaksi
document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTransaction = {
        date: document.getElementById('date').value,
        desc: document.getElementById('desc').value,
        debit: document.getElementById('account-debit').value,
        kredit: document.getElementById('account-kredit').value,
        nominal: Number(document.getElementById('nominal').value)
    };

    try {
        await db.collection('transactions').add(newTransaction);
        alert("Transaksi Tersimpan!");
        toggleModal();
        document.getElementById('transaction-form').reset();
    } catch (err) {
        console.error(err);
    }
});

function formatIDR(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

function toggleModal() {
    const modal = document.getElementById('modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

// Jalankan saat load
loadSummary();
loadJournal();
