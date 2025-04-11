import requests
from datetime import datetime, timedelta
import matplotlib.pyplot as plt

# ✅ Parameters
store_nbr = "1"         # must be from training set (1 to 54)
item_nbr = "96995"      # must be from training set
forecast_days = 7       # can change to 30, etc.

# ✅ Generate 37 days: 30 history + 7 future
start_date = datetime(2017, 7, 1)
timeseries = []

for i in range(37):
    day = start_date + timedelta(days=i)
    timeseries.append({
        "date": day.strftime("%Y-%m-%d"),
        "store_nbr": store_nbr,
        "item_nbr": item_nbr,
        "is_onpromotion": "0",
        "is_holiday": "0",
        "transactions": 1200,
        "log_unit_sales": 1.0  # dummy historical value
    })

# ✅ Send request to Flask backend
payload = {
    "timeseries": timeseries,
    "forecast_days": forecast_days
}

response = requests.post("http://localhost:5000/api/forecast", json=payload)

# ✅ Parse and display result
try:
    result = response.json()
    if "prediction" in result:
        print("✅ Success:")
        for i, pred in enumerate(result["prediction"], 1):
            print(f"Day {i}: {pred:.2f}")

        # ✅ Optional: Plot forecast
        plt.plot(range(1, forecast_days + 1), result["prediction"], marker='o')
        plt.title(f"{forecast_days}-Day Forecast for Store {store_nbr}, Item {item_nbr}")
        plt.xlabel("Future Day")
        plt.ylabel("Predicted Sales")
        plt.grid(True)
        plt.show()

    else:
        print("❌ Error:")
        print(result)
except Exception as e:
    print(f"❌ Failed to parse response: {e}")
