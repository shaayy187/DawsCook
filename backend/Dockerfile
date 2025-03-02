# Use the official Python image as the base image
FROM python:3.9-slim

# Set environment variables
#przyspiesza uruchamianie, blokuje tworzenie pewnych plikow automatycznie
ENV PYTHONDONTWRITEBYTECODE 1 
#brak buforowania dla logów
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the project files to the container
COPY . .

# Expose the port Django will run on
EXPOSE 8000

# Run the Django server
#migracje tutaj, bo nie działało wcześniej w docker-compose -> od Pana Muchy
#CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]