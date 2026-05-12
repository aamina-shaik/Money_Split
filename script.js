 let expenses = [];

  const p1Input = document.getElementById('p1-name-input');
  const p2Input = document.getElementById('p2-name-input');
  const payerSelect = document.getElementById('payer-select');
  const descInput = document.getElementById('desc-input');
  const amountInput = document.getElementById('amount-input');

  function getName(key) {
    return key === 'p1'
      ? (p1Input.value.trim() || 'Partner 1')
      : (p2Input.value.trim() || 'Partner 2');
  }

  function getInitial(key) {
    const n = getName(key);
    return n.charAt(0).toUpperCase();
  }

  function updatePayerOptions() {
    payerSelect.options[0].text = getName('p1') + ' paid';
    payerSelect.options[1].text = getName('p2') + ' paid';
  }

  function updateLabels() {
    document.getElementById('p1-name-label').textContent = getName('p1');
    document.getElementById('p2-name-label').textContent = getName('p2');
    updatePayerOptions();
    render();
  }

  p1Input.addEventListener('input', updateLabels);
  p2Input.addEventListener('input', updateLabels);

  function fmt(n) {
    return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function addExpense() {
    const desc = descInput.value.trim();
    const amt = parseFloat(amountInput.value);
    const payer = payerSelect.value;

    if (!desc || isNaN(amt) || amt <= 0) {
      const target = !desc ? descInput : amountInput;
      target.classList.remove('shake');
      void target.offsetWidth;
      target.classList.add('shake');
      target.style.borderColor = '#C4614A';
      setTimeout(() => {
        target.style.borderColor = '';
        target.classList.remove('shake');
      }, 800);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    expenses.unshift({ id: Date.now(), desc, amt, payer, time: timeStr });
    descInput.value = '';
    amountInput.value = '';
    descInput.focus();
    render();
  }

  function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    render();
  }

  function clearAll() {
    if (!expenses.length) return;
    if (confirm('Clear all expenses? This cannot be undone.')) {
      expenses = [];
      render();
    }
  }

  function render() {
    const p1Name = getName('p1');
    const p2Name = getName('p2');

    let p1Total = 0, p2Total = 0;
    expenses.forEach(e => {
      if (e.payer === 'p1') p1Total += e.amt;
      else p2Total += e.amt;
    });

    document.getElementById('p1-total').textContent = fmt(p1Total);
    document.getElementById('p2-total').textContent = fmt(p2Total);

    const total = p1Total + p2Total;
    const half = total / 2;
    const diff = p1Total - half; // positive = p2 owes p1

    const balEl = document.getElementById('balance-amount');
    const descEl = document.getElementById('balance-desc');

    if (expenses.length === 0) {
      balEl.textContent = '₹0.00';
      balEl.className = 'balance-amount even';
      descEl.innerHTML = 'Add your first expense below';
    } else if (Math.abs(diff) < 0.01) {
      balEl.textContent = '₹0.00';
      balEl.className = 'balance-amount even';
      descEl.innerHTML = '✦ All perfectly settled — you\'re even!';
    } else if (diff > 0) {
      balEl.textContent = fmt(diff);
      balEl.className = 'balance-amount owed';
      descEl.innerHTML = '<strong>' + p2Name + '</strong> owes <strong>' + p1Name + '</strong> ' + fmt(diff);
    } else {
      balEl.textContent = fmt(Math.abs(diff));
      balEl.className = 'balance-amount owes';
      descEl.innerHTML = '<strong>' + p1Name + '</strong> owes <strong>' + p2Name + '</strong> ' + fmt(Math.abs(diff));
    }

    const list = document.getElementById('expense-list');

    if (expenses.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✦</div>
          <div class="empty-text">No expenses yet — add one above</div>
        </div>`;
      return;
    }

    list.innerHTML = expenses.map(e => `
      <div class="expense-item">
        <div class="payer-avatar ${e.payer}">${getInitial(e.payer)}</div>
        <div class="expense-info">
          <div class="expense-desc">${escHtml(e.desc)}</div>
          <div class="expense-meta">${getName(e.payer)} · ${e.time}</div>
        </div>
        <div class="expense-amount">${fmt(e.amt)}</div>
        <button class="del-btn" onclick="deleteExpense(${e.id})" title="Remove">×</button>
      </div>
    `).join('');
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  descInput.addEventListener('keydown', e => { if (e.key === 'Enter') addExpense(); });
  amountInput.addEventListener('keydown', e => { if (e.key === 'Enter') addExpense(); });

  render();