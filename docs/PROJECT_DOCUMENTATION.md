# Mini Payment Transfer App Documentation

## 1. Project Overview

This project is a Spring Boot + MySQL application for:

- creating accounts
- logging in with account number and password
- maintaining a server-side session
- automatically logging out inactive users
- checking account details
- checking balances
- transferring money between accounts
- viewing transaction history

It also includes a frontend dashboard served directly by Spring Boot from `src/main/resources/static`.

Important note:
- The app now uses real password-based login.
- Passwords are stored as BCrypt hashes.
- Authentication is session-based using `JSESSIONID`.
- The frontend auto-logs out after 10 minutes of inactivity.
- The backend session also expires after 10 minutes.

## 2. Tech Stack

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL
- Lombok
- Maven
- Spring Security Crypto
- HTML, CSS, JavaScript for the frontend

## 3. High-Level Flow

### Backend flow

1. The browser sends a request to a controller.
2. The controller validates session access when needed.
3. The controller passes the request to a service.
4. The service performs validation and business logic.
5. The service reads/writes data through a repository.
6. The repository talks to MySQL using JPA/Hibernate.
7. The response is returned as JSON.
8. If an error happens, `GlobalExceptionHandler` formats the error response.

### Frontend flow

1. The user opens `/`.
2. `index.html` loads `app.css`, `app.js`, and `favicon.svg`.
3. `app.js` shows the login/create-account screen.
4. After login, `app.js` opens the dashboard.
5. Dashboard actions call backend endpoints with `fetch()`.
6. Inactivity resets a timer.
7. After 10 minutes without activity, the frontend logs out automatically.

## 4. API Endpoints

### Auth endpoints

- `POST /api/auth/login`
  - Logs in with account number and password.
  - Creates a backend session.
- `GET /api/auth/me`
  - Returns the currently logged-in account from the session.
- `POST /api/auth/logout`
  - Invalidates the backend session and clears the session cookie.

### Account endpoints

- `POST /api/accounts`
  - Creates a new account with password.
- `GET /api/accounts/{accountNumber}`
  - Returns account details for the authenticated account only.
- `GET /api/accounts/{accountNumber}/balance`
  - Returns balance for the authenticated account only.

### Transaction endpoints

- `POST /api/transactions/transfer`
  - Transfers money between accounts.
  - The sender must match the logged-in account.
- `GET /api/transactions/{accountNumber}`
  - Returns transaction history for the authenticated account only.

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
  - Spring Security Crypto
  - Spring Boot Test
- Spring Boot Maven plugin

### `README.md`
Purpose:
- Main project overview for GitHub readers.

What it covers:
- feature summary
- auth flow
- API summary
- run steps
- manual testing flow

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
- `server.servlet.session.timeout=10m`
  - Sets backend session timeout to 10 minutes.

---

## Backend Java Files

### `src/main/java/com/example/paymentapp/PaymentAppApplication.java`
Purpose:
- Main entry point of the Spring Boot application.

Functions:
- `main(String[] args)`
  - Starts Spring Boot by calling `SpringApplication.run(...)`.

---

## Config Files

### `src/main/java/com/example/paymentapp/config/SecurityConfig.java`
Purpose:
- Provides security-related beans for the application.

Functions:
- `passwordEncoder()`
  - Returns a `BCryptPasswordEncoder`.
  - Used to hash passwords during account creation.
  - Used to verify passwords during login.

---

## Controllers

### `src/main/java/com/example/paymentapp/controller/AuthController.java`
Purpose:
- Exposes auth/session endpoints.

Functions:
- `AuthController(AccountService accountService)`
  - Constructor injection for the service.
- `login(LoginRequest request, HttpSession session)`
  - Handles `POST /api/auth/login`.
  - Validates credentials through `AccountService`.
  - Stores `accountNumber` in the session.
  - Returns the authenticated account.
- `getCurrentAccount(HttpServletRequest request)`
  - Handles `GET /api/auth/me`.
  - Reads authenticated account number from the session.
  - Returns the logged-in account.
- `logout(HttpServletRequest request, HttpServletResponse response)`
  - Handles `POST /api/auth/logout`.
  - Invalidates the session if present.
  - Clears the `JSESSIONID` cookie.
  - Returns a success message.
