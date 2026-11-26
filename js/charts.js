(function () {
  "use strict";

  const PIE_PALETTE = [
    "#0f172a",
    "#16a34a",
    "#1e3a8a",
    "#22c55e",
    "#334155",
    "#15803d",
    "#64748b",
    "#86efac"
  ];

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(rect.width, 200);
    const height = Math.max(rect.height, 200);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function formatCompactCurrency(val) {
    if (val >= 100000) {
      return "₹" + (val / 100000).toFixed(1) + "L";
    }
    if (val >= 1000) {
      return "₹" + (val / 1000).toFixed(0) + "k";
    }
    return "₹" + val.toFixed(0);
  }

  function formatFullCurrency(val) {
    return "₹" + Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatMonthLabel(ym) {
    const parts = ym.split("-");
    if (parts.length !== 2) return ym;
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mIdx = parseInt(parts[1], 10) - 1;
    return (names[mIdx] || parts[1]) + " " + parts[0].slice(2);
  }

  function drawEmptyMessage(ctx, width, height, message) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#64748b";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, width / 2, height / 2);
  }

  const monthlyHitBoxes = [];
  const pieSlices = [];

  function renderMonthlySpendingChart(canvas, tooltipEl, monthlyData, budgetLimit) {
    const { ctx, width, height } = setupCanvas(canvas);
    monthlyHitBoxes.length = 0;

    if (!monthlyData.length) {
      drawEmptyMessage(ctx, width, height, "No expense data to display");
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const pad = { top: 20, right: 16, bottom: 34, left: 54 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    const maxExpense = Math.max(...monthlyData.map((d) => d.expense), budgetLimit || 0, 1000);
    const yMax = Math.ceil((maxExpense * 1.15) / 5000) * 5000;

    // Horizontal grid lines & Y-axis labels
    const ticks = 4;
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= ticks; i++) {
      const value = (yMax / ticks) * i;
      const y = pad.top + chartH - (value / yMax) * chartH;

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = "#475569";
      ctx.fillText(formatCompactCurrency(value), pad.left - 8, y);
    }

    // Bars
    const slotW = chartW / monthlyData.length;
    const barW = Math.min(40, Math.max(14, slotW * 0.54));

    monthlyData.forEach((item, index) => {
      const barH = (item.expense / yMax) * chartH;
      const x = pad.left + index * slotW + (slotW - barW) / 2;
      const y = pad.top + chartH - barH;
      const isOver = budgetLimit > 0 && item.expense > budgetLimit;

      ctx.fillStyle = isOver ? "#dc2626" : "#16a34a";
      ctx.beginPath();
      const radius = Math.min(4, barH / 2);
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();

      // X-axis label
      ctx.fillStyle = "#1e293b";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(formatMonthLabel(item.month), x + barW / 2, pad.top + chartH + 8);

      monthlyHitBoxes.push({
        x,
        y,
        w: barW,
        h: barH,
        month: item.month,
        expense: item.expense,
        income: item.income,
        isOver
      });
    });

    // Budget threshold dashed line
    if (budgetLimit > 0 && budgetLimit <= yMax) {
      const budgetY = pad.top + chartH - (budgetLimit / yMax) * chartH;
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, budgetY);
      ctx.lineTo(pad.left + chartW, budgetY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#0f172a";
      ctx.font = "600 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("Budget: " + formatCompactCurrency(budgetLimit), pad.left + chartW, budgetY - 4);
    }

    canvas.onmousemove = function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = monthlyHitBoxes.find(
        (b) => mx >= b.x && mx <= b.x + b.w && my >= pad.top && my <= pad.top + chartH
      );
      if (hit) {
        tooltipEl.innerHTML =
          "<strong>" + formatMonthLabel(hit.month) + "</strong><br>" +
          "Expenses: " + formatFullCurrency(hit.expense) + "<br>" +
          "Income: " + formatFullCurrency(hit.income);
        tooltipEl.style.left = Math.min(mx + 12, rect.width - 165) + "px";
        tooltipEl.style.top = Math.max(my - 48, 8) + "px";
        tooltipEl.classList.remove("hidden");
      } else {
        tooltipEl.classList.add("hidden");
      }
    };

    canvas.onmouseleave = function () {
      tooltipEl.classList.add("hidden");
    };
  }

  function renderCategoryPieChart(canvas, tooltipEl, legendEl, categoryData) {
    const { ctx, width, height } = setupCanvas(canvas);
    pieSlices.length = 0;
    legendEl.innerHTML = "";

    const total = categoryData.reduce((sum, item) => sum + item.total, 0);
    if (!categoryData.length || total <= 0) {
      drawEmptyMessage(ctx, width, height, "No expenses in period");
      const emptyLi = document.createElement("li");
      emptyLi.textContent = "Add an expense to view category breakdown.";
      emptyLi.style.color = "#64748b";
      legendEl.appendChild(emptyLi);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.52;

    let startAngle = -Math.PI / 2;

    categoryData.forEach((item, index) => {
      const sliceAngle = (item.total / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = PIE_PALETTE[index % PIE_PALETTE.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      pieSlices.push({
        startAngle,
        endAngle,
        category: item.category,
        total: item.total,
        percent: ((item.total / total) * 100).toFixed(1)
      });

      const li = document.createElement("li");
      const left = document.createElement("span");
      left.className = "legend-left";
      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.backgroundColor = color;
      const name = document.createElement("span");
      name.className = "legend-name";
      name.textContent = item.category;
      left.appendChild(swatch);
      left.appendChild(name);

      const val = document.createElement("span");
      val.className = "legend-val";
      val.textContent = ((item.total / total) * 100).toFixed(1) + "%";

      li.appendChild(left);
      li.appendChild(val);
      legendEl.appendChild(li);

      startAngle = endAngle;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Center label
    ctx.fillStyle = "#475569";
    ctx.font = "600 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("TOTAL", cx, cy - 2);

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(formatCompactCurrency(total), cx, cy + 2);

    canvas.onmousemove = function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < innerRadius || dist > radius) {
        tooltipEl.classList.add("hidden");
        return;
      }

      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) {
        angle += Math.PI * 2;
      }

      const slice = pieSlices.find((s) => angle >= s.startAngle && angle <= s.endAngle);
      if (slice) {
        tooltipEl.innerHTML =
          "<strong>" + slice.category + "</strong><br>" +
          formatFullCurrency(slice.total) + " (" + slice.percent + "%)";
        tooltipEl.style.left = Math.min(mx + 10, rect.width - 150) + "px";
        tooltipEl.style.top = Math.max(my - 42, 6) + "px";
        tooltipEl.classList.remove("hidden");
      } else {
        tooltipEl.classList.add("hidden");
      }
    };

    canvas.onmouseleave = function () {
      tooltipEl.classList.add("hidden");
    };
  }

  window.DashboardCharts = {
    renderMonthlySpendingChart,
    renderCategoryPieChart
  };
})();
