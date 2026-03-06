"""
Google Search Console — AI Overview & Zero-Click Tracker
=========================================================
Author: Gagan Deep | AI Engineer
Repository: github.com/themindfulnl-cmd/ai-automation-blueprints

Connects to the Google Search Console API and generates a weekly report
showing which of your queries trigger AI Overviews, estimated zero-click
rates, and CTR trends over time.

Requirements:
    pip install google-auth google-auth-oauthlib google-api-python-client pandas

Setup:
    1. Enable Search Console API in Google Cloud Console
    2. Create OAuth 2.0 credentials (Desktop app)
    3. Download the JSON and save as `credentials.json` in this directory
    4. Replace SITE_URL below with your verified property URL
    5. Run: python google-search-console-ai-overview-tracker.py
"""

import os
import json
import datetime
import pandas as pd
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# ─── CONFIGURATION ───────────────────────────────────────────────────
SITE_URL = "https://[YOUR-DOMAIN].com"   # Your Search Console property
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.json"
OUTPUT_DIR = "reports"
DAYS_BACK = 28                            # Analysis window (max 16 months)
# ─────────────────────────────────────────────────────────────────────


def authenticate():
    """Authenticate with Google Search Console API."""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    return build("searchconsole", "v1", credentials=creds)


def fetch_query_data(service, start_date, end_date):
    """Pull query-level performance data from Search Console."""
    request_body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": ["query", "date"],
        "rowLimit": 25000,
        "dataState": "final",
    }
    response = (
        service.searchanalytics()
        .query(siteUrl=SITE_URL, body=request_body)
        .execute()
    )
    rows = response.get("rows", [])
    data = []
    for row in rows:
        data.append({
            "query": row["keys"][0],
            "date": row["keys"][1],
            "clicks": row["clicks"],
            "impressions": row["impressions"],
            "ctr": round(row["ctr"] * 100, 2),
            "position": round(row["position"], 1),
        })
    return pd.DataFrame(data)


def classify_zero_click_risk(row):
    """
    Heuristic: queries with high impressions but very low CTR
    are likely triggering AI Overviews / zero-click results.

    Thresholds based on 2026 industry benchmarks:
        - CTR < 1.5% with 50+ impressions  → HIGH risk
        - CTR < 3.0% with 50+ impressions  → MEDIUM risk
        - Everything else                   → LOW risk
    """
    if row["impressions"] >= 50 and row["ctr"] < 1.5:
        return "HIGH"
    elif row["impressions"] >= 50 and row["ctr"] < 3.0:
        return "MEDIUM"
    return "LOW"


def generate_report(df):
    """Aggregate and produce the zero-click analysis report."""
    if df.empty:
        print("No data returned from Search Console.")
        return

    agg = (
        df.groupby("query")
        .agg(
            total_impressions=("impressions", "sum"),
            total_clicks=("clicks", "sum"),
            avg_ctr=("ctr", "mean"),
            avg_position=("position", "mean"),
            days_seen=("date", "nunique"),
        )
        .reset_index()
    )
    agg["avg_ctr"] = agg["avg_ctr"].round(2)
    agg["avg_position"] = agg["avg_position"].round(1)
    agg["zero_click_risk"] = agg.apply(classify_zero_click_risk, axis=1)
    agg = agg.sort_values("total_impressions", ascending=False)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    today = datetime.date.today().isoformat()

    csv_path = os.path.join(OUTPUT_DIR, f"zero-click-report-{today}.csv")
    agg.to_csv(csv_path, index=False)

    high_risk = agg[agg["zero_click_risk"] == "HIGH"]
    medium_risk = agg[agg["zero_click_risk"] == "MEDIUM"]

    summary = {
        "report_date": today,
        "analysis_window_days": DAYS_BACK,
        "total_queries_analyzed": len(agg),
        "high_risk_queries": len(high_risk),
        "medium_risk_queries": len(medium_risk),
        "total_impressions": int(agg["total_impressions"].sum()),
        "total_clicks": int(agg["total_clicks"].sum()),
        "overall_ctr": round(
            (agg["total_clicks"].sum() / agg["total_impressions"].sum()) * 100, 2
        )
        if agg["total_impressions"].sum() > 0
        else 0,
        "top_zero_click_queries": high_risk.head(10)[
            ["query", "total_impressions", "total_clicks", "avg_ctr"]
        ]
        .to_dict(orient="records"),
    }

    json_path = os.path.join(OUTPUT_DIR, f"zero-click-summary-{today}.json")
    with open(json_path, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n{'='*60}")
    print(f"  ZERO-CLICK & AI OVERVIEW REPORT — {today}")
    print(f"{'='*60}")
    print(f"  Queries analyzed     : {summary['total_queries_analyzed']}")
    print(f"  Overall CTR          : {summary['overall_ctr']}%")
    print(f"  HIGH risk queries    : {summary['high_risk_queries']}")
    print(f"  MEDIUM risk queries  : {summary['medium_risk_queries']}")
    print(f"{'='*60}")
    print(f"\n  Top zero-click queries (HIGH risk):")
    for q in summary["top_zero_click_queries"]:
        print(f"    • {q['query']:<50} CTR: {q['avg_ctr']}%  Imp: {q['total_impressions']}")
    print(f"\n  Full report : {csv_path}")
    print(f"  Summary JSON: {json_path}")


def main():
    print("Authenticating with Google Search Console...")
    service = authenticate()

    end_date = datetime.date.today() - datetime.timedelta(days=3)
    start_date = end_date - datetime.timedelta(days=DAYS_BACK)

    print(f"Fetching data from {start_date} to {end_date}...")
    df = fetch_query_data(
        service, start_date.isoformat(), end_date.isoformat()
    )
    print(f"Retrieved {len(df)} rows.")

    generate_report(df)


if __name__ == "__main__":
    main()
