# Mini Payment Transfer App Documentation

## 1. Project Overview

This project is a Spring Boot + MySQL application for:

- creating bank-style accounts
- checking account details
- checking balances
- transferring money between accounts
- viewing transaction history

It also includes a frontend dashboard served directly by Spring Boot from `src/main/resources/static`.

Important note:
- The current frontend "login" is a demo flow, not real authentication.
- It checks account number and email against the existing backend data.
- There is no password, session token, JWT, or Spring Security yet.

## 2. Tech Stack

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL
- Lombok
- Maven
- HTML, CSS, JavaScript for the frontend

## 3. High-Level Flow

### Backend flow

1. The browser or API client sends a request to a controller.
2. The controller passes the request to a service.
3. The service performs validation and business logic.
4. The service reads/writes data through a repository.
5. The repository talks to MySQL using JPA/Hibernate.
6. The response is returned as JSON.
7. If an error happens, `GlobalExceptionHandler` formats the error response.

### Frontend flow

1. The user opens `/`.
2. `index.html` loads `app.css` and `app.js`.
3. `app.js` controls the login/create-account screen and the dashboard.
4. The frontend calls backend endpoints with `fetch()`.
5. Responses are shown in the response console and dashboard panels.

## 4. API Endpoints

### Account endpoints

- `POST /api/accounts`
  - Creates a new account.
- `GET /api/accounts/{accountNumber}`
  - Returns account details.
- `GET /api/accounts/{accountNumber}/balance`
  - Returns only the balance.

### Transaction endpoints

- `POST /api/transactions/transfer`
  - Transfers money between accounts.
- `GET /api/transactions/{accountNumber}`
  - Returns transaction history for that account.

## 5. File-by-File Documentation

---

## Root and Configuration Files

### `pom.xml`
Purpose:
- Defines the Maven project.
- Declares dependencies and build plugins.

What it contains:
- Spring Boot parent
- Java version 17
- Dependencies for:
  - Spring Web
  - Spring Data JPA
  - MySQL driver
  - Lombok
  - Validation
  - Spring Boot Test
- Spring Boot Maven plugin

### `README.md`
Purpose:
- Basic project introduction and basic API usage examples.

What it covers:
- Tech stack
- Main endpoints
- Simple run instructions

### `src/main/resources/application.properties`
Purpose:
- Stores application configuration.

What each property does:
- `spring.datasource.url`
  - MySQL JDBC connection URL.
- `spring.datasource.username`
  - Database username.
- `spring.datasource.password`
  - Database password placeholder.
- `spring.jpa.hibernate.ddl-auto=update`
  - Updates tables automatically based on entity definitions.
- `spring.jpa.show-sql=true`
  - Prints SQL in logs.
- `spring.jpa.properties.hibernate.format_sql=true`
  - Formats SQL output for readability.
- `server.port=8080`
  - Runs the app on port 8080.

---

## Backend Java Files

### `src/main/java/com/example/paymentapp/PaymentAppApplication.java`
Purpose:
- Main entry point of the Spring Boot application.

Functions:
- `main(String[] args)`
  - Starts Spring Boot by calling `SpringApplication.run(...)`.

---

## Controllers

### `src/main/java/com/example/paymentapp/controller/AccountController.java`
Purpose:
- Exposes REST endpoints related to accounts.

Functions:
- `AccountController(AccountService accountService)`
  - Constructor injection for the service.
- `createAccount(AccountRequest request)`
  - Handles `POST /api/accounts`.
  - Validates request body.
  - Calls `accountService.createAccount(...)`.
  - Returns the saved `Account`.
- `getAccount(String accountNumber)`
  - Handles `GET /api/accounts/{accountNumber}`.
  - Calls `accountService.getAccountByNumber(...)`.
  - Returns the account object.
- `getBalance(String accountNumber)`
  - Handles `GET /api/accounts/{accountNumber}/balance`.
  - Calls `accountService.getBalance(...)`.
  - Returns `BigDecimal` balance only.

### `src/main/java/com/example/paymentapp/controller/TransactionController.java`
Purpose:
- Exposes REST endpoints related to transactions.

Functions:
- `TransactionController(TransactionService transactionService)`
  - Constructor injection for the service.
- `transferMoney(TransferRequest request)`
  - Handles `POST /api/transactions/transfer`.
  - Validates request body.
  - Calls `transactionService.transferMoney(...)`.
  - Returns a success message string.
- `getTransactions(String accountNumber)`
  - Handles `GET /api/transactions/{accountNumber}`.
  - Calls `transactionService.getTransactions(...)`.
  - Returns a list of `TransactionRecord`.

---

## DTO Files

### `src/main/java/com/example/paymentapp/dto/AccountRequest.java`
Purpose:
- Defines the JSON structure for account creation requests.

Fields:
- `accountNumber`
  - Must not be blank.
- `accountHolderName`
  - Must not be blank.
- `balance`
  - Must not be null.
  - Must be at least `0.00`.
- `email`
  - Must not be blank.
  - Must be a valid email format.

Generated methods:
- Lombok `@Data` generates getters, setters, `toString`, `equals`, and `hashCode`.

