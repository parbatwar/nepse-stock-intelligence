# NEPSE Stock Intelligence

A full-stack stock market intelligence application focused on selected companies listed on the Nepal Stock Exchange (NEPSE).

The system collects market news, historical price data, and sampled floorsheet transactions, then performs company tagging, sentiment analysis, broker activity analysis, volume anomaly detection, and simple news-to-market correlation analysis.

The project was developed as a time-boxed technical assignment using Django REST Framework, PostgreSQL, Celery, Redis, React, and Tailwind CSS.

---

## Area Prioritized

Given the time-boxed nature of the assignment, I prioritized the **backend architecture, data pipeline, API design, RBAC, and behavior-analysis workflow**.

The goal was to make the system reliable end-to-end: crawling data, storing it cleanly in PostgreSQL, running background jobs with Celery, enforcing Admin/Analyst/Viewer permissions on the server, exposing clear REST APIs, and producing interpretable market-behavior analysis.

For news categorization, I intentionally used a **rule-based multi-label entity/alias matching approach** rather than training a machine-learning model. This was a deliberate trade-off because the watchlist is small and fixed, and the approach is fast, explainable, reproducible, and practical within the assignment time limit.

The frontend was kept intentionally simple and functional, focusing on clearly tying together company prices, volume, broker activity, news, correlations, review workflows, and exports rather than spending excessive time on visual complexity.

## Features

- Multi-source financial news crawling
- Automatic multi-label company categorization
- Confidence score for automatic tagging
- Manual news tag correction
- Audit history for categorization corrections
- Historical OHLCV market data
- Sampled historical floorsheet transactions
- VWAP analysis
- Typical-price fallback when transaction-level VWAP is unavailable
- Buy/sell pressure analysis
- Broker activity and net quantity analysis
- Volume anomaly detection
- News sentiment analysis
- News-to-market correlation analysis
- JWT authentication
- Admin / Analyst / Viewer RBAC
- CSV behavior-analysis export
- Swagger / OpenAPI API documentation
- Responsive React dashboard
- Scheduled background crawling and analysis
- Manual Admin-triggered crawl runs

---

# Architecture

The application is divided into a Django REST Framework backend and a React frontend.

The backend is organized into separate Django applications so raw market data, news data, analysis results, authentication, and crawler logic remain separated.

## Backend Applications

- `accounts` — users, authentication, roles, and permissions
- `companies` — tracked NEPSE companies and watchlist information
- `news` — crawled articles, company tags, sentiment, and correction history
- `market` — daily OHLCV data and floorsheet transactions
- `analysis` — behavior analysis, VWAP, anomalies, pressure, and correlations
- `crawler` — crawler services, background jobs, and crawl-run history

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Celery
- Redis
- django-celery-beat
- JWT Authentication
- drf-spectacular
- Pandas

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Crawling / Data Processing

- Requests
- BeautifulSoup
- Playwright
- VADER Sentiment

---

# Project Structure

```text
nepse-stock-intelligence/
│
├── backend/
│   ├── accounts/
│   ├── analysis/
│   ├── companies/
│   ├── crawler/
│   ├── market/
│   ├── news/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── api.js
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Setup and Installation

## Prerequisites

Install:

- Python 3.12+
- Node.js
- Git
- Docker Desktop

---

## 1. Clone the Repository

```bash
git clone https://github.com/parbatwar/nepse-stock-intelligence.git
cd nepse-stock-intelligence
```

---

## 2. Start PostgreSQL and Redis

From the project root:

```bash
docker compose up -d
```

The Docker configuration starts:

- PostgreSQL
- Redis

The PostgreSQL container is mapped to host port:

```text
5434
```

---

# Backend Setup

Move to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Install Playwright Chromium:

```bash
playwright install chromium
```

---

## Environment Variables

Create:

```text
backend/.env
```

Use `.env.example` as reference.

Example:

```env
DB_NAME=nepse_stock
DB_USER=nepse
DB_PASSWORD=nepse123
DB_HOST=localhost
DB_PORT=5434

REDIS_URL=redis://localhost:6379/0

SECRET_KEY=replace-with-a-secure-secret-key
DEBUG=True
```

Generate a Django secret key if required:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Do not commit the real `.env` file to Git.

---

## Run Migrations

```bash
python manage.py migrate
```

---

## Start Django

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/api/docs/
```

OpenAPI schema:

```text
http://127.0.0.1:8000/api/schema/
```

---

# Celery Worker

Open a separate terminal:

```bash
cd backend
.venv\Scripts\activate
```

Start Celery:

```bash
celery -A config worker -l info --pool=solo
```

`--pool=solo` is used for reliable Celery execution on Windows.

---

# Celery Beat

Open another terminal:

```bash
cd backend
.venv\Scripts\activate
```

Start the scheduler:

```bash
celery -A config beat -l info
```

Current scheduled jobs:

- News crawling every 2 hours
- Market refresh and analysis daily at 6:30 PM Nepal time

---

# Frontend Setup

Move to:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Tracked Companies

The project currently tracks six NEPSE companies:

| Symbol | Company |
|---|---|
| NABIL | Nabil Bank Limited |
| NICA | NIC Asia Bank Limited |
| SHIVM | Shivam Cements Limited |
| HDL | Himalayan Distillery Limited |
| CHCL | Chilime Hydropower Company Limited |
| NTC | Nepal Doorsanchar Company Limited |

This size was selected to keep the assignment pipeline manageable while still demonstrating cross-company analysis.

---

# Data Sources

## News Sources

The crawler currently collects financial-market news from:

- ShareSansar
- MeroLagani
- Bizmandu

NepseAlpha was evaluated as an additional source but was not included in the final crawler because its listing relied more heavily on client-side rendering.

Given the assignment time constraint and the availability of three working sources, adding more browser automation solely for an additional news source was considered unnecessary complexity.

---

## Market Data

Historical daily OHLCV data is imported from an unofficial ShareSansar archive.

The dataset provides approximately one month of daily market data for the tracked companies.

The imported fields include:

- open
- high
- low
- close
- volume
- turnover
- trading date

The historical source is suitable for the assignment but should not be treated as an official real-time NEPSE market-data feed.

A production system should use an official or licensed market-data provider.

---

# Floorsheet Data

Historical transaction-level floorsheet samples are collected from MeroLagani using Playwright.

The crawler uses the actual date filter on the source website rather than pretending current transactions represent historical data.

Representative imported trading days include:

- August 19, 2026
- August 20, 2026
- August 21, 2026

Tracked transaction data was available for companies including:

- SHIVM
- HDL
- NTC

Some tracked companies did not have matching transactions in the sampled floorsheet data.

The application reports the absence of sampled data instead of generating synthetic broker activity.

---

# Crawling and Pipeline Reliability

The crawling pipeline is designed to run end-to-end while isolating source-specific failures.

Implemented reliability features include:

- custom User-Agent
- `robots.txt` checking
- crawl-delay support
- default request delay
- request timeout
- source-specific error handling
- URL-based article deduplication
- persistent crawl-run history
- background execution with Celery
- scheduled execution with Celery Beat

If one news source fails, the other configured sources can continue processing.

This prevents a single portal failure from terminating the entire crawl run.

---

# Crawling Ethics

The crawler accesses publicly available pages only.

The implementation includes:

- `robots.txt` checks
- crawl-delay handling
- conservative request timing
- request timeouts
- identifiable User-Agent behavior
- failure isolation

A production deployment should additionally review the current terms of service and data-use policies of every source and prefer official APIs where available.

---

# News Categorization

Each crawled article can be tagged to one or more tracked companies.

This is implemented as a multi-label relationship rather than assigning only one company per article.

## Categorization Method

The system uses deterministic company-name and alias matching.

Aliases are configured for the tracked company watchlist.

Matches are checked against:

- article headline
- article body

A company mentioned in the headline receives stronger evidence than a company appearing only in the body.

The resulting tag includes a confidence score.

---

## Why This Approach Was Chosen

The assignment tracks only a small and fixed set of companies.

For this scope, deterministic alias matching provides several advantages:

- fast
- explainable
- reproducible
- no training process required
- no third-party inference cost
- naturally supports multi-label classification

This was considered more appropriate for a 6–8 hour assignment than building or fine-tuning a machine-learning classifier.

---

## Categorization Limitations

Rule-based entity matching may miss:

- indirect company references
- spelling variations
- abbreviations not configured as aliases
- ambiguous aliases
- Nepali-language references
- semantic references without an explicit company name

A production version could combine this baseline with:

- Named Entity Recognition
- multilingual embeddings
- finance-specific classifiers
- multilingual transformer models
- LLM-assisted classification

The categorization confidence score is a heuristic evidence score.

It should not be interpreted as a calibrated statistical probability.

---

# Manual Categorization Review

Analyst and Admin users can manually correct article-company classifications.

Manual correction supports:

- adding/removing company tags
- reviewer reason
- reviewer identity
- previous classification
- updated classification
- audit history

