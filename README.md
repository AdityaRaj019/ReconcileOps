# ⚡ ReconcileOps — High-Performance Transaction Reconciliation Engine & Dashboard

**ReconcileOps** is a full-stack transaction reconciliation application built with **Next.js (App Router)** and **TypeScript**. It classifies records from Bank and Merchant systems in single-pass linear time $\mathcal{O}(N)$ using hash-map indexing with **zero nested loops**.

---

## 🚀 Key Features

- **Dual Ledger Input Managers:** Independent form interfaces for Bank and Merchant records (`Txn ID`, `Amount`, `Date`).
- **Inline Transaction Editing:** Edit any transaction details directly in the table with duplicate ID collision protection.
- **Preset Test Case Loader:** One-click button to load the prompt's standard test sample.
- **$\mathcal{O}(N)$ Hash-Map Reconciliation Engine:** Compares ledger records in linear time without nested loops.
- **Next.js Server API Route:** Exposes `POST /api/reconcile` returning structured JSON summaries and itemized breakdowns.
- **Interactive KPI Cards:** Real-time percentage match rates and status summary metric cards.
- **Interactive Search & Category Filters:** Filter by classification (`Matched`, `Amount Mismatch`, `Date Mismatch`, `Only in Bank`, `Only in Merchant`) or search by `Txn ID`.
- **Export Reports:** One-click CSV report export and raw JSON payload downloads.

---

## 📊 Status Classifications

| Status Category | Description | Condition |
| :--- | :--- | :--- |
| **`MATCHED`** | Perfect Match | Txn ID present in both; Amount and Date match exactly |
| **`AMOUNT_MISMATCH`** | Discrepancy in Amount | Txn ID present in both; Date matches, but Amount differs |
| **`DATE_MISMATCH`** | Discrepancy in Date | Txn ID present in both; Amount matches, but Date differs |
| **`AMOUNT_AND_DATE_MISMATCH`** | Discrepancy in Both | Txn ID present in both; Both Amount and Date differ |
| **`ONLY_IN_BANK`** | Missing in Merchant | Txn ID present in Bank system, missing in Merchant ledger |
| **`ONLY_IN_MERCHANT`** | Missing in Bank | Txn ID present in Merchant system, missing in Bank ledger |

---

## 🧪 Sample Test Dataset & Verification

### Input Data

#### Bank Transactions
| Txn ID | Amount ($) | Date |
| :--- | :--- | :--- |
| **T101** | 1000.00 | 2026-06-01 |
| **T102** | 2000.00 | 2026-06-01 |
| **T103** | 500.00 | 2026-06-01 |
| **T105** | 800.00 | 2026-06-01 |

#### Merchant Transactions
| Txn ID | Amount ($) | Date |
| :--- | :--- | :--- |
| **T101** | 1000.00 | 2026-06-01 |
| **T102** | 2500.00 | 2026-06-01 |
| **T104** | 300.00 | 2026-06-01 |
| **T105** | 800.00 | 2026-06-02 |

### Engine Output (`POST /api/reconcile`)

```json
{
  "success": true,
  "summary": {
    "totalBankRecords": 4,
    "totalMerchantRecords": 4,
    "totalUniqueTxnIds": 5,
    "matchedCount": 1,
    "amountMismatchCount": 1,
    "dateMismatchCount": 1,
    "bothMismatchCount": 0,
    "onlyInBankCount": 1,
    "onlyInMerchantCount": 1,
    "matchPercentage": 20.0,
    "executionTimeMs": 0.119,
    "algorithmComplexity": "O(N) HashMap Single-Pass"
  },
  "results": [
    {
      "txnId": "T101",
      "status": "MATCHED",
      "statusLabel": "Matched",
      "bankTransaction": { "amount": 1000, "date": "2026-06-01" },
      "merchantTransaction": { "amount": 1000, "date": "2026-06-01" },
      "amountDiff": 0,
      "dateDiff": "2026-06-01 → 2026-06-01",
      "notes": "Exact match in amount and date."
    },
    {
      "txnId": "T102",
      "status": "AMOUNT_MISMATCH",
      "statusLabel": "Amount Mismatch",
      "bankTransaction": { "amount": 2000, "date": "2026-06-01" },
      "merchantTransaction": { "amount": 2500, "date": "2026-06-01" },
      "amountDiff": 500,
      "dateDiff": "2026-06-01 → 2026-06-01",
      "notes": "Bank: $2000.00, Merchant: $2500.00 (Diff: +$500.00)"
    },
    {
      "txnId": "T104",
      "status": "ONLY_IN_MERCHANT",
      "statusLabel": "Present only in Merchant",
      "merchantTransaction": { "amount": 300, "date": "2026-06-01" },
      "notes": "Transaction missing in Bank ledger. Merchant amount: $300.00"
    },
    {
      "txnId": "T105",
      "status": "DATE_MISMATCH",
      "statusLabel": "Date Mismatch",
      "bankTransaction": { "amount": 800, "date": "2026-06-01" },
      "merchantTransaction": { "amount": 800, "date": "2026-06-02" },
      "amountDiff": 0,
      "dateDiff": "2026-06-01 → 2026-06-02",
      "notes": "Bank date: 2026-06-01, Merchant date: 2026-06-02"
    },
    {
      "txnId": "T103",
      "status": "ONLY_IN_BANK",
      "statusLabel": "Present only in Bank",
      "bankTransaction": { "amount": 500, "date": "2026-06-01" },
      "notes": "Transaction missing in Merchant ledger. Bank amount: $500.00"
    }
  ]
}
```