### `src/main/java/com/example/paymentapp/dto/TransferRequest.java`
Purpose:
- Defines the JSON structure for transfer requests.

Fields:
- `fromAccount`
  - Must not be blank.
- `toAccount`
  - Must not be blank.
- `amount`
  - Must not be null.
  - Must be at least `0.01`.

Generated methods:
- Lombok `@Data` generates getters, setters, `toString`, `equals`, and `hashCode`.

---

## Entity Files

### `src/main/java/com/example/paymentapp/entity/Account.java`
Purpose:
- JPA entity representing an account in the `accounts` table.

Fields:
- `id`
  - Primary key, auto-generated.
- `accountNumber`
  - Unique account number.
- `accountHolderName`
  - Name of account holder.
- `balance`
  - Monetary balance stored as `BigDecimal`.
- `email`
  - Email address linked to the account.

Generated methods:
- Lombok `@Getter`
- Lombok `@Setter`
- Lombok `@NoArgsConstructor`
- Lombok `@AllArgsConstructor`

### `src/main/java/com/example/paymentapp/entity/TransactionRecord.java`
Purpose:
- JPA entity representing a money transfer record in the `transactions` table.

Fields:
- `id`
  - Primary key, auto-generated.
- `fromAccount`
  - Sender account number.
- `toAccount`
  - Receiver account number.
- `amount`
  - Transfer amount.
- `transactionDate`
  - Date and time of transfer.
- `status`
  - Current transfer status, currently set to `"SUCCESS"`.

Generated methods:
- Lombok `@Getter`
- Lombok `@Setter`
- Lombok `@NoArgsConstructor`
- Lombok `@AllArgsConstructor`

---

## Repository Files

### `src/main/java/com/example/paymentapp/repository/AccountRepository.java`
Purpose:
- Handles database operations for `Account`.

Inherited behavior:
- All standard `JpaRepository<Account, Long>` CRUD operations.

Custom methods:
- `findByAccountNumber(String accountNumber)`
  - Returns `Optional<Account>` by account number.
- `existsByAccountNumber(String accountNumber)`
  - Checks whether an account number already exists.

### `src/main/java/com/example/paymentapp/repository/TransactionRepository.java`
Purpose:
- Handles database operations for `TransactionRecord`.

Inherited behavior:
- All standard `JpaRepository<TransactionRecord, Long>` CRUD operations.

Custom methods:
- `findByFromAccountOrToAccountOrderByTransactionDateDesc(String fromAccount, String toAccount)`
  - Returns transfers where the account is either sender or receiver.
  - Sorts newest first.

---

## Service Files

### `src/main/java/com/example/paymentapp/service/AccountService.java`
Purpose:
- Contains business logic related to accounts.

Functions:
- `AccountService(AccountRepository accountRepository)`
  - Constructor injection for the repository.
- `createAccount(AccountRequest request)`
  - Checks whether account number already exists.
  - Throws `BadRequestException` if duplicate.
  - Maps request data to `Account`.
  - Saves and returns the new account.
- `getAccountByNumber(String accountNumber)`
  - Looks up account by account number.
  - Throws `ResourceNotFoundException` if not found.
  - Returns the matching `Account`.
- `getBalance(String accountNumber)`
  - Reuses `getAccountByNumber(...)`.
  - Returns only the account balance.

### `src/main/java/com/example/paymentapp/service/TransactionService.java`
Purpose:
- Contains business logic related to transfers and transaction history.

Functions:
- `TransactionService(AccountRepository accountRepository, TransactionRepository transactionRepository)`
  - Constructor injection for both repositories.
- `transferMoney(TransferRequest request)`
  - Marked with `@Transactional`.
  - Validates that sender and receiver are not the same.
  - Loads sender and receiver accounts.
  - Throws `ResourceNotFoundException` if either account does not exist.
  - Checks sender has enough balance.
  - Throws `BadRequestException` for insufficient funds.
  - Subtracts money from sender.
  - Adds money to receiver.
  - Saves both updated accounts.
  - Creates and saves a `TransactionRecord`.
  - Returns `"Transfer completed successfully"`.
- `getTransactions(String accountNumber)`
  - Returns all transfers where this account is sender or receiver.

---

## Exception Files

### `src/main/java/com/example/paymentapp/exception/BadRequestException.java`
Purpose:
- Custom runtime exception for invalid requests.

Functions:
- `BadRequestException(String message)`
  - Stores an error message for bad request scenarios.

### `src/main/java/com/example/paymentapp/exception/ResourceNotFoundException.java`
Purpose:
- Custom runtime exception for missing resources.

Functions:
- `ResourceNotFoundException(String message)`
  - Stores an error message for not found scenarios.

### `src/main/java/com/example/paymentapp/exception/GlobalExceptionHandler.java`
Purpose:
- Converts thrown exceptions into consistent JSON error responses.

Functions:
- `handleNotFound(ResourceNotFoundException ex)`
  - Returns HTTP 404 response.
- `handleBadRequest(BadRequestException ex)`
  - Returns HTTP 400 response.
