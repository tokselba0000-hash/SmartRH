import { useState } from "react"
import smartRHLogo from "@/imports/WhatsApp_Image_2026-06-13_at_12.57.54_AM.jpeg"
import ImageWithFallback from "@/app/components/figma/ImageWithFallback"
import {
  LayoutDashboard, Users, ClipboardList, Calendar, Settings,
  LogOut, Bell, Search, TrendingUp, ChevronRight,
  Star, ArrowUpRight, CheckCircle, Eye,
  UserCircle, Lock, BellRing, ShieldCheck,
  AlertCircle, Check, X, Coffee, Edit3,
  FileDown, Printer, Clock, Clipboard, ThumbsUp, Lightbulb,
  HeartHandshake, Timer, BookOpen,
} from "lucide-react"

// ─── Types & Data ─────────────────────────────────────────────────────────────

type Screen = "login" | "dashboard" | "employees" | "evaluation" | "attendance" | "settings"

type Employee = {
  id: number
  name: string
  role: string
  avatar: string
  color: string
  status: "Actif" | "Active"
  score: number   // out of 20
  dept: string
}

// scores sur 20 — moyenne = (16+18+15+13+16+17+14)/7 = 15.57/20 ≈ 78%
const employees: Employee[] = [
  { id: 1, name: "Hawa Kane",    role: "Employée", avatar: "HK", color: "#EC4899", status: "Active", score: 16, dept: "Ressources Humaines" },
  { id: 2, name: "Amina Koné",   role: "Employée", avatar: "AK", color: "#10B981", status: "Active", score: 18, dept: "Design"              },
  { id: 3, name: "Fatou Diallo", role: "Employée", avatar: "FD", color: "#6366F1", status: "Active", score: 15, dept: "Finance"              },
  { id: 4, name: "Amadou Dieye", role: "Employé",  avatar: "AD", color: "#0EA5E9", status: "Actif",  score: 13, dept: "Opérations"          },
  { id: 5, name: "Ahmed Sidatt", role: "Employé",  avatar: "AS", color: "#F59E0B", status: "Actif",  score: 16, dept: "Commercial"           },
  { id: 6, name: "Oumar Sow",    role: "Employé",  avatar: "OS", color: "#8B5CF6", status: "Actif",  score: 17, dept: "Ingénierie"           },
  { id: 7, name: "Sidi Chriv",   role: "Employé",  avatar: "SC", color: "#14B8A6", status: "Actif",  score: 14, dept: "Analytics"            },
]

type Presence = "present" | "absent" | "conge"
type AttendanceMap = Record<number, Presence>

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]

const initialAttendance: Record<string, AttendanceMap> = {
  Lundi:    { 1: "present", 2: "present", 3: "absent",  4: "present", 5: "conge",   6: "present", 7: "present" },
  Mardi:    { 1: "present", 2: "conge",   3: "present", 4: "absent",  5: "present", 6: "present", 7: "absent"  },
  Mercredi: { 1: "conge",   2: "present", 3: "present", 4: "present", 5: "present", 6: "absent",  7: "present" },
  Jeudi:    { 1: "present", 2: "present", 3: "absent",  4: "conge",   5: "present", 6: "present", 7: "present" },
  Vendredi: { 1: "present", 2: "present", 3: "present", 4: "present", 5: "absent",  6: "conge",   7: "present" },
}

// ─── Evaluation criteria ──────────────────────────────────────────────────────

type CriterionDef = {
  key: string
  label: string
  desc: string
  icon: React.ElementType
  bg: string
  fg: string
}

