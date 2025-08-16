// ============================
// Data Storage
// ============================
let entries = JSON.parse(localStorage.getItem("entries")) || [];

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

// ============================
// Utility Functions
// ============================
function calcAmazonPay(packages) {
  if (packages <= 25) {
    return packages * 2;
  } else {
    return 25 * 2 + (packages - 25) * 1.5;
  }
}

function calcDriverPay(packages) {
  return packages * 1;
}

function formatCurrency(num) {
  return "$" + num.toFixed(2);
}

// ============================
// Add Entry
// ============================
document.getElementById("entry-form").addEventListener("submit", e => {
  e.preventDefault();
  const date = document.getElementById("entry-date").value;
  const driver = document.getElementById("entry-driver").value.trim();
  const business = document.getElementById("entry-business").value.trim();
  const packages = parseInt(document.getElementById("entry-packages").value, 10);

  const amazonPay = calcAmazonPay(packages);
  const driverPay = calcDriverPay(packages);
  const profit = amazonPay - driverPay;

  entries.push({
    date, driver, business, packages,
    amazonPay, driverPay, profit,
    paid: false, method: "", notes: ""
  });

  saveEntries();
  renderEntries();
  e.target.reset();
});

// ============================
// Render Entries Table
// ============================
function renderEntries() {
  const tbody = document.querySelector("#entries-table tbody");
  tbody.innerHTML = "";

  entries.forEach((entry, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.driver}</td>
      <td>${entry.business}</td>
      <td>${entry.packages}</td>
      <td>${formatCurrency(entry.amazonPay)}</td>
      <td>${formatCurrency(entry.driverPay)}</td>
      <td>${formatCurrency(entry.profit)}</td>
      <td>
        <span class="status-badge ${entry.paid ? 'status-settled' : 'status-pending'}">
          ${entry.paid ? 'Paid' : 'Pending'}
        </span>
      </td>
      <td>${entry.method || '-'}</td>
      <td>${entry.notes || '-'}</td>
      <td>
        ${entry.paid ? '' : `<button onclick="markPaid(${index})">Mark Paid</button>`}
      </td>
    `;

    tbody.appendChild(tr);
  });

  renderDashboard();
}

// ============================
// Mark Paid
// ============================
function markPaid(index) {
  const method = prompt("Enter payment method (Zelle, Cash, etc.):") || "";
  const notes = prompt("Any notes?") || "";

  entries[index].paid = true;
  entries[index].method = method;
  entries[index].notes = notes;
  entries[index].paidDate = new Date().toISOString();

  saveEntries();
  renderEntries();
}

// ============================
// Dashboard Render
// ============================
function renderDashboard() {
  const globalDiv = document.getElementById("global-totals");

  const totalAmazon = entries.reduce((sum, e) => sum + e.amazonPay, 0);
  const totalDriver = entries.reduce((sum, e) => sum + e.driverPay, 0);
  const totalProfit = totalAmazon - totalDriver;

  const pendingAmazon = entries.filter(e => !e.paid).reduce((s, e) => s + e.amazonPay, 0);
  const pendingDriver = entries.filter(e => !e.paid).reduce((s, e) => s + e.driverPay, 0);

  globalDiv.innerHTML = `
    <p><strong>Total Amazon Revenue:</strong> ${formatCurrency(totalAmazon)}</p>
    <p><strong>Total Driver Pay:</strong> ${formatCurrency(totalDriver)}</p>
    <p><strong>Total Profit:</strong> ${formatCurrency(totalProfit)}</p>
    <p><strong>Pending Amazon:</strong> ${formatCurrency(pendingAmazon)}</p>
    <p><strong>Pending Driver Pay:</strong> ${formatCurrency(pendingDriver)}</p>
  `;
}

// ============================
// CSV Export
// ============================
document.getElementById("export-global").addEventListener("click", () => {
  let csv = "Date,Driver,Business,Packages,AmazonPay,DriverPay,Profit,Paid,Method,Notes\n";
  entries.forEach(e => {
    csv += `${e.date},${e.driver},${e.business},${e.packages},${e.amazonPay},${e.driverPay},${e.profit},${e.paid},${e.method},${e.notes}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inwood_logistics.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// ============================
// Initial Render
// ============================
renderEntries();