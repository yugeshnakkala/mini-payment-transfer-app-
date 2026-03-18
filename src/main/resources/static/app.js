const STORAGE_KEY = "mini-payment-session";

const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");
const authFeedback = document.getElementById("auth-feedback");
const output = document.getElementById("output");
const consoleCard = document.getElementById("console-card");
const outputStatus = document.getElementById("output-status");
const transactionsList = document.getElementById("transactions-list");
const historyCount = document.getElementById("history-count");
const fromAccountInput = document.getElementById("from-account-input");

const welcomeName = document.getElementById("welcome-name");
const welcomeMeta = document.getElementById("welcome-meta");
const summaryAccountNumber = document.getElementById("summary-account-number");
const summaryAccountHolder = document.getElementById("summary-account-holder");
const summaryEmail = document.getElementById("summary-email");
const summaryBalance = document.getElementById("summary-balance");

let currentSession = null;

function formatMoney(value) {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

function setAuthFeedback(message, type = "") {
    authFeedback.textContent = message;
    authFeedback.className = "auth-feedback";

    if (type) {
        authFeedback.classList.add(type);
    }
}

function setConsoleState(state, label) {
    consoleCard.dataset.state = state;
    outputStatus.textContent = label;
}

function showOutput(title, data, state = "success", label = "Complete") {
    const rendered = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    output.textContent = `${title}\n\n${rendered}`;
    setConsoleState(state, label);
}

function renderTransactions(transactions) {
    historyCount.textContent = `${transactions.length} item${transactions.length === 1 ? "" : "s"}`;

    if (!transactions.length) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <strong>No transactions found.</strong>
                <p>This account has no transfer history yet.</p>
            </div>
        `;
        return;
    }

    transactionsList.innerHTML = transactions.map((transaction) => `
        <article class="transaction-item">
            <div class="transaction-topline">
                <span class="transaction-route">${transaction.fromAccount} -> ${transaction.toAccount}</span>
                <span class="transaction-amount">${formatMoney(transaction.amount)}</span>
            </div>
            <span class="transaction-status">${transaction.status}</span>
            <div class="transaction-meta">
                <span>From: ${transaction.fromAccount}</span>
                <span>To: ${transaction.toAccount}</span>
            </div>
            <p class="transaction-date">${transaction.transactionDate}</p>
        </article>
    `).join("");
}

function renderAccount(account) {
    welcomeName.textContent = `Welcome, ${account.accountHolderName}`;
    welcomeMeta.textContent = `Account ${account.accountNumber} is now active in your dashboard.`;
    summaryAccountNumber.textContent = account.accountNumber;
    summaryAccountHolder.textContent = account.accountHolderName;
    summaryEmail.textContent = account.email;
    summaryBalance.textContent = formatMoney(account.balance);
    fromAccountInput.value = account.accountNumber;
}

function showDashboard() {
    authView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
}

function showAuth() {
    dashboardView.classList.add("hidden");
    authView.classList.remove("hidden");
}

function saveSession(session) {
    currentSession = session;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
    currentSession = null;
    sessionStorage.removeItem(STORAGE_KEY);
}

function getSavedSession() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    }

    return data;
}

async function apiRequest(title, url, options = {}) {
    showOutput("Loading...", `${options.method || "GET"} ${url}`, "loading", "Loading");

    try {
        const response = await fetch(url, options);
        const data = await parseResponse(response);
        showOutput(title, data, "success", "Success");
        return data;
    } catch (error) {
        showOutput(`${title} Failed`, error.message, "error", "Attention");
        throw error;
    }
}

async function loadAccountSummary() {
    if (!currentSession) {
        return;
    }

    const account = await apiRequest(
        "Account Details",
        `/api/accounts/${encodeURIComponent(currentSession.accountNumber)}`
    );

    renderAccount(account);
}

async function loadBalanceOnly() {
    if (!currentSession) {
        return;
    }

    const balance = await apiRequest(
        "Account Balance",
        `/api/accounts/${encodeURIComponent(currentSession.accountNumber)}/balance`
    );

    summaryBalance.textContent = formatMoney(balance);
}

async function loadTransactions() {
    if (!currentSession) {
        return;
    }

    const transactions = await apiRequest(
        "Transaction History",
        `/api/transactions/${encodeURIComponent(currentSession.accountNumber)}`
    );

    renderTransactions(transactions);
}

async function openDashboard(session) {
    saveSession(session);
    showDashboard();
    await loadAccountSummary();
    await loadTransactions();
}

document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
        const target = button.dataset.authTab;

        document.querySelectorAll("[data-auth-tab]").forEach((tabButton) => {
            tabButton.classList.toggle("active", tabButton === button);
        });

        document.querySelectorAll("[data-auth-panel]").forEach((panel) => {
            panel.classList.toggle("active", panel.dataset.authPanel === target);
        });

        setAuthFeedback(
            target === "login"
                ? "Use your account number and email to continue."
                : "Create a new account to enter the dashboard."
        );
    });
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const accountNumber = formData.get("accountNumber").trim();
    const email = formData.get("email").trim();

    try {
        const account = await apiRequest(
            "Login Lookup",
            `/api/accounts/${encodeURIComponent(accountNumber)}`
        );

        if (account.email.toLowerCase() !== email.toLowerCase()) {
            throw new Error("The email does not match this account.");
        }

        setAuthFeedback("Login successful. Opening your dashboard.", "success");
        await openDashboard({ accountNumber, email });
    } catch (error) {
        setAuthFeedback(error.message, "error");
    }
});

document.getElementById("create-account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.balance = Number(payload.balance);

    try {
        const account = await apiRequest("Account Created", "/api/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        setAuthFeedback("Account created successfully. Logging you in now.", "success");
        event.currentTarget.reset();
        await openDashboard({
            accountNumber: account.accountNumber,
            email: account.email
        });
    } catch (error) {
        setAuthFeedback(error.message, "error");
    }
});

document.getElementById("transfer-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentSession) {
        return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.amount = Number(payload.amount);
    payload.fromAccount = currentSession.accountNumber;

    try {
        await apiRequest("Transfer Result", "/api/transactions/transfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        event.currentTarget.reset();
        fromAccountInput.value = currentSession.accountNumber;
        await loadAccountSummary();
        await loadTransactions();
    } catch (error) {
        return;
    }
});

document.getElementById("refresh-account-button").addEventListener("click", async () => {
    try {
        await loadAccountSummary();
    } catch (error) {
        return;
    }
});

document.getElementById("refresh-balance-button").addEventListener("click", async () => {
    try {
        await loadBalanceOnly();
    } catch (error) {
        return;
    }
});

document.getElementById("load-history-button").addEventListener("click", async () => {
    try {
        await loadTransactions();
    } catch (error) {
        return;
    }
});

document.getElementById("logout-button").addEventListener("click", () => {
    clearSession();
    renderTransactions([]);
    showAuth();
    setAuthFeedback("You have been logged out.", "success");
    showOutput("Response Console", "Login to an account to begin.", "idle", "Idle");
});

document.getElementById("clear-output-button").addEventListener("click", () => {
    showOutput("Response Console", "Use the dashboard actions to call the backend.", "idle", "Idle");
});

(async function bootstrap() {
    showOutput("Response Console", "Login to an account to begin.", "idle", "Idle");
    renderTransactions([]);

    const savedSession = getSavedSession();
    if (!savedSession) {
        showAuth();
        return;
    }

    try {
        await openDashboard(savedSession);
        setAuthFeedback("Restored your previous session.", "success");
    } catch (error) {
        clearSession();
        showAuth();
        setAuthFeedback("Your saved session could not be restored. Please log in again.", "error");
    }
})();