const CRITERIA: CriterionDef[] = [
  { key: "discipline",    label: "Discipline",           desc: "Respect des règles, procédures et politiques internes",    icon: BookOpen,       bg: "bg-blue-50",    fg: "text-blue-600"    },
  { key: "ponctualite",   label: "Ponctualité",          desc: "Respect des horaires de travail et des rendez-vous",       icon: Clock,          bg: "bg-violet-50",  fg: "text-violet-600"  },
  { key: "qualite",       label: "Qualité du travail",   desc: "Précision, soin et niveau d'excellence des livrables",     icon: Clipboard,      bg: "bg-emerald-50", fg: "text-emerald-600" },
  { key: "comportement",  label: "Comportement",         desc: "Attitude, professionnalisme et courtoisie avec autrui",    icon: ThumbsUp,       bg: "bg-amber-50",   fg: "text-amber-600"   },
  { key: "productivite",  label: "Productivité",         desc: "Volume et efficacité du travail accompli",                 icon: TrendingUp,     bg: "bg-rose-50",    fg: "text-rose-500"    },
  { key: "equipe",        label: "Esprit d'équipe",      desc: "Collaboration, communication et solidarité entre collègues",icon: HeartHandshake, bg: "bg-pink-50",    fg: "text-pink-600"    },
  { key: "initiative",    label: "Initiative",           desc: "Autonomie, proactivité et force de proposition",           icon: Lightbulb,      bg: "bg-yellow-50",  fg: "text-yellow-600"  },
  { key: "delais",        label: "Respect des délais",   desc: "Livraison dans les temps impartis et anticipation",       icon: Timer,          bg: "bg-cyan-50",    fg: "text-cyan-600"    },
]

type CriteriaScores = Record<string, number>  // 0-5 stars each

