# backend/ml/app.py


from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from flask_cors import CORS  # Cho phép gọi từ Express/React
import os


# === Khởi tạo Flask app ===
app = Flask(__name__)
CORS(app)

# === Load mô hình và transformer ===
model = joblib.load('./model/ridge_model.pkl')
scaler = joblib.load('./model/scaler.pkl')
poly = joblib.load('./model/poly_transform.pkl')
columns = joblib.load('./model/columns.pkl')  # ✅ Thêm dòng này để tránh lỗi KeyError

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)

        
        df = pd.DataFrame([data])

      
        df_encoded = pd.get_dummies(df, columns=['Type_of_House', 'District'])

        
        for col in columns:
            if col not in df_encoded.columns:
                df_encoded[col] = 0

        
        df_encoded = df_encoded[columns]

        
        scaled = scaler.transform(df_encoded)
        poly_feat = poly.transform(scaled)

        price_per_m2 = model.predict(poly_feat)[0]

        return jsonify({'predicted_price_per_m2': round(price_per_m2, 2)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Chạy debug khi develop, tắt khi deploy
    app.run(host='0.0.0.0', port=5000, debug=True)