- `getAuthenticatedAccountNumber(HttpServletRequest request)`
  - Internal helper.
  - Reads the session without creating a new one.
  - Throws `UnauthorizedException` if not logged in.

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
- `getAccount(String accountNumber, HttpServletRequest request)`
  - Handles `GET /api/accounts/{accountNumber}`.
  - Checks the logged-in user can only access their own account.
  - Returns the account object.
- `getBalance(String accountNumber, HttpServletRequest request)`
  - Handles `GET /api/accounts/{accountNumber}/balance`.
  - Checks the logged-in user can only access their own account.
  - Returns `BigDecimal` balance only.
- `validateAccountAccess(String accountNumber, HttpServletRequest request)`
  - Internal helper.
  - Reads session without creating a new one.
  - Throws `UnauthorizedException` for missing or mismatched session.

### `src/main/java/com/example/paymentapp/controller/TransactionController.java`
Purpose:
- Exposes REST endpoints related to transactions.

Functions:
- `TransactionController(TransactionService transactionService)`
  - Constructor injection for the service.
- `transferMoney(TransferRequest request, HttpServletRequest requestContext)`
  - Handles `POST /api/transactions/transfer`.
  - Ensures the logged-in user can only transfer from their own account.
  - Calls `transactionService.transferMoney(...)`.
  - Returns a success message string.
- `getTransactions(String accountNumber, HttpServletRequest request)`
  - Handles `GET /api/transactions/{accountNumber}`.
  - Ensures the logged-in user can only read their own transaction history.
  - Returns a list of `TransactionRecord`.
- `validateAccountAccess(String accountNumber, HttpServletRequest request)`
  - Internal helper for session/account validation.

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
- `password`
  - Must not be blank.
  - Must be between 6 and 100 characters.

Generated methods:
- Lombok `@Data` generates getters, setters, `toString`, `equals`, and `hashCode`.

### `src/main/java/com/example/paymentapp/dto/LoginRequest.java`
Purpose:
- Defines the JSON structure for login requests.

Fields:
- `accountNumber`
  - Must not be blank.
- `password`
  - Must not be blank.
  - Must be between 6 and 100 characters.

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
- `passwordHash`
  - Stored BCrypt password hash.
  - Marked with `@JsonIgnore` so it is not returned to the frontend.

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
- Contains business logic related to accounts and login.

Functions:
- `AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder)`
  - Constructor injection for the repository and encoder.
- `createAccount(AccountRequest request)`
  - Checks whether account number already exists.
  - Throws `BadRequestException` if duplicate.
  - Maps request data to `Account`.
  - Hashes the password with BCrypt.
  - Saves and returns the new account.
- `getAccountByNumber(String accountNumber)`
  - Looks up account by account number.
  - Throws `ResourceNotFoundException` if not found.
  - Returns the matching `Account`.
- `getBalance(String accountNumber)`
  - Reuses `getAccountByNumber(...)`.
  - Returns only the account balance.
- `login(LoginRequest request)`
  - Looks up the account by number.
  - Rejects accounts that do not yet have a password hash.
  - Verifies the password using BCrypt.
  - Throws `BadRequestException` for invalid credentials.
  - Returns the authenticated account.
- `findAccountEntityByNumber(String accountNumber)`
  - Internal helper for account lookup.

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

### `src/main/java/com/example/paymentapp/exception/UnauthorizedException.java`
Purpose:
- Custom runtime exception for unauthenticated or unauthorized access.

Functions:
- `UnauthorizedException(String message)`
  - Stores an error message for authorization failures.

### `src/main/java/com/example/paymentapp/exception/GlobalExceptionHandler.java`
Purpose:
- Converts thrown exceptions into consistent JSON error responses.

Functions:
- `handleNotFound(ResourceNotFoundException ex)`
  - Returns HTTP 404 response.
- `handleBadRequest(BadRequestException ex)`
  - Returns HTTP 400 response.
- `handleUnauthorized(UnauthorizedException ex)`
  - Returns HTTP 401 response.
- `handleNoResourceFound(NoResourceFoundException ex)`
  - Returns HTTP 404 for missing static resources.
