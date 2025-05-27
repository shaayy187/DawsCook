# 🍽 Daw's Cook – Platforma Przepisów Kulinarnych

**Daw's Cook** to pełnoprawna aplikacja webowa typu full-stack, która umożliwia użytkownikom tworzenie, przeglądanie i zarządzanie przepisami kulinarnymi. Projekt oferuje zarządzanie kontem, rejestrację i logowanie użytkowników, system komentarzy, 
edytowanie kroków przepisu ze zdjęciami (dla adminów), a także integrację z RabbitMQ do obsługi asynchronicznych powiadomień e-mailowych.


## 📐 Architektura systemu
                         ┌────────────────────────────┐
                         │        Frontend (React)    │
                         │                            │
                         │  - React Router            │
                         │  - JWT Auth via Header     │
                         │  - Obsługa zdjęć base64    │
                         └────────────┬───────────────┘
                                      │
                              HTTP/HTTPS Requests
                                      │
                         ┌────────────▼──────────────┐
                         │       Backend (Django)     │
                         │                            │
                         │  - Django REST Framework   │
                         │  - JWT (SimpleJWT)         │
                         │  - Swagger / Redoc         │
                         │  - RabbitMQ producer       │
                         └──────┬─────────────┬───────┘
                                │             │
                         DB (PostgreSQL)   RabbitMQ Queue
                            ▲                  │
                            │            [Consumer + SMTP]
                         ┌──┴──────────────┐
                         │    Modele        │
                         │ - User, Recipe   │
                         │ - Category, Step │
                         └──────────────────┘

## ⚙️ Technologie

| Technologia              | Opis i uzasadnienie                                               |
|--------------------------|--------------------------------------------------------------------|
| **React**                | Frontend SPA, dynamiczne UI, szybka nawigacja                     |
| **Django REST Framework**| Backend REST, szybki rozwój API                                   |
| **PostgreSQL**           | Solidna relacyjna baza danych                                     |
| **RabbitMQ**             | Kolejkowanie wiadomości (np. rejestracja użytkownika)             |
| **JWT (SimpleJWT)**      | Skalowalna autoryzacja tokenowa                                   |
| **drf_yasg**             | Automatyczna dokumentacja API (Swagger i Redoc)                   |
| **SMTP (Gmail)**         | Wysyłanie e-maili powitalnych do nowych użytkowników              |
| **Pytest**               | Testowanie logiki backendowej i endpointów                        |
| **Base64 w obrazach**    | Umożliwia przesyłanie zdjęć jako string (wygodne dla API)         |

## ▶️ Jak uruchomić projekt (Docker)

### Wymagania:
- Docker
- Docker Compose

### 🔥 Uruchomienie aplikacji:

1. Skopiuj plik `.env.example` do `.env` i uzupełnij wymagane zmienne środowiskowe:

   ```bash
   cp .env.example .env
   ```

2. Uruchom aplikację za pomocą Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Aplikacja będzie dostępna pod następującymi adresami:

   - **Frontend:** `http://localhost:3000`
   - **Backend/API:** `http://localhost:8000`
   - **Swagger UI:** `http://localhost:8000/swagger/`
   - **RabbitMQ Management (opcjonalnie):** `http://localhost:15672` (login: `guest`, hasło: `guest`)
  
## 🧪 Testowanie

### Backend (pytest):

```bash
docker-compose exec backend pytest
```

## 📚 Dokumentacja API

- Swagger UI: http://localhost:8000/swagger/
- Redoc: http://localhost:8000/redoc/

## 🔐 Autoryzacja

Aplikacja wykorzystuje JWT (JSON Web Tokens) do zarządzania sesją użytkownika. Po zalogowaniu użytkownik otrzymuje token `access`, który należy przesyłać w nagłówku:

```
Authorization: Bearer <token>
```

## 📦 Funkcjonalności aplikacji

- ✅ Rejestracja i logowanie użytkowników z wykorzystaniem JWT
- ✅ Zarządzanie profilem użytkownika (edycja danych, zmiana hasła, zmiana e-maila)
- ✅ Przeglądanie i filtrowanie przepisów według kategorii
- ✅ Dodawanie, edytowanie i usuwanie przepisów (dla uprawnionych użytkowników)
- ✅ System komentarzy i ocen dla przepisów
- ✅ Obsługa zdjęć w formacie base64 dla użytkowników, przepisów i kategorii
- ✅ Asynchroniczne powiadomienia e-mailowe przy użyciu RabbitMQ i SMTP

## 📬 Powiadomienia

Po rejestracji nowego użytkownika dane są przesyłane do kolejki RabbitMQ (`user_registered_queue`). Konsument odbiera wiadomość i wysyła e-mail powitalny przy użyciu protokołu SMTP.

## 👤 Autor

- Imię i nazwisko: **Dawid Puchała**


## Zdjęcia 

![image](https://github.com/user-attachments/assets/2e912673-a968-41f8-93c7-e5bd53046ac0)

![image](https://github.com/user-attachments/assets/4ef111ca-9bcc-436a-9e93-8744bdf48652)

