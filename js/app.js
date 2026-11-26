(function () {
  "use strict";

  const STORAGE_KEYS = {
    transactions: "pet_transactions_v1",
    budget: "pet_monthly_budget_v1"
  };

  const defaults = window.EXPENSE_TRACKER_DEFAULTS;

  const state = {
    transactions: [],
    monthlyBudget: defaults.monthlyBudget,
    monthFilter: "all",
    typeFilter: "all",
    categoryFilter: "all",
    searchQuery: ""
  };

  // DOM References
  const els = {
    monthFilter: document.getElementById("monthFilter"),
    exportCsvBtn: document.getElementById("exportCsvBtn"),
    resetSampleBtn: document.getElementById("resetSampleBtn"),
    clearAllBtn: document.getElementById("clearAllBtn"),

    budgetAlert: document.getElementById("budgetAlert"),
    budgetAlertBadge: document.getElementById("budgetAlertBadge"),
    budgetAlertMessage: document.getElementById("budgetAlertMessage"),
    budgetProgressBar: document.getElementById("budgetProgressBar"),
    budgetProgressText: document.getElementById("budgetProgressText"),

    totalIncomeValue: document.getElementById("totalIncomeValue"),
    totalIncomeMeta: document.getElementById("totalIncomeMeta"),
    totalExpensesValue: document.getElementById("totalExpensesValue"),
    totalExpensesMeta: document.getElementById("totalExpensesMeta"),
    totalSavingsValue: document.getElementById("totalSavingsValue"),
    savingsRateBadge: document.getElementById("savingsRateBadge"),
    totalSavingsMeta: document.getElementById("totalSavingsMeta"),
    monthlyBudgetValue: document.getElementById("monthlyBudgetValue"),
    budgetStatusTag: document.getElementById("budgetStatusTag"),
    monthlyBudgetMeta: document.getElementById("monthlyBudgetMeta"),
    budgetForm: document.getElementById("budgetForm"),
    budgetInput: document.getElementById("budgetInput"),

    transactionForm: document.getElementById("transactionForm"),
    txType: document.getElementById("txType"),
    txAmount: document.getElementById("txAmount"),
    txCategory: document.getElementById("txCategory"),
    txDate: document.getElementById("txDate"),
    txDescription: document.getElementById("txDescription"),
    formError: document.getElementById("formError"),

    monthlyChart: document.getElementById("monthlyChart"),
    monthlyChartTooltip: document.getElementById("monthlyChartTooltip"),
    categoryPieChart: document.getElementById("categoryPieChart"),
    pieChartTooltip: document.getElementById("pieChartTooltip"),
    categoryLegend: document.getElementById("categoryLegend"),
    pieChartSubtitle: document.getElementById("pieChartSubtitle"),

    searchInput: document.getElementById("searchInput"),
    typeFilter: document.getElementById("typeFilter"),
    categoryFilter: document.getElementById("categoryFilter"),
    historyCountText: document.getElementById("historyCountText"),
    transactionTableBody: document.getElementById("transactionTableBody"),
    emptyState: document.getElementById("emptyState")
  };

  function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatMonthName(ym) {
    const parts = ym.split("-");
    if (parts.length !== 2) return ym;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const idx = parseInt(parts[1], 10) - 1;
    return (monthNames[idx] || parts[1]) + " " + parts[0];
  }

  function loadState() {
    try {
      const savedTx = localStorage.getItem(STORAGE_KEYS.transactions);
      const savedBudget = localStorage.getItem(STORAGE_KEYS.budget);

      if (savedTx !== null) {
        const parsed = JSON.parse(savedTx);
        state.transactions = Array.isArray(parsed) ? parsed : [...defaults.transactions];
      } else {
        state.transactions = defaults.transactions.map((t) => ({ ...t }));
        saveTransactions();
      }

      if (savedBudget !== null) {
        const parsedBudget = parseFloat(savedBudget);
        state.monthlyBudget = Number.isFinite(parsedBudget) && parsedBudget > 0
          ? parsedBudget
          : defaults.monthlyBudget;
      } else {
        state.monthlyBudget = defaults.monthlyBudget;
        saveBudget();
      }
    } catch (err) {
      state.transactions = defaults.transactions.map((t) => ({ ...t }));
      state.monthlyBudget = defaults.monthlyBudget;
    }
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
  }

  function saveBudget() {
    localStorage.setItem(STORAGE_KEYS.budget, String(state.monthlyBudget));
  }

  function populateFormCategories() {
    const type = els.txType.value;
    const list = defaults.categories[type] || [];
    els.txCategory.innerHTML = "";
    list.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      els.txCategory.appendChild(opt);
    });
  }

  function populateFilterDropdowns() {
    const currentMonth = state.monthFilter;
    const months = Array.from(
      new Set(state.transactions.map((t) => t.date.slice(0, 7)))
    ).sort();

    els.monthFilter.innerHTML = '<option value="all">All Months</option>';
    months.forEach((ym) => {
      const opt = document.createElement("option");
      opt.value = ym;
      opt.textContent = formatMonthName(ym);
      els.monthFilter.appendChild(opt);
    });

    if (months.includes(currentMonth) || currentMonth === "all") {
      els.monthFilter.value = currentMonth;
    } else {
      state.monthFilter = "all";
      els.monthFilter.value = "all";
    }

    const currentCat = state.categoryFilter;
    const allCategories = Array.from(
      new Set([
        ...defaults.categories.Expense,
        ...defaults.categories.Income,
        ...state.transactions.map((t) => t.category)
      ])
    ).sort();

    els.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    allCategories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      els.categoryFilter.appendChild(opt);
    });

    if (allCategories.includes(currentCat) || currentCat === "all") {
      els.categoryFilter.value = currentCat;
    } else {
      state.categoryFilter = "all";
      els.categoryFilter.value = "all";
    }
  }

  function getPeriodTransactions() {
    if (state.monthFilter === "all") {
      return state.transactions;
    }
    return state.transactions.filter((t) => t.date.startsWith(state.monthFilter));
  }

  function getTableTransactions() {
    const query = state.searchQuery.trim().toLowerCase();
    return getPeriodTransactions()
      .filter((t) => {
        if (state.typeFilter !== "all" && t.type !== state.typeFilter) return false;
        if (state.categoryFilter !== "all" && t.category !== state.categoryFilter) return false;
        if (query && !t.description.toLowerCase().includes(query) && !t.category.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(b.id)));
  }

  function getActiveBudgetMonth() {
    if (state.monthFilter !== "all") {
      return state.monthFilter;
    }
    const months = state.transactions.map((t) => t.date.slice(0, 7)).sort();
    if (months.length > 0) {
      return months[months.length - 1];
    }
    return new Date().toISOString().slice(0, 7);
  }

  function renderKPIsAndBudgetAlert() {
    const periodTx = getPeriodTransactions();
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    periodTx.forEach((t) => {
      if (t.type === "Income") {
        totalIncome += Number(t.amount);
        incomeCount += 1;
      } else {
        totalExpenses += Number(t.amount);
        expenseCount += 1;
      }
    });

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    els.totalIncomeValue.textContent = formatCurrency(totalIncome);
    els.totalIncomeMeta.textContent = incomeCount + (incomeCount === 1 ? " income entry" : " income entries");

    els.totalExpensesValue.textContent = formatCurrency(totalExpenses);
    els.totalExpensesMeta.textContent = expenseCount + (expenseCount === 1 ? " expense entry" : " expense entries");

    els.totalSavingsValue.textContent = formatCurrency(totalSavings);
    els.totalSavingsValue.classList.toggle("negative", totalSavings < 0);
    els.savingsRateBadge.textContent = savingsRate.toFixed(1) + "%";
    els.savingsRateBadge.className = "kpi-tag " + (totalSavings >= 0 ? "kpi-tag-green" : "kpi-tag-red");
    els.totalSavingsMeta.textContent = state.monthFilter === "all"
      ? "Cumulative net savings across all months"
      : "Net savings for " + formatMonthName(state.monthFilter);

    els.monthlyBudgetValue.textContent = formatCurrency(state.monthlyBudget);
    els.budgetInput.value = state.monthlyBudget;

    // Budget evaluation for active month
    const activeMonth = getActiveBudgetMonth();
    const activeMonthExpense = state.transactions
      .filter((t) => t.type === "Expense" && t.date.startsWith(activeMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const utilizationPct = state.monthlyBudget > 0
      ? (activeMonthExpense / state.monthlyBudget) * 100
      : 0;

    els.monthlyBudgetMeta.textContent =
      formatMonthName(activeMonth) + ": " + formatCurrency(activeMonthExpense) + " spent";

    els.budgetAlert.classList.remove("hidden", "status-warning", "status-exceeded");
    els.budgetProgressBar.style.width = Math.min(utilizationPct, 100).toFixed(1) + "%";
    els.budgetProgressText.textContent = utilizationPct.toFixed(1) + "% used";

    if (state.transactions.length === 0) {
      els.budgetAlert.classList.add("hidden");
      els.budgetStatusTag.textContent = "No Data";
      els.budgetStatusTag.className = "kpi-tag kpi-tag-neutral";
      return;
    }

    if (activeMonthExpense > state.monthlyBudget) {
      const overBy = activeMonthExpense - state.monthlyBudget;
      els.budgetAlert.classList.add("status-exceeded");
      els.budgetAlertBadge.textContent = "BUDGET EXCEEDED";
      els.budgetAlertMessage.textContent =
        "Warning: " + formatMonthName(activeMonth) + " expenses (" + formatCurrency(activeMonthExpense) +
        ") exceeded your monthly budget of " + formatCurrency(state.monthlyBudget) +
        " by " + formatCurrency(overBy) + ".";
      els.budgetStatusTag.textContent = "Exceeded";
      els.budgetStatusTag.className = "kpi-tag kpi-tag-red";
    } else if (utilizationPct >= 80) {
      const remaining = state.monthlyBudget - activeMonthExpense;
      els.budgetAlert.classList.add("status-warning");
      els.budgetAlertBadge.textContent = "APPROACHING LIMIT";
      els.budgetAlertMessage.textContent =
        "Notice: " + formatMonthName(activeMonth) + " spending is at " + utilizationPct.toFixed(1) +
        "% of your budget. " + formatCurrency(remaining) + " remaining.";
      els.budgetStatusTag.textContent = "Near Limit";
      els.budgetStatusTag.className = "kpi-tag kpi-tag-navy";
    } else {
      const remaining = state.monthlyBudget - activeMonthExpense;
      els.budgetAlertBadge.textContent = "WITHIN BUDGET";
      els.budgetAlertMessage.textContent =
        formatMonthName(activeMonth) + " spending is on track (" + formatCurrency(activeMonthExpense) +
        " of " + formatCurrency(state.monthlyBudget) + "). " + formatCurrency(remaining) + " remaining.";
      els.budgetStatusTag.textContent = "On Track";
      els.budgetStatusTag.className = "kpi-tag kpi-tag-green";
    }
  }

  function renderCharts() {
    const monthlyMap = new Map();
    state.transactions.forEach((t) => {
      const ym = t.date.slice(0, 7);
      if (!monthlyMap.has(ym)) {
        monthlyMap.set(ym, { month: ym, income: 0, expense: 0 });
      }
      const entry = monthlyMap.get(ym);
      if (t.type === "Income") {
        entry.income += Number(t.amount);
      } else {
        entry.expense += Number(t.amount);
      }
    });

    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    window.DashboardCharts.renderMonthlySpendingChart(
      els.monthlyChart,
      els.monthlyChartTooltip,
      monthlyData,
      state.monthlyBudget
    );

    const periodExpenses = getPeriodTransactions().filter((t) => t.type === "Expense");
    const catMap = new Map();
    periodExpenses.forEach((t) => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + Number(t.amount));
    });

    const categoryData = Array.from(catMap.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    els.pieChartSubtitle.textContent = state.monthFilter === "all"
      ? "Expense distribution across all months"
      : "Expense distribution for " + formatMonthName(state.monthFilter);

    window.DashboardCharts.renderCategoryPieChart(
      els.categoryPieChart,
      els.pieChartTooltip,
      els.categoryLegend,
      categoryData
    );
  }

  function renderTransactionTable() {
    const rows = getTableTransactions();
    els.transactionTableBody.innerHTML = "";
    els.historyCountText.textContent =
      "Showing " + rows.length + " of " + state.transactions.length + " total transactions";

    if (rows.length === 0) {
      els.emptyState.classList.remove("hidden");
      return;
    }

    els.emptyState.classList.add("hidden");

    rows.forEach((tx) => {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = tx.date;

      const tdDesc = document.createElement("td");
      tdDesc.textContent = tx.description;

      const tdCat = document.createElement("td");
      tdCat.textContent = tx.category;

      const tdType = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "type-badge " + (tx.type === "Income" ? "type-income" : "type-expense");
      badge.textContent = tx.type;
      tdType.appendChild(badge);

      const tdAmount = document.createElement("td");
      tdAmount.className = "text-right " + (tx.type === "Income" ? "amount-income" : "amount-expense");
      tdAmount.textContent = (tx.type === "Income" ? "+" : "-") + formatCurrency(tx.amount);

      const tdAction = document.createElement("td");
      tdAction.className = "text-center";
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-delete";
      delBtn.textContent = "Delete";
      delBtn.setAttribute("data-id", tx.id);
      delBtn.setAttribute("aria-label", "Delete transaction " + tx.description);
      tdAction.appendChild(delBtn);

      tr.appendChild(tdDate);
      tr.appendChild(tdDesc);
      tr.appendChild(tdCat);
      tr.appendChild(tdType);
      tr.appendChild(tdAmount);
      tr.appendChild(tdAction);
      els.transactionTableBody.appendChild(tr);
    });
  }

  function renderAll() {
    populateFilterDropdowns();
    renderKPIsAndBudgetAlert();
    renderCharts();
    renderTransactionTable();
  }

  function showFormError(msg) {
    if (!msg) {
      els.formError.textContent = "";
      els.formError.classList.add("hidden");
      return;
    }
    els.formError.textContent = msg;
    els.formError.classList.remove("hidden");
  }

  function handleAddTransaction(e) {
    e.preventDefault();
    showFormError("");

    const type = els.txType.value;
    const amount = parseFloat(els.txAmount.value);
    const category = els.txCategory.value;
    const date = els.txDate.value;
    const description = els.txDescription.value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      showFormError("Please enter a valid positive amount.");
      return;
    }
    if (!category) {
      showFormError("Please select a category.");
      return;
    }
    if (!date) {
      showFormError("Please select a transaction date.");
      return;
    }
    if (!description) {
      showFormError("Please enter a short description.");
      return;
    }

    const newTx = {
      id: "TX-" + Date.now(),
      date,
      type,
      category,
      description,
      amount: Math.round(amount * 100) / 100
    };

    state.transactions.push(newTx);
    saveTransactions();

    els.txAmount.value = "";
    els.txDescription.value = "";
    renderAll();
  }

  function handleUpdateBudget(e) {
    e.preventDefault();
    const val = parseFloat(els.budgetInput.value);
    if (!Number.isFinite(val) || val <= 0) {
      els.budgetInput.value = state.monthlyBudget;
      return;
    }
    state.monthlyBudget = Math.round(val * 100) / 100;
    saveBudget();
    renderKPIsAndBudgetAlert();
    renderCharts();
  }

  function handleDeleteTransaction(id) {
    state.transactions = state.transactions.filter((t) => t.id !== id);
    saveTransactions();
    renderAll();
  }

  function escapeCsvField(val) {
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function exportCsv() {
    const header = ["transaction_id", "date", "type", "category", "description", "amount"];
    const sorted = [...state.transactions].sort((a, b) => a.date.localeCompare(b.date));
    const lines = [header.join(",")];

    sorted.forEach((tx) => {
      lines.push([
        escapeCsvField(tx.id),
        escapeCsvField(tx.date),
        escapeCsvField(tx.type),
        escapeCsvField(tx.category),
        escapeCsvField(tx.description),
        escapeCsvField(tx.amount)
      ].join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense_transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    els.txType.addEventListener("change", populateFormCategories);
    els.transactionForm.addEventListener("submit", handleAddTransaction);
    els.budgetForm.addEventListener("submit", handleUpdateBudget);

    els.monthFilter.addEventListener("change", (e) => {
      state.monthFilter = e.target.value;
      renderAll();
    });

    els.typeFilter.addEventListener("change", (e) => {
      state.typeFilter = e.target.value;
      renderTransactionTable();
    });

    els.categoryFilter.addEventListener("change", (e) => {
      state.categoryFilter = e.target.value;
      renderTransactionTable();
    });

    els.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderTransactionTable();
    });

    els.transactionTableBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (btn) {
        const id = btn.getAttribute("data-id");
        if (id) {
          handleDeleteTransaction(id);
        }
      }
    });

    els.exportCsvBtn.addEventListener("click", exportCsv);

    els.resetSampleBtn.addEventListener("click", () => {
      state.transactions = defaults.transactions.map((t) => ({ ...t }));
      state.monthlyBudget = defaults.monthlyBudget;
      state.monthFilter = "all";
      state.typeFilter = "all";
      state.categoryFilter = "all";
      state.searchQuery = "";
      els.typeFilter.value = "all";
      els.searchInput.value = "";
      saveTransactions();
      saveBudget();
      renderAll();
    });

    els.clearAllBtn.addEventListener("click", () => {
      state.transactions = [];
      state.monthFilter = "all";
      saveTransactions();
      renderAll();
    });

    window.addEventListener("resize", renderCharts);
  }

  function init() {
    loadState();
    populateFormCategories();
    els.txDate.value = new Date().toISOString().slice(0, 10);
    bindEvents();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
