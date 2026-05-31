# Menggunakan image Python resmi
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy sisa kode
COPY . .

# Jalankan aplikasi (Sesuaikan dengan file main Anda)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]