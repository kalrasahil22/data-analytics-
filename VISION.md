# Data Analytics Dashboard — Complete Project Overview

## 🧭 Project Vision

A modern, full-stack **Data Analytics Dashboard** that allows users to visualize, upload, and analyze datasets in real time. Built with a **FastAPI Python backend** (SQLite/SQLAlchemy) and a **responsive JavaScript frontend** (Chart.js, vanilla JS), this project demonstrates a professional SaaS analytics platform suitable for a GitHub portfolio.

---

## 📁 Project Structure

```
project-root/
│
├── index.html          # Main HTML — dashboard layout, sidebar, charts, upload, settings
├── style.css           # Full dark/light theme CSS — 28KB of responsive styles
├── script.js           # Frontend JS — charts, API calls, animations, interactions
│
├── main.py             # FastAPI entry point — uvicorn server, static file serving
├── seed.py             # Seeds initial data into SQLite database
│
├── backend/
│   ├── __init__.py     # Package init
│   ├── database.py     # SQLAlchemy engine + session + Base
│   ├── models.py       # 6 ORM models (tables)
│   ├── schemas.py      # Pydantic response models
│   └── routes.py       # API route handlers
│
├── uploads/            # Directory for uploaded CSV/Excel files
└── dashboard.db        # SQLite database (auto-generated on first run)
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | Dashboard UI |
| **Charts** | Chart.js 4.4.1 | Bar, Line, Doughnut charts |
| **Icons** | Font Awesome 6.5 | UI icons |
| **Font** | Google Inter | Typography |
| **Backend** | Python 3.14 + FastAPI | REST API server |
| **ORM** | SQLAlchemy 2.0 | Database interactions |
| **Database** | SQLite | Local relational DB |
| **Data Parsing** | pandas + openpyxl | CSV/Excel file parsing |
| **Server** | Uvicorn | ASGI server |

---

## 🗄️ Database Schema (6 tables)

### 1. `monthly_sales`
Stores 12 months of sales and revenue data for charting.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `month` | VARCHAR(10) | Month abbreviation (Jan-Dec) |
| `year` | INTEGER | Year (default 2026) |
| `sales` | FLOAT | Total sales in dollars |
| `revenue` | FLOAT | Revenue in thousands |

### 2. `categories`
Category distribution breakdown for the pie chart.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `name` | VARCHAR(50) UNIQUE | Category name |
| `percentage` | FLOAT | Market share % |
| `color` | VARCHAR(20) | Hex color for chart |
| `growth` | VARCHAR(10) | Growth trend string |

### 3. `dashboard_metrics`
Summary card values (Total Records, Revenue, Growth, Active Users).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `metric_name` | VARCHAR(50) UNIQUE | Metric identifier |
| `metric_value` | FLOAT | Current value |
| `unit` | VARCHAR(20) | Display unit |
| `change` | VARCHAR(10) | % change indicator |
| `updated_at` | DATETIME | Last updated timestamp |

### 4. `uploaded_files`
Tracks all uploaded CSV/Excel files.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `filename` | VARCHAR(255) | Original filename |
| `filepath` | VARCHAR(512) | Server path |
| `upload_date` | DATETIME | Upload timestamp |
| `status` | VARCHAR(20) | Current status |
| `record_count` | INTEGER | Rows parsed |

### 5. `data_records`
Parsed row data from uploaded files.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `file_id` | INTEGER FK → uploaded_files | Parent file |
| `category` | VARCHAR(100) | Record category |
| `value` | FLOAT | Record value |
| `record_date` | VARCHAR(20) | Associated date |

### 6. `insights`
Analysis insights text generated from data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `content` | TEXT | Insight description |
| `created_at` | DATETIME | Creation timestamp |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/data` | Full dashboard data | — | `{ summary, charts }` |
| `POST` | `/api/upload` | Upload CSV/Excel | `multipart/form-data` file | `{ filename, size, status, record_count }` |
| `POST` | `/api/analyze` | Run analysis | — | `{ status, message, insights: [] }` |
| `GET` | `/api/files` | List uploaded files | — | `[{ filename, size, status, record_count }]` |
| `GET` | `/api/insights` | Get all insights | — | `["string", ...]` |
| `GET` | `/*` | Serve static frontend | — | HTML/CSS/JS files |

---

## 🎨 Frontend Architecture

### Layout
```
┌─────────────┬──────────────────────────────────────┐
│   SIDEBAR   │            TOP NAVBAR                │
│   (270px)   ├──────────────────────────────────────┤
│  - Logo     │  Search | Clock | Theme | Bell | User │
│  - User     ├──────────────────────────────────────┤
│  - Nav:     │          MAIN CONTENT                │
│    • Dashboard│  ┌─ Welcome Row ─┐                  │
│    • Upload  │  ├─ Quick Actions ┤                  │
│    • Reports │  ├─ Summary Cards ┤                  │
│    • Settings│  ├─ Charts Grid ──┤                  │
│  - Status   │  └─────────────────┘                  │
└─────────────┴──────────────────────────────────────┘
```

### Pages/Sections (Single Page App)
1. **Dashboard** — Welcome, quick actions, 4 summary cards, 3 charts (bar/line/pie), category table
2. **Upload Data** — Drag & drop area, file preview table, analyze button, insights panel
3. **Reports** — 4 downloadable report cards (Sales, Users, Revenue, Categories)
4. **Settings** — Toggle switches (Dark Mode, Compact, Email, Push, Auto-refresh, Export)

