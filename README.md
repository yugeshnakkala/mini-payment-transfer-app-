# Mini Payment Transfer App

A full-stack mini payment transfer project built with Spring Boot, MySQL, and a static frontend served directly by the backend.

The app lets you:

- create accounts
- log in with a demo account flow using account number + email
- view account details and balance
- transfer money between accounts
- check transaction history

## Features

- Spring Boot REST API for account and transaction operations
- MySQL persistence with Spring Data JPA
- Frontend account portal served from the same application
- Demo login and account creation flow
- Transfer validation for duplicate accounts and insufficient balance
- Centralized JSON error handling

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
│               └── app.js
└── pom.xml
```

## Frontend Flow

When you open the app at `/`, you get:

1. A landing screen with `Login` and `Create Account`
2. A dashboard after login that shows:
   - account number
   - account holder
   - email
   - current balance
3. Actions for:
   - transfer money
   - refresh account details
   - refresh balance
   - load transaction history

Important:
- The current login is a demo flow.
- It checks account number and email only.
- There is no password-based authentication yet.

## Backend API

### Create Account

`POST /api/accounts`

Example request:

```json
{
  "accountNumber": "ACC1001",
  "accountHolderName": "John Doe",
  "balance": 5000.00,
  "email": "john@example.com"
}
```

### Get Account Details

`GET /api/accounts/{accountNumber}`

Example:

```text
GET /api/accounts/ACC1001
```

### Get Balance

`GET /api/accounts/{accountNumber}/balance`

Example:

```text
GET /api/accounts/ACC1001/balance
```

### Transfer Money

`POST /api/transactions/transfer`

Example request:

```json
{
  "fromAccount": "ACC1001",
  "toAccount": "ACC1002",
  "amount": 1000.00
}
```

### Get Transaction History

`GET /api/transactions/{accountNumber}`

Example:

```text
GET /api/transactions/ACC1001
```

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

1. Create a new account from the frontend
2. Create another account
3. Log in with one account using account number + email
4. Transfer money to the second account
5. Refresh balance
6. Load transaction history

## Error Handling

The app returns structured JSON errors for:

- duplicate account numbers
- missing accounts
- invalid request data
- insufficient balance
- same sender and receiver account

Example error:

```json
{
  "timestamp": "2026-03-17T19:45:57.94247742",
  "status": 400,
  "error": "Account number already exists"
}
```

## Documentation

Detailed project documentation is available here:

- [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

It includes:

- what each file does
- what each backend method does
- what each frontend function does
- API flow and limitations

## Current Limitations

- No real authentication or passwords
- No Spring Security
- No JWT/session-based backend auth
- No automated tests yet
- No account deletion
- No transaction reversal or approval flow

## Suggested Next Improvements

- Add password-based authentication
- Add Spring Security
- Add automated tests
- Add Docker Compose for easier startup
- Add Swagger/OpenAPI docs
- Add frontend toast notifications and better validation messages