function calcScore20(stars: CriteriaScores): number {
  const total = Object.values(stars).reduce((s, v) => s + v, 0)
  return parseFloat(((total / (CRITERIA.length * 5)) * 20).toFixed(1))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scorePct(s: number)  { return Math.round((s / 20) * 100) }
function scoreColor(s: number) {
  if (s >= 16) return "text-emerald-600"
  if (s >= 12) return "text-blue-600"
  if (s >= 10) return "text-amber-600"
  return "text-red-500"
}
function scoreBadge(s: number) {
  if (s >= 16) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (s >= 12) return "bg-blue-50 text-blue-700 border-blue-200"
  if (s >= 10) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-red-50 text-red-700 border-red-200"
}
function scoreLabel(s: number) {
  if (s >= 16) return "Excellent"
  if (s >= 12) return "Bien"
  if (s >= 10) return "Passable"
  return "Insuffisant"
}
function scoreBar(s: number) {
  if (s >= 16) return "bg-emerald-500"
  if (s >= 12) return "bg-blue-500"
  if (s >= 10) return "bg-amber-500"
  return "bg-red-500"
}

const presenceConfig = {
  present: { label: "Présent",  bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", icon: Check  },
  absent:  { label: "Absent",   bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",     icon: X      },
  conge:   { label: "En congé", bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   icon: Coffee },
}

// ─── PDF Export ────────────────────────────────────────────────────────────────

function exportPDF(title: string) {
  const printWin = window.open("", "_blank", "width=900,height=700")
  if (!printWin) { window.print(); return }
  printWin.document.write(`
    <html><head>
      <title>SmartRH — ${title}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; color: #0F172A; padding: 40px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #64748B; font-size: 13px; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { text-align: left; padding: 10px 14px; background: #F7F8FA; font-size: 11px; text-transform: uppercase; color: #64748B; letter-spacing: .05em; border-bottom: 2px solid #E2E8F0; }
        td { padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
        .badge { padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; display: inline-block; }
        .excellent { background: #ECFDF5; color: #065F46; }
        .bien      { background: #EFF6FF; color: #1D4ED8; }
        .passable  { background: #FFFBEB; color: #92400E; }
        .insuffisant { background: #FEF2F2; color: #B91C1C; }
        footer { margin-top: 40px; color: #94A3B8; font-size: 11px; border-top: 1px solid #E2E8F0; padding-top: 16px; }
      </style>
    </head><body>
      <h1>SmartRH — ${title}</h1>
      <div class="sub">Exporté le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · Administrateur : mariemba0000@gmail.com</div>
      <table>
        <thead><tr><th>#</th><th>Employé</th><th>Département</th><th>Statut</th><th>Note / 20</th><th>Performance</th><th>Niveau</th></tr></thead>
        <tbody>
          ${employees.map((e, i) => {
            const lbl = scoreLabel(e.score)
            const cls = lbl === "Excellent" ? "excellent" : lbl === "Bien" ? "bien" : lbl === "Passable" ? "passable" : "insuffisant"
            return `<tr>
              <td>${i + 1}</td>
              <td><strong>${e.name}</strong><br><small style="color:#64748B">${e.role}</small></td>
              <td>${e.dept}</td>
              <td>${e.status}</td>
              <td><strong>${e.score}/20</strong></td>
              <td>${scorePct(e.score)}%</td>
              <td><span class="badge ${cls}">${lbl}</span></td>
            </tr>`
          }).join("")}
        </tbody>
      </table>
      <footer>SmartRH · Gestion des performances · Document confidentiel</footer>
    </body></html>
  `)
  printWin.document.close()
  printWin.focus()
  setTimeout(() => printWin.print(), 500)
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems = [
  { id: "dashboard"  as Screen, label: "Tableau de bord", icon: LayoutDashboard },
  { id: "employees"  as Screen, label: "Employés",        icon: Users           },
  { id: "evaluation" as Screen, label: "Évaluations",     icon: ClipboardList   },
  { id: "attendance" as Screen, label: "Présence",        icon: Calendar        },
  { id: "settings"   as Screen, label: "Paramètres",      icon: Settings        },
]

function Sidebar({ current, onNav, onLogout }: { current: Screen; onNav: (s: Screen) => void; onLogout: () => void }) {
  return (
    <aside className="w-60 h-screen bg-[#0F1629] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-[17px] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SmartRH</span>
        </div>
        {/* ← "Gestion des performances" ici */}
        <p className="text-white/30 text-[11px] mt-1.5 ml-[42px]">Gestion des performances</p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              current === id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "text-white/55 hover:text-white hover:bg-white/[0.07]"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* PDF export shortcut */}
      <div className="px-3 pb-2">
        <button
          onClick={() => exportPDF("Rapport des performances")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all text-sm"
        >
          <FileDown size={15} />
          Exporter rapport PDF
        </button>
      </div>

      <div className="px-3 py-3 border-t border-white/10 shrink-0 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">MA</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">Administrateur</p>
            <p className="text-white/35 text-[11px] truncate">mariemba0000@gmail.com</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ title, subtitle, notifCount = 0, showExport = false }: { title: string; subtitle?: string; notifCount?: number; showExport?: boolean }) {
  const [exported, setExported] = useState(false)

  function handleExport() {
    exportPDF(title)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card shrink-0">
      <div>
        <h1 className="text-[17px] font-bold text-foreground leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        {showExport && (
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
              exported
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {exported ? <CheckCircle size={15} /> : <FileDown size={15} />}
            {exported ? "Exporté !" : "Exporter PDF"}
          </button>
        )}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/25 w-48 transition-all"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={17} className="text-muted-foreground" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{notifCount}</span>
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">MA</div>
      </div>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState("mariemba0000@gmail.com")
  const [password, setPassword] = useState("password123")
  const [loading, setLoading]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1100)
  }

  return (
    <div className="h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex w-[50%] bg-[#071427] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-500/8 blur-3xl translate-y-1/3 -translate-x-1/4" />

        {/* Top badge */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/60 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Application RH — v2.0
          </span>
        </div>

        {/* Center: logo on white card + slogan */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* White card so the JPEG logo is parfaitement visible */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/40 w-52 h-52 flex items-center justify-center">
            <ImageWithFallback
              src={smartRHLogo}
              alt="Logo SmartRH"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Slogan */}
          <div>
            <h2 className="text-[38px] font-extrabold text-white leading-[1.12] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span className="text-blue-400">Évaluez.</span>{" "}
              <span className="text-emerald-400">Motivez.</span>{" "}
              <span className="text-white">Performez.</span>
            </h2>
            <p className="text-white/45 text-[15px] leading-relaxed max-w-sm">
              La plateforme intelligente qui transforme le suivi RH en levier de croissance pour votre entreprise.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Évaluation des talents", "Suivi des présences", "Rapports PDF", "Notes sur 20"].map(f => (
              <span key={f} className="bg-white/[0.07] border border-white/[0.10] text-white/55 text-xs px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Employés actifs", value: "7"   },
              { label: "Perf. moyenne",   value: "78%" },
              { label: "Évaluations",     value: "3"   },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.06] rounded-2xl p-4 border border-white/[0.08] text-center">
                <p className="text-[22px] font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
                <p className="text-white/35 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-white/15 text-xs text-center">© 2024 SmartRH · Tous droits réservés</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#EEF4FF] via-[#F5F8FF] to-[#ECFDF5] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-200/25 blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 w-full max-w-[440px] px-8">

          {/* Logo prominently above card */}
          <div className="flex flex-col items-center mb-7">
            {/* White rounded box so the JPEG background is propre */}
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-slate-100 p-4 w-28 h-28 flex items-center justify-center mb-4">
              <ImageWithFallback
                src={smartRHLogo}
                alt="Logo SmartRH"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-[30px] font-extrabold leading-none text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span className="text-blue-700">Smart</span><span className="text-emerald-600">RH</span>
            </h1>
            <p className="text-slate-500 text-[13px] mt-1.5 font-medium text-center leading-snug max-w-[260px]">
              Pilotez la performance de vos équipes avec intelligence
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-200/40 border border-slate-100 p-8">
            <div className="mb-6 text-center">
              <h2 className="text-[20px] font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Connexion à votre espace
              </h2>
              <p className="text-slate-400 text-sm mt-1">Entrez vos identifiants pour continuer</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/70 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                  <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">Mot de passe oublié ?</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/70 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-[15px] transition-all flex items-center justify-center gap-2.5 mt-1 disabled:opacity-70 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 45%, #059669 100%)", boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}
              >
                {loading
                  ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion en cours...</>
                  : "Se connecter"
                }
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Compte démo</p>
                <p className="text-xs text-slate-400">mariemba0000@gmail.com</p>
                <p className="text-xs text-slate-400">Mot de passe : password123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400/70 mt-5">Accès réservé aux administrateurs RH autorisés</p>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const avgRaw  = employees.reduce((s, e) => s + e.score, 0) / employees.length
  const avgPct  = Math.round((avgRaw / 20) * 100)   // ≈ 78%

  const recent = [
    { text: "Nouvelle évaluation soumise pour Amina Koné",  time: "Il y a 10 min", type: "eval"   },
    { text: "Nouvelle évaluation soumise pour Oumar Sow",   time: "Il y a 42 min", type: "eval"   },
    { text: "Nouvelle évaluation soumise pour Hawa Kane",   time: "Il y a 1h",     type: "eval"   },
    { text: "Amadou Dieye marqué absent (Mardi)",           time: "Il y a 2h",     type: "absent" },
    { text: "Fatou Diallo est en congé cette semaine",      time: "Hier",          type: "conge"  },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Tableau de bord" subtitle="SmartRH · Vue d'ensemble" notifCount={3} showExport />

      <div className="p-8 space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 right-24 w-32 h-32 rounded-full bg-white/5 translate-y-1/3" />
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Bonjour 👋</p>
              <h2 className="text-[22px] font-bold mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bienvenue, Administrateur</h2>
              <p className="text-blue-100/80 text-sm max-w-md">Gérez facilement vos employés et suivez leurs performances depuis votre espace dédié.</p>
            </div>
            <button
              onClick={() => exportPDF("Tableau de bord SmartRH")}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Printer size={15} />
              Imprimer le rapport
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Nombre d'employés",     value: "7",         sub: "Tous actifs",            icon: Users,    bg: "bg-blue-50",    fg: "text-blue-600",    delta: null           },
            { label: "Performance moyenne",   value: `${avgPct}%`, sub: "Score moyen / 20",      icon: TrendingUp,bg:"bg-emerald-50", fg: "text-emerald-600", delta: "+3% ce mois"  },
            { label: "Nouvelles évaluations", value: "3",         sub: "En attente de révision", icon: BellRing, bg: "bg-amber-50",   fg: "text-amber-600",   delta: null           },
          ].map(k => (
            <div key={k.label} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-muted-foreground">{k.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${k.bg} ${k.fg}`}>
                  <k.icon size={17} />
                </div>
              </div>
              <p className="text-[30px] font-bold text-foreground leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{k.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{k.sub}</p>
              {k.delta && (
                <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-emerald-600">
                  <ArrowUpRight size={12} />{k.delta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick access + Recent */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground text-[15px] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Accès rapide</h3>
            <div className="space-y-2">
              {[
                { label: "Liste des employés",        desc: "Consulter les 7 membres",        screen: "employees"  as Screen, icon: Users,        bg: "bg-blue-50",    fg: "text-blue-600"    },
                { label: "Évaluation des performances",desc: "8 critères · Notes sur 20",     screen: "evaluation" as Screen, icon: ClipboardList, bg: "bg-emerald-50", fg: "text-emerald-600" },
                { label: "Présence et planning",      desc: "Suivi hebdomadaire",              screen: "attendance" as Screen, icon: Calendar,      bg: "bg-violet-50",  fg: "text-violet-600"  },
                { label: "Exporter rapport PDF",      desc: "Rapport complet des performances",screen: "dashboard"  as Screen, icon: FileDown,      bg: "bg-amber-50",   fg: "text-amber-600",  export: true },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => "export" in item ? exportPDF("Rapport complet") : onNav(item.screen)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.fg}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications récentes</h3>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">3 nouvelles</span>
            </div>
            <div className="space-y-3">
              {recent.map((n, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${i < 3 ? "bg-blue-50/60 border-blue-100" : "bg-muted/40 border-transparent"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.type === "eval" ? "bg-blue-100" : n.type === "absent" ? "bg-red-100" : "bg-amber-100"}`}>
                    {n.type === "eval"   ? <Star size={13} className="text-blue-600" />          :
                     n.type === "absent" ? <AlertCircle size={13} className="text-red-500" />    :
                                          <Coffee size={13} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                  {i < 3 && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Aperçu des performances</h3>
            <button onClick={() => exportPDF("Rapport des performances")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-600 font-medium transition-colors border border-border hover:border-blue-300 px-3 py-1.5 rounded-lg">
              <FileDown size={13} />
              Exporter
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {[...employees].sort((a, b) => b.score - a.score).slice(0, 4).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: e.color }}>{e.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{e.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBar(e.score)}`} style={{ width: `${scorePct(e.score)}%` }} />
                    </div>
                    <span className={`text-[11px] font-bold shrink-0 ${scoreColor(e.score)}`}>{e.score}/20</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Employee List ─────────────────────────────────────────────────────────────

function EmployeesScreen({ onEvaluate }: { onEvaluate: (e: Employee) => void }) {
  const [search, setSearch] = useState("")

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Liste des employés" subtitle="Cliquez sur un employé pour consulter ou évaluer ses performances" notifCount={3} showExport />
      <div className="p-8 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input placeholder="Rechercher un employé..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/25 w-60" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Users size={12} />{filtered.length} employé{filtered.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: emp.color }}>{emp.avatar}</div>
                  <div>
                    <p className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role} · {emp.dept}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{emp.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Performance</span>
                  <span className={`font-bold ${scoreColor(emp.score)}`}>{emp.score}/20 — {scoreLabel(emp.score)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBar(emp.score)}`} style={{ width: `${scorePct(emp.score)}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                  <Eye size={13} />Profil
                </button>
                <button onClick={() => onEvaluate(emp)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                  <Edit3 size={13} />Évaluer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ value, onChange, color = "#2563EB" }: { value: number; onChange: (n: number) => void; color?: string }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= (hovered || value)
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={22}
              fill={filled ? color : "none"}
              stroke={filled ? color : "#CBD5E1"}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
      <span className="ml-2 text-sm font-bold" style={{ color: value > 0 ? color : "#94A3B8" }}>
        {value > 0 ? value : "—"}<span className="text-muted-foreground font-normal text-xs">/5</span>
      </span>
    </div>
  )
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

const starColors: Record<string, string> = {
  discipline:   "#2563EB",
  ponctualite:  "#7C3AED",
  qualite:      "#059669",
  comportement: "#D97706",
  productivite: "#E11D48",
  equipe:       "#DB2777",
  initiative:   "#CA8A04",
  delais:       "#0891B2",
}

function EvaluationScreen({ preselected }: { preselected: Employee | null }) {
  const [selectedId, setSelectedId] = useState<number | "">(preselected?.id ?? "")
  const [stars, setStars]           = useState<CriteriaScores>({
    discipline: 0, ponctualite: 0, qualite: 0, comportement: 0,
    productivite: 0, equipe: 0, initiative: 0, delais: 0,
  })
  const [comment, setComment]   = useState("")
  const [submitted, setSubmitted] = useState(false)

  const selected  = employees.find(e => e.id === selectedId) ?? null
  const allRated  = Object.values(stars).every(v => v > 0)
  const overall   = allRated ? calcScore20(stars) : 0
  const valid     = selected !== null && allRated

  function handleStar(key: string, val: number) {
    setStars(s => ({ ...s, [key]: val }))
  }

  if (submitted && selected) {
    return (
      <div className="flex-1 overflow-auto">
        <TopBar title="Évaluation des performances" subtitle="Enregistrement confirmé" showExport />
        <div className="p-8 flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md w-full">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={30} className="text-emerald-600" />
            </div>
            <h2 className="text-[22px] font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Évaluation enregistrée !</h2>
            <p className="text-muted-foreground text-sm mb-1">Note globale attribuée à <strong className="text-foreground">{selected.name}</strong></p>
            <p className="my-5 leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span className={`text-[52px] font-bold ${scoreColor(overall)}`}>{overall}</span>
              <span className="text-2xl text-muted-foreground font-medium">/20</span>
            </p>
            <span className={`inline-block text-sm font-semibold px-4 py-1.5 rounded-full border mb-6 ${scoreBadge(overall)}`}>{scoreLabel(overall)}</span>

            {/* Criteria summary */}
            <div className="bg-muted/40 rounded-2xl p-4 mb-6 text-left space-y-2.5">
              {CRITERIA.map(c => (
                <div key={c.key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{c.label}</span>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={13} fill={n <= stars[c.key] ? starColors[c.key] : "none"} stroke={n <= stars[c.key] ? starColors[c.key] : "#CBD5E1"} strokeWidth={1.5} />
                    ))}
                    <span className="text-xs font-bold ml-1 text-muted-foreground">{stars[c.key]}/5</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSubmitted(false); setSelectedId(""); setStars({ discipline:0,ponctualite:0,qualite:0,comportement:0,productivite:0,equipe:0,initiative:0,delais:0 }); setComment("") }}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Nouvelle évaluation
              </button>
              <button
                onClick={() => exportPDF(`Évaluation — ${selected.name}`)}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-semibold rounded-xl hover:bg-muted transition-colors"
              >
                <FileDown size={15} />PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Évaluation des performances" subtitle="8 critères · Notation par étoiles (1 à 5) · Note finale sur 20" notifCount={3} />
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Live score banner */}
          <div className={`rounded-xl p-5 text-white flex items-center justify-between transition-all ${allRated ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gradient-to-r from-slate-600 to-slate-700"}`}>
            <div>
              <p className="text-white/70 text-xs mb-1">Score calculé en temps réel</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="leading-none">
                <span className="text-[40px] font-bold">{allRated ? overall : "—"}</span>
                <span className="text-xl text-white/60 font-medium">/20</span>
              </p>
              {allRated && <span className="mt-1 inline-block text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">{scoreLabel(overall)}</span>}
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs mb-1">{Object.values(stars).filter(v => v > 0).length}/8 critères notés</p>
              <div className="flex gap-1 justify-end">
                {CRITERIA.map(c => (
                  <div key={c.key} className={`w-2.5 h-2.5 rounded-full ${stars[c.key] > 0 ? "bg-white" : "bg-white/25"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Employee select */}
          <div className="bg-card border border-border rounded-xl p-5">
            <label className="text-sm font-bold text-foreground block mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sélectionner un employé
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {employees.map(emp => (
                <button key={emp.id} type="button" onClick={() => setSelectedId(emp.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedId === emp.id ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200" : "border-border hover:bg-muted"}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: emp.color }}>{emp.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{emp.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{emp.dept}</p>
                  </div>
                  {selectedId === emp.id && <CheckCircle size={15} className="text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 8 criteria */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
              <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Critères d'évaluation</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Notez chaque critère de 1 (insuffisant) à 5 (excellent)</p>
            </div>
            <div className="divide-y divide-border">
              {CRITERIA.map((c, idx) => (
                <div key={c.key} className={`flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors ${idx % 2 === 1 ? "bg-muted/[0.03]" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${c.bg} ${c.fg}`}>
                    <c.icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{c.desc}</p>
                      </div>
                      <StarRating value={stars[c.key]} onChange={v => handleStar(c.key, v)} color={starColors[c.key]} />
                    </div>
                    {/* progress bar once rated */}
                    {stars[c.key] > 0 && (
                      <div className="mt-2.5 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(stars[c.key] / 5) * 100}%`, backgroundColor: starColors[c.key] + "99" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="bg-card border border-border rounded-xl p-5">
            <label className="text-sm font-bold text-foreground block mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Commentaire du manager <span className="font-normal text-muted-foreground">(optionnel)</span>
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Ajoutez vos observations, points forts, axes d'amélioration et recommandations pour cet employé..."
              rows={4}
              className="w-full px-3 py-3 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/25 resize-none text-foreground placeholder:text-muted-foreground" />
          </div>

          {/* Submit */}
          <div className="pb-6">
            <button type="button" onClick={() => setSubmitted(true)} disabled={!valid}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 text-sm">
              <CheckCircle size={17} />
              Enregistrer l'évaluation
            </button>
            {!valid && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                {!selected ? "Sélectionnez un employé" : "Notez tous les critères"} pour continuer
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Attendance ───────────────────────────────────────────────────────────────

function AttendanceScreen() {
  const [attendance, setAttendance] = useState(initialAttendance)
  const [activeDay, setActiveDay]   = useState("Lundi")

  function toggle(empId: number) {
    setAttendance(prev => {
      const cur: Presence  = prev[activeDay][empId]
      const next: Presence = cur === "present" ? "absent" : cur === "absent" ? "conge" : "present"
      return { ...prev, [activeDay]: { ...prev[activeDay], [empId]: next } }
    })
  }

  const dayData      = attendance[activeDay]
  const presentCount = Object.values(dayData).filter(v => v === "present").length
  const absentCount  = Object.values(dayData).filter(v => v === "absent").length
  const congeCount   = Object.values(dayData).filter(v => v === "conge").length

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Présence et planning" subtitle="Suivi des présences et planning hebdomadaire" notifCount={3} showExport />
      <div className="p-8 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Présents",  count: presentCount, ...presenceConfig.present },
            { label: "Absents",   count: absentCount,  ...presenceConfig.absent  },
            { label: "En congé",  count: congeCount,   ...presenceConfig.conge   },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg} border ${s.border}`}>
                <s.icon size={18} className={s.text} />
              </div>
              <div>
                <p className={`text-[28px] font-bold leading-none ${s.text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.count}</p>
                <p className={`text-xs font-medium mt-0.5 ${s.text}`}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-1.5 flex gap-1">
          {weekDays.map(d => (
            <button key={d} onClick={() => setActiveDay(d)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeDay === d ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-3 bg-muted/40 border-b border-border flex justify-between items-center">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Employé</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Statut · {activeDay} — cliquer pour modifier</span>
          </div>
          {employees.map((emp, i) => {
            const status = dayData[emp.id]
            const cfg    = presenceConfig[status]
            return (
              <div key={emp.id} className={`flex items-center justify-between px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 1 ? "bg-muted/[0.03]" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: emp.color }}>{emp.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                    <p className="text-[11px] text-muted-foreground">{emp.role} · {emp.dept}</p>
                  </div>
                </div>
                <button onClick={() => toggle(emp.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              </div>
            )
          })}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-foreground text-[15px] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Vue hebdomadaire complète</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4">Employé</th>
                  {weekDays.map(d => (
                    <th key={d} className={`text-center text-[11px] font-semibold uppercase tracking-wider pb-3 px-2 ${d === activeDay ? "text-blue-600" : "text-muted-foreground"}`}>{d.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-t border-border/50">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: emp.color }}>{emp.avatar}</div>
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">{emp.name}</span>
                      </div>
                    </td>
                    {weekDays.map(d => {
                      const s = attendance[d][emp.id]
                      const c = presenceConfig[s]
                      return (
                        <td key={d} className="py-2.5 px-2 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${c.bg}`}>
                            <c.icon size={11} className={c.text} />
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
            {(Object.entries(presenceConfig) as [Presence, typeof presenceConfig.present][]).map(([, c]) => (
              <div key={c.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsScreen({ onLogout }: { onLogout: () => void }) {
  const [name,  setName]  = useState("Administrateur")
  const [email, setEmail] = useState("mariemba0000@gmail.com")
  const [oldPw, setOldPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confPw, setConfPw] = useState("")
  const [notifEval,   setNotifEval]   = useState(true)
  const [notifAbsent, setNotifAbsent] = useState(true)
  const [notifReport, setNotifReport] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaved("Profil mis à jour avec succès !")
    setTimeout(() => setSaved(null), 3000)
  }
  function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setSaved("Mot de passe modifié avec succès !")
    setOldPw(""); setNewPw(""); setConfPw("")
    setTimeout(() => setSaved(null), 3000)
  }

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Paramètres" subtitle="Configuration de l'application" />
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-5">
          {saved && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-emerald-700">{saved}</p>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><UserCircle size={18} className="text-blue-600" /></div>
              <div>
                <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Profil administrateur</h3>
                <p className="text-xs text-muted-foreground">Modifiez vos informations personnelles</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-5 p-4 bg-muted/40 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0">MA</div>
              <div>
                <p className="font-bold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Administrateur RH</span>
              </div>
            </div>
            <form onSubmit={saveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Nom complet</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-foreground" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Adresse e-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 text-foreground" />
              </div>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Enregistrer les modifications
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0"><Lock size={17} className="text-violet-600" /></div>
              <div>
                <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Modifier le mot de passe</h3>
                <p className="text-xs text-muted-foreground">Choisissez un mot de passe sécurisé</p>
              </div>
            </div>
            <form onSubmit={savePassword} className="space-y-3">
              {[
                { label: "Mot de passe actuel",    value: oldPw,  setter: setOldPw  },
                { label: "Nouveau mot de passe",   value: newPw,  setter: setNewPw  },
                { label: "Confirmer le mot de passe", value: confPw, setter: setConfPw },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">{f.label}</label>
                  <input type="password" value={f.value} onChange={e => f.setter(e.target.value)} placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 text-foreground" />
                </div>
              ))}
              {newPw && confPw && newPw !== confPw && <p className="text-xs text-red-500 font-medium">Les mots de passe ne correspondent pas</p>}
              <button type="submit" disabled={!oldPw || !newPw || newPw !== confPw}
                className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors">
                Mettre à jour
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0"><BellRing size={17} className="text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h3>
                <p className="text-xs text-muted-foreground">Gérez vos préférences de notifications</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nouvelles évaluations", desc: "Alerte lors de chaque nouvelle évaluation", value: notifEval,   setter: setNotifEval   },
                { label: "Absences et congés",    desc: "Alertes sur les absences non justifiées",   value: notifAbsent, setter: setNotifAbsent },
                { label: "Rapports mensuels",     desc: "Résumé automatique de fin de mois",         value: notifReport, setter: setNotifReport },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between gap-4 py-1">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                  </div>
                  <button onClick={() => n.setter(!n.value)}
                    className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${n.value ? "bg-blue-600" : "bg-muted-foreground/30"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${n.value ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0"><LogOut size={17} className="text-red-500" /></div>
              <div>
                <h3 className="font-bold text-foreground text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Déconnexion</h3>
                <p className="text-xs text-muted-foreground">Mettre fin à votre session actuelle</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="px-5 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2">
              <LogOut size={15} />Se déconnecter
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,     setScreen]     = useState<Screen>("login")
  const [evalTarget, setEvalTarget] = useState<Employee | null>(null)

  if (screen === "login") return <LoginScreen onLogin={() => setScreen("dashboard")} />

  function goEvaluate(emp: Employee) { setEvalTarget(emp); setScreen("evaluation") }

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={setScreen} onLogout={() => setScreen("login")} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {screen === "dashboard"  && <DashboardScreen  onNav={setScreen} />}
        {screen === "employees"  && <EmployeesScreen  onEvaluate={goEvaluate} />}
        {screen === "evaluation" && <EvaluationScreen preselected={evalTarget} />}
        {screen === "attendance" && <AttendanceScreen />}
        {screen === "settings"   && <SettingsScreen   onLogout={() => setScreen("login")} />}
      </div>
    </div>
  )
}