- `handleValidation(MethodArgumentNotValidException ex)`
  - Returns HTTP 400 response with field-level validation errors.
- `handleGeneric(Exception ex)`
  - Returns HTTP 500 response.
- `buildResponse(HttpStatus status, String message)`
  - Shared helper that creates the JSON error body.

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
- `login-form`
  - Lets the user log in with account number and password.
- `create-account-form`
  - Lets the user create a new account with password.
- `dashboard-view`
  - Shown after login.
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
- Adds entrance animations.

### `src/main/resources/static/app.js`
Purpose:
- Controls all frontend behavior and communication with the backend.

Constants and state:
- `AUTO_LOGOUT_MS`
  - Frontend inactivity timeout set to 10 minutes.
- `ACTIVITY_EVENTS`
  - Browser events that reset the inactivity timer.
- DOM references
  - Cached references to page elements.
- `currentSession`
  - Stores the active logged-in account number.
- `inactivityTimer`
  - Stores the active logout timeout handle.

Functions:
- `extractErrorMessage(data)`
  - Converts backend error responses into readable messages.
- `formatMoney(value)`
  - Formats numeric values as USD currency.
- `setAuthFeedback(message, type = "")`
  - Updates the auth feedback banner.
- `setConsoleState(state, label)`
  - Updates the response console state and badge.
- `showOutput(title, data, state = "success", label = "Complete")`
  - Writes formatted output into the console panel.
- `renderTransactions(transactions)`
  - Renders transaction items.
- `renderAccount(account)`
  - Fills dashboard summary data.
- `resetDashboardState()`
  - Clears dashboard values back to defaults.
- `showDashboard()`
  - Hides auth screen and shows dashboard.
- `showAuth()`
  - Hides dashboard and shows auth screen.
- `setCurrentSession(accountNumber)`
  - Stores the logged-in account in memory.
- `stopInactivityTimer()`
  - Clears any active timeout.
- `performLogout(message, shouldCallServer = true)`
  - Logs out from the frontend.
  - Optionally calls backend logout.
  - Clears UI state.
- `resetInactivityTimer()`
  - Restarts the inactivity timer.
- `parseResponse(response)`
  - Parses backend response and throws rich errors for failed responses.
- `apiRequest(title, url, options = {})`
  - Shared helper for all fetch calls.
  - Updates console state.
  - Resets inactivity timer after successful activity.
  - Logs out automatically on `401` when session expires.
- `loadAccountSummary()`
  - Fetches current logged-in account through `/api/auth/me`.
- `loadBalanceOnly()`
  - Fetches account balance.
- `loadTransactions()`
  - Fetches transaction history.
- `openDashboard(session)`
  - Stores session, shows dashboard, and loads dashboard data.

Event-driven functions:
- Auth tab click handlers
  - Switch between login and create-account panels.
- Login submit handler
  - Sends credentials to `/api/auth/login`.
- Create account submit handler
  - Creates an account and then logs in automatically.
- Transfer submit handler
  - Sends transfer request and reloads account data.
- Refresh account button handler
  - Reloads current account details.
- Refresh balance button handler
  - Reloads only the balance.
- Load history button handler
  - Reloads transaction history.
- Logout button handler
  - Calls `performLogout(...)`.
- Clear console button handler
  - Resets response console.
- Global activity listeners
  - Reset inactivity timer during active use.

Startup function:
- `bootstrap()` anonymous async IIFE
  - Initializes the page.
  - Clears dashboard state.
  - Opens the auth screen by default.
  - Sets the initial login message.

### `src/main/resources/static/favicon.svg`
Purpose:
- Provides the browser favicon for the app.

What it does:
- Gives the project a branded icon.
- Prevents missing-favicon noise in the browser.

---

## 6. Current Limitations

- Uses session-based auth, not JWT
- No password reset flow
- Older accounts created before password support may not have valid passwords
- No automated tests in `src/test`
- No account deletion
- No transaction reversal or approval flow

## 7. Suggested Next Improvements

- Add password reset or migration flow for old accounts
- Add auth and transfer automated tests
- Add Docker Compose
- Add Swagger/OpenAPI docs
- Add nicer frontend toast notifications
- Format transaction dates in a more user-friendly way

