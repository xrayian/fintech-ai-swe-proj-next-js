'use client';

import { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Plus, 
  Trash2, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  FileText,
  Trash
} from 'lucide-react';
import { U, TICKERS } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { SectionTitle } from '@/components/shared/section-title';
import { Btn } from '@/components/shared/btn';
import { useNotifications } from '@/components/shared/notification-provider';
import { useLiveTickers } from '@/hooks/use-live-tickers';

export default function NotificationsPage() {
  const {
    alerts,
    notifications,
    createAlert,
    deleteAlert,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadCount
  } = useNotifications();

  const live = useLiveTickers();

  // Create form state
  const [symbol, setSymbol] = useState(TICKERS[0].sym);
  const [type, setType] = useState<'above' | 'below'>('above');
  const [targetValue, setTargetValue] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue || isNaN(Number(targetValue))) return;
    createAlert(symbol, type, Number(targetValue));
    setTargetValue('');
  };

  const selectedLivePrice = live[symbol]?.price || TICKERS.find(t => t.sym === symbol)?.price || 0;

  // Filter alerts to active ones
  const activeAlerts = alerts.filter(a => a.active);

  return (
    <div style={{ animation: "fi .4s ease", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <SectionTitle icon={Bell}>Alerts & Notifications</SectionTitle>
        <div style={{ display: "flex", gap: 8 }}>
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <Btn variant="glass" size="sm" onClick={markAllAsRead}>
                  <Check size={11} /> Mark all read
                </Btn>
              )}
              <Btn variant="glass" size="sm" onClick={clearAllNotifications}>
                <Trash size={11} /> Clear history
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
      }}>
        {/* Left Column: Alerts Manager */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Create Alert Card */}
          <GlassCard style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: U.text, display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} color={U.cyan} /> Create Price Alert
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10 }}>
                {/* Symbol Select */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: U.textMute, marginBottom: 5, textTransform: "uppercase" }}>Asset</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    style={{
                      width: "100%",
                      background: U.inputBg || "rgba(255,255,255,0.05)",
                      border: `1px solid ${U.border}`,
                      borderRadius: 8,
                      color: U.text,
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    {TICKERS.map(t => (
                      <option key={t.sym} value={t.sym} style={{ background: "#0a0a0f", color: "#fff" }}>
                        {t.sym} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Type */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: U.textMute, marginBottom: 5, textTransform: "uppercase" }}>Condition</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "above" | "below")}
                    style={{
                      width: "100%",
                      background: U.inputBg || "rgba(255,255,255,0.05)",
                      border: `1px solid ${U.border}`,
                      borderRadius: 8,
                      color: U.text,
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="above" style={{ background: "#0a0a0f", color: "#fff" }}>Price goes ABOVE</option>
                    <option value="below" style={{ background: "#0a0a0f", color: "#fff" }}>Price goes BELOW</option>
                  </select>
                </div>
              </div>

              {/* Price Threshold */}
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: U.textMute, marginBottom: 5, textTransform: "uppercase" }}>Target Price ($)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: U.textMute, fontSize: 13 }}>$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    style={{
                      width: "100%",
                      background: U.inputBg || 'rgba(255,255,255,0.05)',
                      border: `1px solid ${U.border}`,
                      borderRadius: 8,
                      color: U.text,
                      padding: "8px 12px 8px 24px",
                      fontSize: 13,
                      outline: "none"
                    }}
                  />
                </div>
                {selectedLivePrice > 0 && (
                  <span style={{ display: "block", fontSize: 11, color: U.textFaint, marginTop: 5 }}>
                    Current Price: <strong style={{ color: U.cyan }}>${selectedLivePrice.toFixed(2)}</strong>
                  </span>
                )}
              </div>

              <Btn variant="cyan" size="sm" disabled={!targetValue}>
                <Plus size={12} /> Add Alert Rule
              </Btn>
            </form>
          </GlassCard>

          {/* Active Alerts List Card */}
          <GlassCard style={{ padding: 20, flex: 1 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: U.text, display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={16} color={U.violet} /> Active Alert Rules ({activeAlerts.length})
            </h3>

            {activeAlerts.length === 0 ? (
              <div style={{ padding: "30px 10px", textAlign: "center", color: U.textMute, fontSize: 12 }}>
                No active price alerts set. Use the form above to track dynamic price thresholds.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeAlerts.map(alert => {
                  const currentPrice = live[alert.symbol]?.price || 0;
                  return (
                    <div
                      key={alert.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: U.glassLo,
                        borderRadius: 10,
                        border: `1px solid ${U.border}`,
                        transition: "all .15s"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: U.text }}>{alert.symbol}</span>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: alert.type === "above" ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                            color: alert.type === "above" ? U.emerald : U.rose,
                            display: "flex",
                            alignItems: "center",
                            gap: 2
                          }}>
                            {alert.type === "above" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {alert.type === "above" ? "ABOVE" : "BELOW"}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: U.textMute }}>
                          Target: <strong style={{ color: U.text }}>${alert.value.toFixed(2)}</strong>
                          {currentPrice > 0 && ` | Live: $${currentPrice.toFixed(2)}`}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAlert(alert.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: U.textMute,
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = U.rose; e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = U.textMute; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Notification History Logs */}
        <GlassCard style={{ padding: 20, display: "flex", flexDirection: "column", minHeight: 480 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: U.text, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} color={unreadCount > 0 ? U.cyan : U.textMute} /> 
            Trigger History {unreadCount > 0 && <span style={{ fontSize: 10, background: U.cyanSoft, color: U.cyan, padding: "1px 6px", borderRadius: 10 }}>{unreadCount} new</span>}
          </h3>

          {notifications.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: U.glass, border: `1px solid ${U.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <BellOff size={18} color={U.textMute} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: U.text, marginBottom: 4 }}>History is clean</div>
              <div style={{ fontSize: 11, color: U.textMute, maxWidth: 260, lineHeight: 1.5 }}>
                When your price alert targets are reached, the system triggers alerts here in real-time.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto", maxHeight: 520 }}>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  style={{
                    padding: 12,
                    background: notif.read ? U.glassLo : "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    border: `1px solid ${notif.read ? U.border : U.borderHi}`,
                    borderLeft: notif.read ? `1px solid ${U.border}` : `3.5px solid ${U.cyan}`,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    cursor: notif.read ? "default" : "pointer",
                    position: "relative",
                    transition: "all .2s ease"
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: notif.read ? U.glass : "rgba(34,211,238,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: notif.read ? U.textMute : U.cyan
                  }}>
                    {notif.type === "price" ? <Bell size={13} /> : <FileText size={13} />}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                      <div style={{ fontSize: 12, fontWeight: notif.read ? 600 : 700, color: notif.read ? U.textDim : U.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {notif.title}
                      </div>
                      <span style={{ fontSize: 9, color: U.textFaint, whiteSpace: "nowrap" }}>
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: notif.read ? U.textMute : U.textDim, lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions (Delete/Read indicators) */}
                  <div style={{ display: "flex", gap: 4, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
                    {!notif.read && (
                      <button
                        title="Mark as Read"
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 4,
                          color: U.cyan,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(34,211,238,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 4,
                        color: U.textMute,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = U.rose; e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = U.textMute; e.currentTarget.style.background = "transparent"; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
