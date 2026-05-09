self.addEventListener('fetch', (event) => {
    // Memaksa browser mengambil data terbaru dari jaringan
    event.respondWith(fetch(event.request));
});
