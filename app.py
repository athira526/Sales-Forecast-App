from flask import Flask, request, jsonify
from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet
import pandas as pd
import torch
import json

app = Flask(__name__)

# Load trained model
MODEL_PATH = "tft_epoch_epoch=05.ckpt"
model = TemporalFusionTransformer.load_from_checkpoint(MODEL_PATH)
model.eval()

# Define category values used during training
VALID_STORE_NBRS = [str(i) for i in range(1, 55)]

@app.route('/api/forecast', methods=['POST'])
def forecast():
    try:
        data = request.get_json()
        if "timeseries" not in data:
            return jsonify({"error": "Missing 'timeseries' field"}), 400

        raw_data = data["timeseries"]
        forecast_days = data.get("forecast_days", 7)

        if not isinstance(raw_data, list) or len(raw_data) < 37:
            return jsonify({"error": "Need at least 37 historical entries"}), 400

        df = pd.DataFrame(raw_data)

        # Category check
        if any(str(s) not in VALID_STORE_NBRS for s in df["store_nbr"].unique()):
            return jsonify({"error": "Invalid store_nbr found. Must be between 1 and 54."}), 400

        # Format conversions
        df["date"] = pd.to_datetime(df["date"])
        df["time_idx"] = (df["date"] - pd.Timestamp("2013-01-01")).dt.days
        df["is_onpromotion"] = df["is_onpromotion"].astype(str)
        df["store_nbr"] = df["store_nbr"].astype(str)
        df["item_nbr"] = df["item_nbr"].astype(str)
        df["is_holiday"] = df.get("is_holiday", "0").astype(str)
        df["log_unit_sales"] = df.get("log_unit_sales", 0.0)

        # Add date features
        df["day"] = df["date"].dt.day
        df["month"] = df["date"].dt.month
        df["weekday"] = df["date"].dt.weekday
        df["year"] = df["date"].dt.year

        # Last date
        last_time_idx = df["time_idx"].max()
        last_date = df["date"].max()

        # Create future entries
        last_row = df.iloc[-1]
        future_rows = []
        for i in range(1, forecast_days + 1):
            next_date = last_date + pd.Timedelta(days=i)
            new_row = last_row.copy()
            new_row["date"] = next_date
            new_row["time_idx"] = last_time_idx + i
            new_row["day"] = next_date.day
            new_row["month"] = next_date.month
            new_row["weekday"] = next_date.weekday()
            new_row["year"] = next_date.year
            new_row["log_unit_sales"] = 0.0
            future_rows.append(new_row)

        future_df = pd.DataFrame(future_rows)
        combined_df = pd.concat([df, future_df], ignore_index=True)

        # Build dataset
        dataset = TimeSeriesDataSet(
            combined_df,
            time_idx="time_idx",
            target="log_unit_sales",
            group_ids=["store_nbr", "item_nbr"],
            max_encoder_length=30,
            max_prediction_length=forecast_days,
            time_varying_unknown_reals=["log_unit_sales"],
            time_varying_known_reals=["time_idx", "day", "month", "year", "weekday", "transactions"],
            time_varying_known_categoricals=["is_onpromotion", "is_holiday"],
            static_categoricals=["store_nbr", "item_nbr"],
            add_relative_time_idx=True,
            add_target_scales=True,
            add_encoder_length=True,
        )

        dataloader = dataset.to_dataloader(train=False, batch_size=1)
        predictions = model.predict(dataloader)

        return jsonify({
            "prediction": predictions.cpu().numpy().tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
