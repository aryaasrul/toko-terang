// app.js FINAL TERSTRUKTUR
import { supabase } from './supabase.js';

const productSelect = document.getElementById('productSelect');
const orderTable = document.getElementById('orderTable');
const productTable = document.getElementById('productTable');
const historyTable = document.getElementById('historyTable');
const totalOmzet = document.getElementById('totalOmzet');
const totalLaba = document.getElementById('totalLaba');
const produkTerlaris = document.getElementById('terlaris');

let products = [];
let orders = [];

// === LOAD PRODUK ===
async function loadProducts() {
  const { data, error } = await supabase.from('products').select();
  if (!error) {
    products = data;
    productSelect.innerHTML = '';
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      productSelect.appendChild(opt);
    });
    renderProductTable();
  }
}

function renderProductTable() {
  productTable.innerHTML = '';
  products.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${p.name}</td><td>Rp ${p.price}</td><td>Rp ${p.hpp}</td>`;
    productTable.appendChild(row);
  });
}

// === TAMBAH PRODUK ===
window.addProduct = async function () {
  const name = document.getElementById('newName').value;
  const price = parseInt(document.getElementById('newPrice').value);
  const hpp = parseInt(document.getElementById('newHpp').value);
  if (!name || !price || !hpp) return alert('Lengkapi semua kolom');
  const { error } = await supabase.from('products').insert([{ name, price, hpp }]);
  if (!error) {
    await loadProducts();
    document.getElementById('newName').value = '';
    document.getElementById('newPrice').value = '';
    document.getElementById('newHpp').value = '';
  }
}

// === TAMBAH ORDER ===
window.addOrder = async function () {
  const productId = productSelect.value;
  const qty = parseInt(document.getElementById('quantityInput').value);
  const product = products.find(p => p.id == productId);
  if (!product || qty < 1) return;

  const order = {
    name: product.name,
    price: product.price,
    hpp: product.hpp,
    quantity: qty,
    date: new Date().toISOString()
  };

  const { error } = await supabase.from('orders').insert([order]);
  if (!error) loadOrders();
}

// === LOAD ORDER HARIAN ===
async function loadOrders() {
  const { data, error } = await supabase.from('orders').select();
  if (!error) {
    orders = data;
    renderOrderTable();
    renderStats();
    renderHistoryTable();
  }
}

// === TABEL PENJUALAN HARIAN ===
function renderOrderTable() {
  const today = new Date().toDateString();
  orderTable.innerHTML = '';
  orders.filter(o => new Date(o.date).toDateString() === today).forEach((o, i) => {
    const laba = (o.price - o.hpp) * o.quantity;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${o.name}</td>
      <td>${o.quantity}</td>
      <td>Rp ${o.price}</td>
      <td>Rp ${o.hpp}</td>
      <td>Rp ${laba}</td>
      <td><button onclick="deleteOrder(${i})">Hapus</button></td>`;
    orderTable.appendChild(row);
  });
}

// === HAPUS ORDER ===
window.deleteOrder = async function (index) {
  const todayOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
  const order = todayOrders[index];
  if (!order) return;
  await supabase.from('orders').delete().eq('id', order.id);
  loadOrders();
}

// === STATISTIK ===
function renderStats() {
  const today = new Date().toDateString();
  const filtered = orders.filter(o => new Date(o.date).toDateString() === today);
  let total = 0, laba = 0;
  let count = {};

  filtered.forEach(o => {
    total += o.price * o.quantity;
    laba += (o.price - o.hpp) * o.quantity;
    count[o.name] = (count[o.name] || 0) + o.quantity;
  });
  const terlaris = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  totalOmzet.textContent = 'Rp ' + total.toLocaleString();
  totalLaba.textContent = 'Rp ' + laba.toLocaleString();
  produkTerlaris.textContent = terlaris;
}

// === RIWAYAT PENJUALAN ===
window.renderHistoryTable = function () {
  historyTable.innerHTML = '';
  let filtered = [...orders];
  const tanggal = document.getElementById('filterDate').value;
  const sort = document.getElementById('sortDirection').value;

  if (tanggal) {
    filtered = filtered.filter(o => o.date.slice(0, 10) === tanggal);
  }

  filtered.sort((a, b) => sort === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));

  filtered.forEach(o => {
    const laba = (o.price - o.hpp) * o.quantity;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${o.date.slice(0, 10)}</td>
      <td>${o.name}</td>
      <td>${o.quantity}</td>
      <td>Rp ${o.price}</td>
      <td>Rp ${o.hpp}</td>
      <td>Rp ${laba}</td>`;
    historyTable.appendChild(row);
  });
}

// === DOWNLOAD EXCEL ===
window.downloadExcel = function () {
  const wb = XLSX.utils.book_new();
  const data = [['Tanggal', 'Produk', 'Qty', 'Harga', 'HPP', 'Laba']];
  orders.forEach(o => {
    const laba = (o.price - o.hpp) * o.quantity;
    data.push([o.date.slice(0, 10), o.name, o.quantity, o.price, o.hpp, laba]);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Riwayat');
  XLSX.writeFile(wb, 'Laporan_Toko_Terang.xlsx');
}

loadProducts();
loadOrders();