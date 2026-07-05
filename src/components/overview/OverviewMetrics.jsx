export default function OverviewMetrics({ studentCount, avgGpa, employmentSuccess, totalPendingApprovals }) {
  return (
    <div className="dean-metrics-grid-4">
      {/* Card 1: Toplam Aktif Öğrenci */}
      <div className="dean-metric-card-new">
        <div className="dean-card-top-row">
          <div className="dean-card-icon-box dean-card-icon-blue">
            <span className="material-symbols-outlined">school</span>
          </div>
          <span className="dean-card-trend">
            <span className="material-symbols-outlined">trending_up</span>
            +8%
          </span>
        </div>
        <div className="dean-card-content">
          <span className="dean-card-label">Toplam Aktif Öğrenci</span>
          <div className="dean-card-value-group">
            <h3 className="dean-card-value">{studentCount}</h3>
          </div>
        </div>
      </div>

      {/* Card 2: GANO */}
      <div className="dean-metric-card-new">
        <div className="dean-card-top-row">
          <div className="dean-card-icon-box dean-card-icon-blue">
            <span className="material-symbols-outlined">star</span>
          </div>
          <div className="w-8 h-8 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeWidth="3.5"
                strokeDasharray="73, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <div className="dean-card-content">
          <span className="dean-card-label">Genel Başarı (GANO)</span>
          <div className="dean-card-value-group">
            <h3 className="dean-card-value">{avgGpa}</h3>
            <span className="dean-card-value-sub">/ 4.00</span>
          </div>
        </div>
      </div>

      {/* Card 3: İstihdam & Staj */}
      <div className="dean-metric-card-new">
        <div className="dean-card-top-row">
          <div className="dean-card-icon-box dean-card-icon-blue">
            <span className="material-symbols-outlined">work_history</span>
          </div>
          <div className="flex items-end gap-1 h-6 pb-1">
            <div className="w-1.5 bg-blue-600 rounded-t h-[40%]"></div>
            <div className="w-1.5 bg-blue-600 rounded-t h-[70%]"></div>
            <div className="w-1.5 bg-blue-600 rounded-t h-[100%]"></div>
          </div>
        </div>
        <div className="dean-card-content">
          <span className="dean-card-label">İstihdam &amp; Staj</span>
          <div className="dean-card-value-group">
            <h3 className="dean-card-value">{employmentSuccess}</h3>
          </div>
        </div>
      </div>

      {/* Card 4: Bekleyen Onaylar */}
      <div className="dean-metric-card-new">
        <div className="dean-card-top-row">
          <div className="dean-card-icon-box dean-card-icon-amber">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <span className="dean-card-badge-urgent">ACİL</span>
        </div>
        <div className="dean-card-content">
          <span className="dean-card-label">Bekleyen Onaylar</span>
          <div className="dean-card-value-group">
            <h3 className="dean-card-value">{totalPendingApprovals}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
