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