### Interactive Features
- **Animated counters** — Numbers count up smoothly (ease-out cubic)
- **Skeleton loaders** — Shimmer placeholders during API fetch
- **Toast notifications** — Slide-in success/error/info/warning popups (auto-dismiss 4s)
- **Ripple effect** — Button click ripple animation
- **Scroll reveal** — IntersectionObserver-based fade-in as user scrolls
- **Keyboard shortcuts modal** — Press `?` to open (nav: 1-4, theme: T, search: `/`)
- **Dark/Light theme toggle** — Persisted in localStorage, smooth CSS transitions
- **Live clock** — Updates every second via `setInterval`
- **Scroll-to-top** — Appears after 400px scroll
- **Search bar** — Enter triggers search toast
- **Refresh button** — One-click data refresh with spinner
- **Filter dropdown** — Changes simulated data ranges
- **Notification bell** — Click shows notification toast
- **Collapsible sidebar** — Slides in/out on mobile with overlay

### Chart.js Configuration
- **Bar Chart**: Dynamic gradient opacity based on value relative to max, 6px border radius, responsive
- **Line Chart**: Smooth tension 0.4, filled area with gradient, hover point radius 7
- **Doughnut Chart**: 62% cutout, 3px border between segments, hover offset 10

### Responsive Breakpoints
| Breakpoint | Behavior |
|------------|----------|
| >1024px | Full layout, sidebar fixed 270px, 2-column charts |
| 768-1024px | Single column charts, narrower search |
| <768px | Sidebar hidden (hamburger), overlay, single column cards, hidden clock |
| <480px | Single column everything, compact modal |

---

## 🖌️ Design System

### Color Palette (Dark Theme)
```
--bg-primary:    #0a0e1a    (deep navy)
--bg-card:       #151b2b    (dark blue-gray)
--accent-blue:   #4f8cff    (primary blue)
--accent-purple: #7c5cfc    (secondary purple)
--accent-green:  #2ed573    (positive growth)
--accent-orange: #ff9f43    (warning / accent)
```

### Light Theme
Same structure with inverted values:
```
--bg-primary:    #f0f2f8    (light gray)
--bg-card:       #ffffff    (white)
--text-primary:  #1a1d2e    (dark navy)
```

### Typography
- **Font**: Inter (300-800 weight)
- **Base size**: 15px
- **Headings**: 1.7rem bold
- **Card values**: 1.6rem bold with tabular-nums

### Animations
- `sectionFadeIn` — 0.4s ease on page switch
- `shimmer` — 1.5s skeleton loading gradient sweep
- `logoPulse` — 3s glow pulse on sidebar logo
- `waveAnim` — 2s hand wave emoji
- `toastIn/Out` — 0.4s slide in, 0.4s slide out at 3.5s
- `spin` — 0.7s loading spinner
- `rippleAnim` — 0.6s button click effect
- `slideIn` — 0.4s staggered insight items
- `modalIn` — 0.3s scale-up modal

---

## 🔐 Data Flow

```
Browser                         FastAPI Server                   SQLite
   │                                │                              │
   ├── GET / ──────────────────────►│                              │
   │◄── index.html ────────────────┤                              │
   │                                │                              │
   ├── GET /api/data ──────────────►│                              │
   │                                ├── Query monthly_sales ───────►│
   │                                ├── Query categories ──────────►│
   │                                ├── Query dashboard_metrics ───►│
   │                                │◄── Results ──────────────────┤
   │                                │                              │
   │◄── { summary, charts } ───────┤                              │
   │                                │                              │
   ├── POST /api/upload (CSV) ─────►│                              │
   │                                ├── pandas.read_csv()          │
   │                                ├── INSERT into uploaded_files─►│
   │                                ├── INSERT into data_records ──►│
   │◄── { status: "uploaded" } ────┤                              │
   │                                │                              │
   ├── POST /api/analyze ──────────►│                              │
   │                                ├── Query insights ───────────►│
   │◄── { insights: [...] } ───────┤                              │
```

---

## 🧪 Sample Data (Seeded by `seed.py`)

**Monthly Sales** (12 months, 2026):
| Month | Sales ($) | Revenue ($K) |
|-------|-----------|--------------|
| Jan | 4,200 | 38 |
| Feb | 5,100 | 42 |
| ... | ... | ... |
| Dec | 10,200 | 92 |

**Categories**:
| Category | Share | Color | Growth |
|----------|-------|-------|--------|
| Electronics | 35% | #4f8cff | +12.3% |
| Clothing | 25% | #7c5cfc | +8.7% |
| Food | 20% | #2ed573 | +5.2% |
| Books | 12% | #ff9f43 | -1.4% |
| Others | 8% | #5a6072 | +3.8% |

**Dashboard Metrics**:
| Metric | Value | Change |
|--------|-------|--------|
| Total Records | 284,650 | +12.5% |
| Total Revenue | $1.84M | +8.2% |
| Growth % | 23.6% | +3.1% |
| Active Users | 12,438 | -2.4% |

---

## 🚀 How to Run

```bash
# Install dependencies
pip install fastapi uvicorn sqlalchemy pandas openpyxl python-multipart

# Seed database & start server
python main.py

# Open in browser
# http://localhost:8000
```

The server auto-seeds the database on first startup via `seed.py`.

---

## 🔧 Possible Enhancements

1. **User Authentication** — JWT-based login/multi-tenant
2. **Real CSV Analytics** — Actual aggregation queries on uploaded data
3. **Export to PDF** — Generate downloadable PDF reports
4. **Real-time Updates** — WebSocket for live data streaming
5. **Advanced Filters** — Multi-select, date range picker, custom dimensions
6. **Data Tables** — Paginated, sortable, searchable data grids (AG Grid)
7. **Role-based Access** — Admin/Analyst/Viewer permissions
8. **Docker Deployment** — Containerized with docker-compose
9. **CI/CD Pipeline** — GitHub Actions for automated testing
10. **Unit & Integration Tests** — pytest for backend, Jest for frontend
