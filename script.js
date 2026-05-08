// Navigasi Halaman
function showPage(pageId, reportType = '') {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    if (reportType) renderReport(reportType);
}

// Logika Laporan
function renderReport(type) {
    const container = document.getElementById('report-container');
    let html = '';

    if (type === 'jurnal') {
        html = `<table><tr><th>Tgl</th><th>Ket</th><th>D/K</th></tr>`;
        transactions.forEach(t => {
            html += `<tr><td>${t.date}</td><td>${t.desc}</td><td class="text-right">Rp ${Math.abs(t.amount).toLocaleString()}</td></tr>`;
        });
        html += `</table>`;
    } 
    
    else if (type === 'labarugi') {
        const pendapatan = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const beban = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        html = `
            <div class="balance-card" style="border-color: #f0f">
                <p>Pendapatan: Rp ${pendapatan.toLocaleString()}</p>
                <p>Beban: Rp ${beban.toLocaleString()}</p>
                <hr>
                <h3>Laba Bersih: Rp ${(pendapatan - beban).toLocaleString()}</h3>
            </div>`;
    }

    else if (type === 'neraca') {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        html = `
            <table>
                <tr><th colspan="2">AKTIVA (Aset)</th></tr>
                <tr><td>Kas/Bank</td><td class="text-right">Rp ${total.toLocaleString()}</td></tr>
                <tr><th colspan="2">PASIVA (Modal)</th></tr>
                <tr><td>Modal Pemilik</td><td class="text-right">Rp ${total.toLocaleString()}</td></tr>
            </table>
            <p style="font-size: 10px; color: #888; margin-top: 10px;">*Neraca ini disederhanakan berdasarkan basis kas.</p>`;
    }

    container.innerHTML = html;
}
function updateUI() {
    const list = document.getElementById('transaction-list');
    const balanceDisplay = document.getElementById('total-balance');
    list.innerHTML = '';

    let total = 0;
    // Kita tambahkan parameter 'index' untuk menandai baris mana yang akan dihapus
    transactions.forEach((t, index) => {
        total += t.amount;
        const li = document.createElement('li');
        li.style.borderLeft = t.amount < 0 ? '4px solid #ff0055' : '4px solid #00ff88';
        
        li.innerHTML = `
            <div style="flex-grow: 1;">
                <strong>${t.desc}</strong><br>
                <small style="color: #888;">${t.date || ''}</small>
            </div>
            <div style="text-align: right; display: flex; align-items: center;">
                <span style="color: ${t.amount < 0 ? '#ff0055' : '#00ff88'}; margin-right: 15px;">
                    ${t.amount < 0 ? '-' : '+'} Rp ${Math.abs(t.amount).toLocaleString()}
                </span>
                <button onclick="deleteTransaction(${index})" 
                        style="background: none; border: none; color: #ff0055; cursor: pointer; font-size: 18px;">
                    🗑️
                </button>
            </div>
        `;
        list.appendChild(li);
    });

    balanceDisplay.innerText = `Rp ${total.toLocaleString()}`;
    balanceDisplay.style.color = total < 0 ? '#ff0055' : '#00ff88';
}
function deleteTransaction(index) {
    if (confirm('Hapus transaksi ini?')) {
        // Menghapus 1 item berdasarkan urutan (index)
        transactions.splice(index, 1);
        
        // Simpan perubahan ke penyimpanan browser
        saveData();
        
        // Perbarui tampilan layar
        updateUI();
        
        // Jika sedang membuka halaman laporan, perbarui juga datanya
        const activeReport = document.querySelector('.page.active').id;
        if (activeReport === 'page-laporan') {
            // Kita asumsikan fungsi renderReport terakhir dipanggil untuk tipe tertentu
            // Kamu bisa memanggil renderReport kembali jika perlu
            renderReport('jurnal'); 
        }
    }
}