Manual classifications use explicit manual-review metadata so they can be distinguished from automatically generated tags.

---

# Sentiment Analysis

VADER is used as a lightweight sentiment baseline.

The system stores article sentiment as part of the news-processing pipeline.

VADER was selected because it provides:

- fast inference
- no external API dependency
- simple integration
- reasonable results for English text

However, VADER is primarily designed for English.

Therefore, sentiment results for Nepali-language content such as some Bizmandu articles may be neutral or unreliable.

A production version should use a Nepali or multilingual financial sentiment model.

---

# Market Behavior Analysis

The analysis pipeline calculates daily company behavior metrics using price, volume, and available floorsheet data.

Metrics include:

- daily price trend
- daily volume trend
- VWAP
- price/VWAP comparison
- buy/sell pressure
- volume ratio
- rolling volume z-score
- volume anomalies
- broker activity
- broker net quantity
- news/market correlations

Results are persisted in the database rather than recalculated for every frontend request.

---

# VWAP

Where transaction-level floorsheet data exists, true VWAP is calculated as:

```text
VWAP = Σ(rate × quantity) / Σ(quantity)
```

This represents the volume-weighted average transaction price for the sampled floorsheet day.

Where transaction-level floorsheet data is unavailable, the application uses:

```text
(high + low + close) / 3
```

as a typical-price proxy.

The fallback is explicitly treated as a proxy and not presented as true transaction-level VWAP.

---

# Buy / Sell Pressure

The application uses daily price movement and volume change to create an interpretable pressure label.

Possible labels include:

- STRONG_BUY
- WEAK_BUY
- NEUTRAL
- WEAK_SELL
- STRONG_SELL

For example:

- increasing price with increasing volume provides stronger buy evidence
- decreasing price with increasing volume provides stronger sell evidence

This is an analytical heuristic rather than an investment recommendation.

---

# Volume Anomaly Detection

Volume anomalies are detected using a rolling historical window.

The system calculates:

- rolling mean volume
- rolling standard deviation
- volume ratio
- volume z-score

A trading day is considered anomalous when:

```text
|z-score| >= 2
```

This allows unusual trading-volume activity to be highlighted without manually setting a fixed volume threshold for every company.

---

# Broker Activity

Transaction-level floorsheet data is aggregated by broker.

The system calculates:

- quantity bought
- quantity sold
- net quantity
- most active buyers
- most active sellers

Net quantity is interpreted as:

```text
Net Quantity = Buy Quantity - Sell Quantity
```

Positive values indicate net buying in the sampled data.

Negative values indicate net selling.

Broker activity is only shown where transaction-level data actually exists.

---

# News and Market Correlation

Tagged news is aligned with subsequent market observations.

The system evaluates simple relationships including:

- news count vs next-day volume
- sentiment vs next-day return
- sentiment vs next-day volume

Pearson correlation is used as an exploratory statistical measure.

These results should not be interpreted as evidence that news causes price movement.

Because the dataset is small, correlation values are treated as descriptive observations only.

When there are too few overlapping observations or insufficient statistical variation, the system reports insufficient data rather than producing misleading correlation results.

---

# Observed Findings

The current dataset produces several useful exploratory observations.

## SHIVM

SHIVM has the strongest usable overlap between categorized news and market observations.

The observed correlation between news activity and next-day volume is approximately:

```text
0.54
```

This represents a moderate positive relationship in the current small sample.

However, sentiment and next-day price correlation is approximately:

```text
-0.015
```

which is effectively close to zero.

This suggests that, within the available sample, news activity aligned more clearly with trading activity than with directional price movement.

This should not be treated as a predictive relationship because the sample is small.

---

## VWAP Observations

On sampled floorsheet days, transaction-level VWAP for SHIVM was close to the daily closing price.

Example:

```text
SHIVM
August 20, 2026

VWAP: approximately 631.03
Close: approximately 631.00
```

This suggests that transaction activity on that sampled day was concentrated near the final closing level rather than being heavily skewed away from it.

---

## NTC Volume Anomaly

NTC produced a notable volume anomaly during the historical period.

One observed trading day produced a rolling volume z-score above:

```text
2
```

which triggered the system's anomaly threshold.

This indicates unusually high volume relative to NTC's recent rolling baseline.

The anomaly identifies unusual activity but does not by itself explain its cause.

---

## NICA Price Behavior

NICA showed a clear downward price movement across part of the observed period.

The behavior model classified several sessions as sell pressure when falling prices were accompanied by stronger volume.

The pressure label should be interpreted as a descriptive market-behavior indicator and not as a trading signal.

