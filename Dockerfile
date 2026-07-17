FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Build frontend
RUN npm install && npm run build

# Expose port
EXPOSE 8080

# Environment variables
ENV WEBUI_NAME="Graden IA"
ENV OLLAMA_BASE_URL="http://host.docker.internal:11434"
ENV DATA_DIR="/app/data"

# Create data directory
RUN mkdir -p /app/data

# Run
CMD ["python", "launch.py"]
