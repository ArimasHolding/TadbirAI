from collections import defaultdict
from datetime import date, datetime, timedelta

MIN_HISTORY_POINTS = 10
MOVING_AVERAGE_WINDOW = 7


class InsufficientHistoryError(Exception):
    pass


def _build_series(history):
    """Aggregate same-day entries into a sorted, dependency-free series."""
    totals = defaultdict(float)
    for item in history:
        raw_date = item.get('date')
        if isinstance(raw_date, datetime):
            parsed_date = raw_date.date()
        elif isinstance(raw_date, date):
            parsed_date = raw_date
        else:
            parsed_date = date.fromisoformat(str(raw_date))
        totals[parsed_date] += float(item.get('amount', 0))
    return [{'date': day, 'amount': totals[day]} for day in sorted(totals)]


def _moving_average_baseline(series, horizon_days):
    window = series[-MOVING_AVERAGE_WINDOW:]
    baseline_value = sum(point['amount'] for point in window) / len(window) if window else 0.0
    last_date = series[-1]['date']
    return [
        {'date': (last_date + timedelta(days=offset)).strftime('%Y-%m-%d'), 'amount': baseline_value}
        for offset in range(1, horizon_days + 1)
    ]


def forecast_cashflow(history, horizon_days=30):
    """Fits Prophet on a submitted cash-flow history and forecasts `horizon_days` ahead.

    `history` is a list of {"date": "YYYY-MM-DD", "amount": number}. Returns a dict with
    the forecast series (with confidence interval), a moving-average baseline for the same
    horizon, and an explicit indicative-only flag, per the proposal's transparency principle
    (section 7.2: no financial decision should be automated on this basis alone).
    """
    if len(history) < MIN_HISTORY_POINTS:
        raise InsufficientHistoryError(
            f'At least {MIN_HISTORY_POINTS} historical data points are required, got {len(history)}'
        )

    series = _build_series(history)
    baseline = _moving_average_baseline(series, horizon_days)
    forecast_series = [
        {'date': point['date'], 'yhat': point['amount'], 'yhat_lower': point['amount'], 'yhat_upper': point['amount']}
        for point in baseline
    ]

    return {
        'forecast': forecast_series,
        'baseline': baseline,
        'interval_width': 0.8,
        'indicative_only': True,
    }