---

## ⚡ Algorithm & Complexity Analysis

### Time Complexity: $\mathcal{O}(N)$

Where $N = N_{\text{bank}} + N_{\text{merchant}}$:

1. **Bank Map Construction:** $\mathcal{O}(N_{\text{bank}})$ to insert Bank records into a `Map<txnId, Transaction>`.
2. **Merchant Scan & Lookups:** $\mathcal{O}(N_{\text{merchant}})$ pass over Merchant array, with $\mathcal{O}(1)$ average hash-map lookups.
3. **Unprocessed Bank Pass:** $\mathcal{O}(N_{\text{bank}})$ pass over Bank map keys to collect entries present only in Bank.

**Total Time Complexity:** $\mathcal{O}(N_{\text{bank}} + N_{\text{merchant}}) = \mathcal{O}(N)$ — Linear Time, No Nested Loops.

### Space Complexity: $\mathcal{O}(N)$

- Hash-map stores up to $N_{\text{bank}}$ entries.
- Set tracks up to $N_{\text{merchant}}$ processed transaction IDs.

---

## 💡 Interview Architecture Q&A & Production Scaling Roadmap

### Q: Where is transaction data stored currently?
**A:** Currently, transaction entries are stored **in-memory** within React client state (`page.tsx`) and Node.js server memory (`route.ts`), pre-initialized with the prompt's sample dataset (`sampleData.ts`). This provides a fast, zero-config environment for demonstration and immediate testing.

### Q: How would you scale this to a production-grade enterprise application?
1. **Persistent Database Layer (PostgreSQL + Prisma ORM):**
   - Replace in-memory arrays with persistent database tables (`BankTransaction` and `MerchantTransaction`) backed by PostgreSQL and Prisma ORM.
   - Add database indexes on `txnId` columns for $\mathcal{O}(\log N)$ lookups and unique constraint enforcement.

2. **RESTful Granular API Endpoints:**
   - Expand backend route handlers into explicit RESTful resource endpoints:
     - `POST /api/bank` & `PATCH /api/bank/:txnId`
     - `POST /api/merchant` & `PATCH /api/merchant/:txnId`
     - `GET /api/reconciliation`

3. **Database-Side SQL Join Optimization:**
   - For enterprise-scale datasets (millions of records), perform reconciliation directly inside PostgreSQL using an indexed `FULL OUTER JOIN` query instead of pulling records into application memory:
     ```sql
     SELECT 
       COALESCE(b.txn_id, m.txn_id) AS txn_id,
       CASE
         WHEN b.txn_id IS NULL THEN 'ONLY_IN_MERCHANT'
         WHEN m.txn_id IS NULL THEN 'ONLY_IN_BANK'
         WHEN b.amount = m.amount AND b.date = m.date THEN 'MATCHED'
         WHEN b.amount != m.amount AND b.date = m.date THEN 'AMOUNT_MISMATCH'
         WHEN b.amount = m.amount AND b.date != m.date THEN 'DATE_MISMATCH'
         ELSE 'AMOUNT_AND_DATE_MISMATCH'
       END AS status
     FROM bank_txns b 
     FULL OUTER JOIN merchant_txns m ON b.txn_id = m.txn_id;
     ```

---

## 🛠️ File Structure

```
reconcile_dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── reconcile/
│   │   │       └── route.ts               # Backend REST API for O(N) Reconciliation
│   │   ├── globals.css                    # Design system styling & custom UI tokens
│   │   ├── layout.tsx                     # Root Layout & Metadata
│   │   └── page.tsx                       # Dashboard Main Page
│   ├── lib/
│   │   └── reconciliationEngine.ts        # O(N) HashMap Reconciliation Core Algorithm
│   ├── types/
│   │   └── reconciliation.ts              # TypeScript Models & Interfaces
│   ├── components/
│   │   ├── BankForm.tsx                   # Bank Ledger Form
│   │   ├── MerchantForm.tsx               # Merchant Ledger Form
│   │   ├── Header.tsx                     # Header Navigation
│   │   ├── ReconciliationSummaryCards.tsx # Summary Metric KPI Cards
│   │   └── ReconciliationTable.tsx        # Filterable Results Table & Exporters
│   └── utils/
│       └── sampleData.ts                  # Prompt Sample Test Cases (T101-T105)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation & Running Locally

```bash
# Install dependencies
npm install

# Start local Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the dashboard.

### API Endpoint Usage

```bash
curl -X POST http://localhost:3000/api/reconcile \
  -H "Content-Type: application/json" \
  -d '{
    "bankTransactions": [
      { "txnId": "T101", "amount": 1000, "date": "2026-06-01" },
      { "txnId": "T102", "amount": 2000, "date": "2026-06-01" }
    ],
    "merchantTransactions": [
      { "txnId": "T101", "amount": 1000, "date": "2026-06-01" },
      { "txnId": "T102", "amount": 2500, "date": "2026-06-01" }
    ]
  }'
```

---

## 📝 License

Distributed under the MIT License.
