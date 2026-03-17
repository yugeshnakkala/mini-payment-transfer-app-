# Mini Payment Transfer App

A simple Java Spring Boot project for account creation, balance inquiry, money transfer, and transaction history.

## Tech Stack
- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL
- Lombok
- Maven

## APIs
### Create account
`POST /api/accounts`
```json
{
  "accountNumber": "ACC1001",
  "accountHolderName": "John Doe",
  "balance": 5000.00,
  "email": "john@example.com"
}
```

### Get account
`GET /api/accounts/ACC1001`

### Get balance
`GET /api/accounts/ACC1001/balance`

### Transfer money
`POST /api/transactions/transfer`
```json
{
  "fromAccount": "ACC1001",
  "toAccount": "ACC1002",
  "amount": 1000.00
}
```

### Get transaction history
`GET /api/transactions/ACC1001`

## Run Steps
1. Create MySQL database:
```sql
CREATE DATABASE payment_app;
```
2. Update database username and password in `src/main/resources/application.properties`
3. Run:
```bash
mvn spring-boot:run
```
