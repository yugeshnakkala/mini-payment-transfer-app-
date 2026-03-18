# Mini Payment Transfer App

A full-stack payment transfer application built with Spring Boot, MySQL, and a frontend served directly by the backend.

The app supports:

- account creation
- password-based login
- session-based authentication
- automatic logout after inactivity
- account detail and balance viewing
- money transfer between accounts
- transaction history viewing

## Features

- Spring Boot REST API for accounts, auth, and transactions
- MySQL persistence with Spring Data JPA
- Password hashing with BCrypt
- Session-based auth using `JSESSIONID`
- Logout button with backend session invalidation
- 10-minute inactivity logout on frontend and backend
- Frontend account portal served from the same app
- Centralized JSON error handling
- Favicon support and cleaner static resource error behavior

## Tech Stack

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL
- Lombok
- Maven
- HTML
- CSS
- JavaScript

## Project Structure

```text
mini-payment-transfer-app/
├── docs/
│   └── PROJECT_DOCUMENTATION.md
├── src/
│   └── main/
│       ├── java/com/example/paymentapp/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── repository/
│       │   ├── service/
│       │   └── PaymentAppApplication.java
│       └── resources/
│           ├── application.properties
│           └── static/
│               ├── index.html
│               ├── app.css
│               ├── app.js
│               └── favicon.svg
└── pom.xml
```

## Frontend Flow

When you open the app at `/`, you get:

1. A landing screen with `Login` and `Create Account`
2. Password-based login using account number + password
3. A dashboard after login that shows:
   - account number
   - account holder
   - email
   - current balance
4. Actions for:
   - transfer money
   - refresh account details
   - refresh balance
   - load transaction history
   - logout

Session behavior:

- Clicking `Logout` clears the backend session
- The frontend auto-logs out after 10 minutes of inactivity
- The backend session also expires after 10 minutes

## Backend API

### Auth Endpoints

#### Login

`POST /api/auth/login`

Example request:

```json
{
  "accountNumber": "ACC1001",
  "password": "secure123"
}
```

#### Get Current Logged-In Account

`GET /api/auth/me`

Returns the currently authenticated account from the session.

#### Logout

`POST /api/auth/logout`

Invalidates the current backend session and clears the session cookie.

### Account Endpoints

#### Create Account

`POST /api/accounts`

Example request:

```json
{
  "accountNumber": "ACC1001",
  "accountHolderName": "John Doe",
  "balance": 5000.00,
  "email": "john@example.com",
  "password": "secure123"
}
```

#### Get Account Details

`GET /api/accounts/{accountNumber}`

Protected:
- only the logged-in account can access its own details

#### Get Balance

`GET /api/accounts/{accountNumber}/balance`

Protected:
- only the logged-in account can access its own balance

### Transaction Endpoints

#### Transfer Money

`POST /api/transactions/transfer`

Example request:

```json
{
  "fromAccount": "ACC1001",
  "toAccount": "ACC1002",
  "amount": 1000.00
}
```

Protected:
- the logged-in account can only transfer from its own account

#### Get Transaction History

`GET /api/transactions/{accountNumber}`

Protected:
- only the logged-in account can access its own transaction history

## Running the Application

### 1. Create the MySQL database

```sql
CREATE DATABASE payment_app;
```

### 2. Update database settings

Edit:

`src/main/resources/application.properties`

Set your MySQL username and password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/payment_app
spring.datasource.username=root
spring.datasource.password=yourpassword
```

### 3. Start the app

If Maven is installed locally:

```bash
mvn spring-boot:run
```

Then open:

```text
http://localhost:8080/
```

## Manual Test Flow

You can test the app in this order:

1. Create a new account with password
2. Log in with account number and password
3. Create a second account
4. Transfer money to the second account
5. Refresh balance
6. Load transaction history
7. Click logout and verify the login screen returns
8. Wait 10 minutes without activity and verify auto-logout

## Error Handling

The app returns structured JSON errors for:

- duplicate account numbers
- missing accounts
- invalid request data
- invalid password/login attempts
- insufficient balance
- same sender and receiver account
- unauthenticated access
- cross-account access attempts

Example error:

```json
{
  "timestamp": "2026-03-18T17:11:27.132508925",
  "status": 401,
  "error": "You must log in first"
}
```

## Documentation

Detailed project documentation is available here:

- [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

It includes:

- what each file does
- what each backend method does
- what each frontend function does
- auth/session flow and limitations

## Current Limitations

- Uses session-based auth, not JWT
- No role-based access control
- No password reset flow
- Old accounts created before password support may not have usable passwords
- No automated tests yet
- No account deletion
- No transaction reversal or approval flow

## Suggested Next Improvements

- Add password reset for older accounts
- Add automated tests for auth and transfer flows
- Add Docker Compose for one-command startup
- Add Swagger/OpenAPI docs
- Add frontend toast notifications
- Add transaction date formatting improvements

