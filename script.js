let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('investment-form');
const tableBody = document.querySelector('#transaction-table tbody');
const netWorthDiv = document.getElementById('net-worth');

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function renderTransactions() {
  tableBody.innerHTML = '';
  let total = 0;
  transactions.forEach((tx, index) => {
    total += Number(tx.amount);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${tx.type}</td>
      <td>₹${tx.amount}</td>
      <td>${tx.date}</td>
      <td>${tx.growth || '-'}</td>
      <td>
        <button onclick="editTransaction(${index})">Edit</button>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  netWorthDiv.innerText = `Net Worth: ₹${total}`;
  drawCharts();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const newTx = {
    type: document.getElementById('type').value,
    amount: document.getElementById('amount').value,
    date: document.getElementById('date').value,
    growth: document.getElementById('growth').value
  };
  transactions.push(newTx);
  saveTransactions();
  form.reset();
  renderTransactions();
});

function deleteTransaction(index) {
  if (confirm('Are you sure?')) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
  }
}

function editTransaction(index) {
  const tx = transactions[index];
  document.getElementById('type').value = tx.type;
  document.getElementById('amount').value = tx.amount;
  document.getElementById('date').value = tx.date;
  document.getElementById('growth').value = tx.growth;
  transactions.splice(index, 1);
  saveTransactions();
  renderTransactions();
}

function drawCharts() {
  const types = {};
  transactions.forEach(tx => {
    types[tx.type] = (types[tx.type] || 0) + Number(tx.amount);
  });

  const ctxPie = document.getElementById('pieChart').getContext('2d');
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: Object.keys(types),
      datasets: [{
        data: Object.values(types),
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf'
        ],
      }]
    },
    options: { responsive: true }
  });

  const ctxLine = document.getElementById('lineChart').getContext('2d');
  const dates = transactions.map(tx => tx.date);
  const amounts = transactions.map(tx => Number(tx.amount));

  new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Net Worth Over Time',
        data: amounts,
        fill: true,
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.2)'
      }]
    },
    options: { responsive: true }
  });

  drawProjectionChart();
}

function drawProjectionChart() {
  const ctxProj = document.getElementById('projectionChart').getContext('2d');
  const years = [0, 1, 2, 3, 4, 5];
  let total = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  let growthRate = transactions.reduce((sum, tx) => sum + (Number(tx.growth) || 5), 0) / transactions.length;

  const futureValues = years.map(y => total * Math.pow(1 + growthRate / 100, y));

  new Chart(ctxProj, {
    type: 'line',
    data: {
      labels: years.map(y => `${y} yr`),
      datasets: [{
        label: 'Projected Net Worth',
        data: futureValues,
        fill: true,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76,175,80,0.2)'
      }]
    },
    options: { responsive: true }
  });
}

document.getElementById('toggle-dark').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

document.getElementById('backup-btn').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "investments_backup.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
});

document.getElementById('restore-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    transactions = JSON.parse(e.target.result);
    saveTransactions();
    renderTransactions();
  };
  reader.readAsText(file);
});

renderTransactions();
