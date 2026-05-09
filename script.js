const pendapatan = transactions.filter(t => t.code.startsWith('4')).reduce((s, t) => s + Math.abs(t.amount), 0);
const hpp = transactions.filter(t => t.code.startsWith('5')).reduce((s, t) => s + Math.abs(t.amount), 0);
const beban = transactions.filter(t => t.code.startsWith('6')).reduce((s, t) => s + Math.abs(t.amount), 0);

const labaKotor = pendapatan - hpp;
const labaBersih = labaKotor - beban;