- `handleValidation(MethodArgumentNotValidException ex)`
  - Returns HTTP 400 response with field-level validation errors.
- `handleGeneric(Exception ex)`
  - Returns HTTP 500 response.
- `buildResponse(HttpStatus status, String message)`
  - Shared helper that creates the JSON error body with:
    - `timestamp`
    - `status`
    - `error`

---

## Frontend Files

### `src/main/resources/static/index.html`
Purpose:
- Main frontend page served at `/`.

Main sections:
- Top bar
  - App title and environment badge.
- `auth-view`
  - Login/Create Account landing screen.
- `auth-hero`
  - Explains the app flow to the user.
- `auth-card`
  - Contains tab buttons for switching between login and account creation.
- `login-form`
  - Lets the user log in with account number and email.
- `create-account-form`
  - Lets the user create a new account.
- `dashboard-view`
  - Hidden until login succeeds.
- Summary cards
  - Show account number, holder name, email, and balance.
- `transfer-form`
  - Sends money from current account to another account.
- Quick actions
  - Refresh balance and load history.
- Response console
  - Shows backend responses.
- Transaction history panel
  - Renders recent transfers for the current account.

### `src/main/resources/static/app.css`
Purpose:
- Provides all frontend styling.

What it does:
- Defines the color theme with CSS variables.
- Creates the page background and ambient visual effects.
- Styles the auth landing page and dashboard layout.
- Styles cards, forms, buttons, status badges, response console, and transaction list.
- Handles responsive layout changes for smaller screens.
- Adds entrance animations with `@keyframes rise-in`.

There are no JavaScript-style functions in this file because it is plain CSS.

### `src/main/resources/static/app.js`
Purpose:
- Controls all frontend behavior and communication with the backend.

Constants and state:
- `STORAGE_KEY`
  - Session storage key for saving demo login session.
- DOM references
  - Cache frequently used HTML elements.
- `currentSession`
  - Holds the current logged-in account info in memory.

Functions:
- `formatMoney(value)`
  - Formats numeric values as USD currency text.
- `setAuthFeedback(message, type = "")`
  - Updates the login/create-account feedback banner.
  - Optional `type` adds visual styles like success or error.
- `setConsoleState(state, label)`
  - Updates the response console state and badge label.
- `showOutput(title, data, state = "success", label = "Complete")`
  - Writes formatted text into the response console.
- `renderTransactions(transactions)`
  - Renders transaction cards in the history panel.
  - Shows an empty state when there are no transactions.
- `renderAccount(account)`
  - Fills dashboard summary fields with current account data.
- `showDashboard()`
  - Hides auth screen and shows dashboard.
- `showAuth()`
  - Hides dashboard and shows auth screen.
- `saveSession(session)`
  - Saves current session to memory and `sessionStorage`.
- `clearSession()`
  - Removes current session from memory and `sessionStorage`.
- `getSavedSession()`
  - Reads saved session from `sessionStorage`.
- `parseResponse(response)`
  - Parses backend response as JSON or text.
  - Throws an error if the HTTP response is not successful.
- `apiRequest(title, url, options = {})`
  - Shared helper for all API calls.
  - Shows loading state.
  - Parses response.
  - Writes success or error output to the console.
- `loadAccountSummary()`
  - Fetches full account details for logged-in user.
  - Updates summary cards.
- `loadBalanceOnly()`
  - Fetches only the current balance.
  - Updates the balance card.
- `loadTransactions()`
  - Fetches transaction history for logged-in user.
  - Renders the transaction list.
- `openDashboard(session)`
  - Saves session.
  - Shows dashboard.
  - Loads account summary and transactions.

Event-driven functions:
- Auth tab click handlers
  - Switch between Login and Create Account panels.
- Login form submit handler
  - Fetches account by account number.
  - Checks whether entered email matches backend email.
  - Opens dashboard on success.
- Create account form submit handler
  - Sends account creation request.
  - Automatically logs user in on success.
- Transfer form submit handler
  - Sends transfer request using logged-in account as sender.
  - Reloads account summary and transaction history after success.
- Refresh account button handler
  - Reloads full account details.
- Refresh balance button handler
  - Reloads only balance.
- Load history button handler
  - Reloads transaction history.
- Logout button handler
  - Clears session.
  - Returns to auth screen.
- Clear console button handler
  - Resets response console message.

Startup function:
- `bootstrap()` anonymous async IIFE
  - Runs automatically when page loads.
  - Initializes the response console.
  - Initializes the transaction empty state.
  - Restores saved session if available.
  - If restore fails, returns user to auth screen.

---

## 6. Current Limitations

- No real authentication or passwords
- No Spring Security
- No user registration/login backend endpoints
- No automated tests in `src/test`
- No account deletion or transaction reversal
- No transfer audit beyond simple transaction record saving

## 7. Suggested Next Improvements

- Add real authentication with password hashing
- Add Spring Security or JWT authentication
- Add unit and integration tests
- Add API documentation with Swagger/OpenAPI
- Improve transaction timestamps formatting in frontend
- Add logout timeout and stronger frontend session handling
- Add better README with frontend screenshots and flow explanation