---

## Insufficient Correlation Data

Several companies do not currently have enough categorized news observations to produce defensible news/price correlations.

For those companies the frontend displays:

```text
Insufficient data
```

instead of presenting unstable or fabricated statistics.

This behavior is intentional.

---

# Role-Based Access Control

Three application roles are supported.

## Viewer

Viewer users can:

- view companies
- view dashboard data
- view price history
- view floorsheet information
- view behavior analysis
- view categorized news

Viewer users cannot modify data.

---

## Analyst

Analyst users can perform Viewer actions plus:

- review news classifications
- manually recategorize articles
- export behavior-analysis data

---

## Admin

Admin users can perform Analyst actions plus:

- manage tracked companies
- trigger crawler runs
- inspect crawl history
- manage application users
- assign user roles

---

## RBAC Matrix

| Feature | Admin | Analyst | Viewer |
|---|---:|---:|---:|
| View dashboard | Yes | Yes | Yes |
| View company analysis | Yes | Yes | Yes |
| View news | Yes | Yes | Yes |
| Correct news tags | Yes | Yes | No |
| Export analysis | Yes | Yes | No |
| Manage watchlist | Yes | No | No |
| Trigger crawler | Yes | No | No |
| Manage users | Yes | No | No |

Role permissions are enforced on the backend.

Frontend visibility is used for user experience but is not relied upon as the security mechanism.

---

# API Overview

## Authentication

```text
POST /api/auth/login/
POST /api/auth/token/refresh/
GET  /api/auth/me/
```

---

## Companies

```text
GET /api/companies/
GET /api/companies/:id/prices/?range=30d
GET /api/companies/:id/floorsheet/?date=
GET /api/companies/:id/broker-summary/
```

---

## News

```text
GET  /api/news/
GET  /api/news/?company_id=:id
POST /api/news/:id/recategorize/
```

---

## Analysis

```text
GET /api/companies/:id/behavior-summary/
GET /api/companies/:id/news-price-correlation/
GET /api/export/behavior/
```

---

## Admin Companies

```text
GET    /api/admin/companies/
POST   /api/admin/companies/
GET    /api/admin/companies/:id/
PATCH  /api/admin/companies/:id/
DELETE /api/admin/companies/:id/
```

---

## Admin Crawling

```text
POST /api/admin/crawl-runs/
GET  /api/admin/crawl-runs/
GET  /api/admin/crawl-runs/:id/
```

---

## Admin Users

```text
GET   /api/admin/users/
POST  /api/admin/users/
PATCH /api/admin/users/:id/role/
```

---

# CSV Export

Analyst and Admin users can export persisted behavior-analysis results.

Endpoint:

```text
GET /api/export/behavior/
```

The generated CSV includes fields such as:

- company
- date
- close price
- VWAP
- pressure label
- pressure score
- volume ratio
- volume z-score
- volume anomaly

The React dashboard provides an Export CSV action for authorized users.

Viewer users are denied by the backend even if they attempt to call the endpoint directly.

---

# API Validation and Error Handling

Django REST Framework serializers provide request validation.

A centralized exception handler is used to provide a more consistent API error format.

Example:

```json
{
  "success": false,
  "status_code": 403,
  "errors": {
    "detail": "You do not have permission to perform this action."
  }
}
```

This keeps authentication, validation, and permission failures easier for the frontend to handle.

---

# Frontend

The React frontend provides several main workflows.

## Dashboard

The main dashboard shows:

- tracked companies
- latest close
- daily change
- trading volume
- volatility
- categorized-news count
- most active company
- most volatile company
- company with the most news

Each tracked company links to its detailed analysis page.

---

## Company Detail

The company-detail view brings multiple datasets together.

It includes:

- closing-price chart
- trading-volume chart
- VWAP / typical-price information
- buy/sell pressure
- volume z-score
- anomaly count
- broker activity
- categorized news
- news/market correlation

---

## News Review

Analyst and Admin users can:

- inspect categorized articles
- see confidence scores
- see whether a tag is automatic or manual
- select one or multiple companies
- submit corrected classifications

---

## Crawl Runs

Admin users can:

- manually trigger a news crawl
- inspect recent crawl runs
- inspect crawl status
- see newly created records

The crawler runs as a background Celery task rather than blocking the frontend request.

---

# Engineering Decisions and Time-Boxed Trade-offs

This project was developed as a 6–8 hour technical assignment.

The implementation therefore prioritizes a complete, understandable end-to-end pipeline over unnecessary production-scale complexity.

---

## Why Django REST Framework

