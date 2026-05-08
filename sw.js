/* Navigasi Bawah */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #1a1a1a;
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    border-top: 1px solid #0ff;
    box-shadow: 0 -5px 15px rgba(0, 255, 255, 0.1);
}

.bottom-nav button {
    background: none;
    border: none;
    color: #888;
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px;
    cursor: pointer;
}

.bottom-nav button:hover { color: #0ff; text-shadow: 0 0 5px #0ff; }

/* Pengaturan Halaman */
.page { display: none; margin-bottom: 80px; }
.page.active { display: block; }

/* Tabel Laporan */
table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
th { border-bottom: 2px solid #0ff; color: #0ff; padding: 10px; text-align: left; }
td { padding: 10px; border-bottom: 1px solid #333; }
.text-right { text-align: right; }
.neon-text-small { font-size: 18px; text-align: center; color: #f0f; text-shadow: 0 0 5px #f0f; }

