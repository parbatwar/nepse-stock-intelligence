from collections import defaultdict

from market.models import FloorsheetTransaction


def get_broker_summary(company, trade_date=None):
    qs = FloorsheetTransaction.objects.filter(company=company)

    if trade_date:
        qs = qs.filter(trade_date=trade_date)

    brokers = defaultdict(
        lambda: {
            "buy_quantity": 0,
            "sell_quantity": 0,
        }
    )

    for tx in qs:
        brokers[tx.buyer_broker]["buy_quantity"] += tx.quantity
        brokers[tx.seller_broker]["sell_quantity"] += tx.quantity

    result = []

    for broker, values in brokers.items():
        buy_quantity = values["buy_quantity"]
        sell_quantity = values["sell_quantity"]

        result.append(
            {
                "broker": broker,
                "buy_quantity": buy_quantity,
                "sell_quantity": sell_quantity,
                "net_quantity": buy_quantity - sell_quantity,
            }
        )

    return sorted(
        result,
        key=lambda x: abs(x["net_quantity"]),
        reverse=True,
    )