Django REST Framework was selected because the assignment required:

- REST APIs
- PostgreSQL persistence
- authentication
- role-based permissions
- serializers
- validation
- administration
- structured ORM models

Using Django allowed these requirements to be implemented within one mature ecosystem.

---

## Why Celery and Redis

Crawling and analysis are potentially slow operations.

Running these operations directly inside API requests would make requests slow and unreliable.

Celery provides asynchronous task execution, while Redis acts as the task broker.

Celery Beat provides recurring scheduled execution.

---

## Why Rule-Based Categorization Instead of ML Training

Training a company classifier would require:

- labeled data
- model selection
- training
- evaluation
- additional complexity

For six fixed companies, deterministic entity matching provides a simpler and more explainable baseline.

This trade-off was intentional.

A production system with hundreds of companies and more languages would justify a more advanced classification pipeline.

---

## Why Browser Automation Is Limited

Normal HTTP crawling is used where possible.

Playwright is only used where browser interaction is required, particularly for historical floorsheet date filtering.

This avoids unnecessarily using browser automation for every source.

---

## Why Analysis Is Persisted

Behavior-analysis results are stored in PostgreSQL.

This avoids repeatedly performing Pandas calculations every time a dashboard endpoint is requested.

It also makes analysis results auditable and easier to export.

---

# Known Limitations

The current project has several intentional limitations.

1. The tracked watchlist is limited to six companies.

2. Historical market data comes from an unofficial archive rather than an official NEPSE feed.

3. Historical floorsheet data is sampled for representative dates rather than collected for every trading session.

4. VADER is primarily English-focused and is less reliable for Nepali financial content.

5. Company categorization depends on configured aliases and may miss indirect references.

6. Correlation analysis is based on a small sample and is exploratory only.

7. The project does not provide live WebSocket market updates.

8. The project is not intended to provide investment advice or trading predictions.

These limitations were accepted to keep the implementation focused on demonstrating the requested full-stack data pipeline within the assignment time constraint.

---

# Security Considerations

- Secrets are stored using environment variables.
- `.env` is excluded from source control.
- JWT authentication protects API endpoints.
- Role permissions are checked server-side.
- Viewer restrictions do not depend solely on frontend hiding.
- Request validation is handled through DRF serializers.

Production deployment should additionally use:

- `DEBUG=False`
- strong secret rotation
- restricted allowed hosts
- HTTPS
- production CORS configuration
- production database credentials
- secure secret management

---

# Running a Full Local Demo

A complete demo can be run using separate terminals.

## Terminal 1

Start infrastructure:

```bash
docker compose up -d
```

## Terminal 2

Start Django:

```bash
cd backend
.venv\Scripts\activate
python manage.py runserver
```

## Terminal 3

Start Celery Worker:

```bash
cd backend
.venv\Scripts\activate
celery -A config worker -l info --pool=solo
```

## Terminal 4

Start Celery Beat:

```bash
cd backend
.venv\Scripts\activate
celery -A config beat -l info
```

## Terminal 5

Start React:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

Swagger:

```text
http://127.0.0.1:8000/api/docs/
```

---

# Suggested Demo Flow

For a reviewer or demo video:

1. Log in as Viewer and show the dashboard.
2. Open a company detail page.
3. Show price, volume, VWAP, pressure, and anomaly metrics.
4. Show broker activity for a company with sampled floorsheet data.
5. Show categorized news.
6. Log in as Analyst.
7. Open News Review.
8. Correct a multi-label article classification.
9. Export behavior-analysis CSV.
10. Log in as Admin.
11. Open Crawl Runs.
12. Trigger a new crawl.
13. Show crawl-run status.
14. Show Swagger API documentation.
15. Briefly show the RBAC restrictions for Viewer / Analyst / Admin.

---

# Future Improvements

With additional development time, the system could include:

- official NEPSE data integration
- larger company watchlist
- full historical floorsheet coverage
- multilingual financial sentiment analysis
- multilingual NER
- embedding-based company classification
- machine-learning anomaly detection
- richer correlation / event-study analysis
- WebSocket live updates
- Dockerized backend and frontend deployment
- CI/CD pipeline
- automated tests
- alert notifications
- production monitoring

---

# Disclaimer

This application is an educational and technical demonstration.

The market analysis, sentiment, pressure indicators, anomaly detection, and correlations produced by the application should not be interpreted as financial advice or trading recommendations.

---

# Author

Developed as a Full Stack / Python AI-ML Developer technical assignment.

GitHub:

```text
https://github.com/parbatwar/nepse-stock-intelligence
```
