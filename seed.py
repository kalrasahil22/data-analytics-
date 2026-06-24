from backend.database import init_db, SessionLocal
from backend.models import MonthlySales, Category, DashboardMetric, Insight


def seed():
    init_db()
    db = SessionLocal()

    if db.query(MonthlySales).count() == 0:
        months_data = [
            ("Jan", 4200, 38), ("Feb", 5100, 42), ("Mar", 4800, 40),
            ("Apr", 6200, 55), ("May", 5800, 52), ("Jun", 7200, 65),
            ("Jul", 6900, 61), ("Aug", 8100, 73), ("Sep", 7600, 68),
            ("Oct", 8900, 80), ("Nov", 9400, 85), ("Dec", 10200, 92),
        ]
        for month, sales, revenue in months_data:
            db.add(MonthlySales(month=month, year=2026, sales=sales, revenue=revenue))
        print("Seeded monthly_sales")

    if db.query(Category).count() == 0:
        cats = [
            ("Electronics", 35, "#4f8cff", "+12.3%"),
            ("Clothing", 25, "#7c5cfc", "+8.7%"),
            ("Food", 20, "#2ed573", "+5.2%"),
            ("Books", 12, "#ff9f43", "-1.4%"),
            ("Others", 8, "#5a6072", "+3.8%"),
        ]
        for name, pct, color, growth in cats:
            db.add(Category(name=name, percentage=pct, color=color, growth=growth))
        print("Seeded categories")

    if db.query(DashboardMetric).count() == 0:
        metrics = [
            ("total_records", 284650, "", "+12.5%"),
            ("total_revenue", 1.84, "M", "+8.2%"),
            ("growth_percent", 23.6, "%", "+3.1%"),
            ("active_users", 12438, "", "-2.4%"),
        ]
        for name, val, unit, change in metrics:
            db.add(DashboardMetric(metric_name=name, metric_value=val, unit=unit, change=change))
        print("Seeded dashboard_metrics")

    if db.query(Insight).count() == 0:
        insights = [
            "Revenue increased by 12.3% this quarter.",
            "Electronics category leads with 35% market share.",
            "Active user base grew by 8.7% month-over-month.",
            "Data upload volume increased 22% compared to last month.",
            "Customer retention rate improved to 94.2%.",
        ]
        for text in insights:
            db.add(Insight(content=text))
        print("Seeded insights")

    db.commit()
    db.close()
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed()
