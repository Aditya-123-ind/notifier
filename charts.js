/* ==========================================================================
   EduNotify Analytics SVG Charts Engine
   ========================================================================== */

const AcademicCharts = (() => {
  // Render Bar Chart: Notifications by Branch
  const renderBranchBarChart = (containerId, notifs) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const branches = AcademicDB.getBranches();
    
    // Count notifications per branch (including 'all' broadcasts as partial count, or direct branch target)
    const counts = {};
    branches.forEach(b => {
      counts[b.id] = 0;
    });

    notifs.forEach(n => {
      if (n.recipientGroup === "all" || n.recipientGroup === "students") {
        branches.forEach(b => counts[b.id]++);
      } else if (n.recipientGroup === "branch" && n.targetBranchId) {
        if (counts[n.targetBranchId] !== undefined) {
          counts[n.targetBranchId]++;
        }
      }
    });

    const data = branches.map(b => ({
      label: b.code,
      value: counts[b.id],
      name: b.name
    }));

    const maxVal = Math.max(...data.map(d => d.value), 1); // Avoid division by 0

    // Chart Dimensions
    const width = 450;
    const height = 220;
    const paddingLeft = 40;
    const paddingBottom = 40;
    const paddingTop = 20;
    const paddingRight = 20;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const barWidth = (chartWidth / data.length) * 0.6;
    const barSpacing = (chartWidth / data.length) * 0.4;

    let barsSvg = "";
    let gridLinesSvg = "";
    let labelsSvg = "";

    // 1. Grid Lines and Y-Axis Values
    const gridTicks = 4;
    for (let i = 0; i <= gridTicks; i++) {
      const y = paddingTop + chartHeight - (i * chartHeight) / gridTicks;
      const val = Math.round((i * maxVal) / gridTicks);
      gridLinesSvg += `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${paddingLeft - 8}" y="${y + 4}" class="chart-text" text-anchor="end" fill="#94a3b8" font-size="10">${val}</text>
      `;
    }

    // 2. Bars rendering
    data.forEach((d, idx) => {
      const x = paddingLeft + idx * (barWidth + barSpacing) + barSpacing / 2;
      const bHeight = (d.value / maxVal) * chartHeight;
      const y = paddingTop + chartHeight - bHeight;

      barsSvg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" class="chart-bar" fill="#3b82f6" rx="4">
          <title>${d.name}: ${d.value} Notifications</title>
        </rect>
      `;

      labelsSvg += `
        <text x="${x + barWidth / 2}" y="${height - paddingBottom + 18}" class="chart-text font-semibold" text-anchor="middle" fill="#475569" font-size="11">${d.label}</text>
      `;
    });

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg" width="100%">
        ${gridLinesSvg}
        ${barsSvg}
        ${labelsSvg}
        <!-- X Axis Line -->
        <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="#cbd5e1" stroke-width="1" />
        <!-- Y Axis Line -->
        <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="#cbd5e1" stroke-width="1" />
      </svg>
    `;

    container.innerHTML = svg;
  };

  // Render Pie Chart: Notifications by Category
  const renderCategoryPieChart = (containerId, notifs) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    // Group count by categories
    const counts = {};
    let total = 0;
    notifs.forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
      total++;
    });

    const categories = [
      { id: "exams", label: "Exams", color: "#f43f5e" },
      { id: "circulars", label: "Circulars", color: "#3b82f6" },
      { id: "attendance", label: "Attendance", color: "#f97316" },
      { id: "events", label: "Events", color: "#a855f7" },
      { id: "placement", label: "Placement", color: "#06b6d4" },
      { id: "holidays", label: "Holidays", color: "#10b981" },
      { id: "urgent", label: "Urgent", color: "#e11d48" }
    ];

    const data = categories.map(cat => ({
      ...cat,
      value: counts[cat.id] || 0
    })).filter(d => d.value > 0);

    if (data.length === 0) {
      container.innerHTML = `<div class="dropdown-empty">No category data to display</div>`;
      return;
    }

    // Pie geometry parameters
    const size = 220;
    const center = size / 2;
    const radius = 80;
    
    let cumulativePercent = 0;
    let pathDataSegments = [];

    const getCoordinatesForPercent = (percent) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    data.forEach(d => {
      const percent = d.value / total;
      const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
      cumulativePercent += percent;
      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

      const x1 = center + startX * radius;
      const y1 = center + startY * radius;
      const x2 = center + endX * radius;
      const y2 = center + endY * radius;

      const largeArcFlag = percent > 0.5 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(" ");

      pathDataSegments.push({
        path: pathData,
        color: d.color,
        label: d.label,
        value: d.value,
        percent: Math.round(percent * 100)
      });
    });

    let slicesSvg = "";
    pathDataSegments.forEach(seg => {
      slicesSvg += `
        <path d="${seg.path}" fill="${seg.color}" class="chart-pie-slice">
          <title>${seg.label}: ${seg.value} (${seg.percent}%)</title>
        </path>
      `;
    });

    let legendsHtml = '<div class="chart-legends">';
    data.forEach(d => {
      legendsHtml += `
        <div class="legend-item">
          <span class="legend-color-box" style="background-color: ${d.color};"></span>
          <span>${d.label} (${d.value})</span>
        </div>
      `;
    });
    legendsHtml += "</div>";

    const svg = `
      <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
        <svg viewBox="0 0 ${size} ${size}" class="chart-svg" style="max-width:180px;">
          <!-- Drop shadow filter for premium styling -->
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
            </filter>
          </defs>
          <g filter="url(#shadow)">
            ${slicesSvg}
          </g>
          <!-- Inner circle to make it a donut chart -->
          <circle cx="${center}" cy="${center}" r="45" fill="var(--bg-card)" />
          <text x="${center}" y="${center + 4}" class="chart-title-text" text-anchor="middle" font-size="12" fill="var(--text-main)">${total} Total</text>
        </svg>
        ${legendsHtml}
      </div>
    `;

    container.innerHTML = svg;
  };

  return {
    renderBranchBarChart,
    renderCategoryPieChart
  };
})();
