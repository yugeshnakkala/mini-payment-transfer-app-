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

const AUTO_LOGOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

let currentSession = null;
let inactivityTimer = null;

function extractErrorMessage(data) {
    if (typeof data === "string") {
        return data;
    }

    if (data && typeof data === "object") {
        if (data.error === "Validation failed" && data.details && typeof data.details === "object") {
            return Object.entries(data.details)
                .map(([field, message]) => `${field}: ${message}`)
                .join("\n");
        }

        if (typeof data.error === "string" && data.error.trim()) {
            return data.error;
        }
    }

    return "Request failed";
}

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

function resetDashboardState() {
    welcomeName.textContent = "Welcome back";
    welcomeMeta.textContent = "Your account summary is ready.";
    summaryAccountNumber.textContent = "-";
    summaryAccountHolder.textContent = "-";
    summaryEmail.textContent = "-";
    summaryBalance.textContent = "-";
    fromAccountInput.value = "";
    historyCount.textContent = "0 items";
    renderTransactions([]);
}

function showDashboard() {
    authView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
}

function showAuth() {
    dashboardView.classList.add("hidden");
    authView.classList.remove("hidden");
}

function setCurrentSession(accountNumber) {
    currentSession = { accountNumber };
}

function stopInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

async function performLogout(message, shouldCallServer = true) {
    stopInactivityTimer();

    if (shouldCallServer) {
        try {
            await fetch("/api/auth/logout", {
                method: "POST"
            });
        } catch (error) {
            // Ignore network/logout failures and still clear the local UI state.
        }
    }

    currentSession = null;
    resetDashboardState();
    showAuth();
    setAuthFeedback(message, message.toLowerCase().includes("expired") ? "error" : "success");
    showOutput("Response Console", "Login to an account to begin.", "idle", "Idle");
}

function resetInactivityTimer() {
    if (!currentSession) {
        return;
    }

    stopInactivityTimer();
    inactivityTimer = setTimeout(() => {
        performLogout("You were logged out automatically after 10 minutes of inactivity.", true);
    }, AUTO_LOGOUT_MS);
}

ACTIVITY_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, () => {
        resetInactivityTimer();
    }, { passive: true });
});

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const error = new Error(extractErrorMessage(data));
        error.status = response.status;
        throw error;
    }

    return data;
}

async function apiRequest(title, url, options = {}) {
    showOutput("Loading...", `${options.method || "GET"} ${url}`, "loading", "Loading");

    try {
        const response = await fetch(url, options);
        const data = await parseResponse(response);
        showOutput(title, data, "success", "Success");
        resetInactivityTimer();
        return data;
    } catch (error) {
        if (error.status === 401 && currentSession && url !== "/api/auth/logout") {
            await performLogout("Your session expired. Please log in again.", false);
            throw error;
        }

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
        "/api/auth/me"
    );

    renderAccount(account);
    setCurrentSession(account.accountNumber);
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
    setCurrentSession(session.accountNumber);
    showDashboard();
    resetInactivityTimer();
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
                ? "Use your account number and password to continue."
                : "Create a new account with a secure password to enter the dashboard."
        );
    });
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.accountNumber = payload.accountNumber.trim();

    try {
        const account = await apiRequest(
            "Login Successful",
            "/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        setAuthFeedback("Login successful. Opening your dashboard.", "success");
        form.reset();
        await openDashboard({ accountNumber: account.accountNumber });
    } catch (error) {
        setAuthFeedback(error.message, "error");
    }
});

document.getElementById("create-account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
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

        await apiRequest("Login Successful", "/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accountNumber: payload.accountNumber,
                password: payload.password
            })
        });

        setAuthFeedback("Account created successfully. Logging you in now.", "success");
        form.reset();
        await openDashboard({ accountNumber: account.accountNumber });
    } catch (error) {
        setAuthFeedback(error.message, "error");
    }
});

document.getElementById("transfer-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentSession) {
        return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
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

        form.reset();
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
    performLogout("You have been logged out.", true);
});

document.getElementById("clear-output-button").addEventListener("click", () => {
    showOutput("Response Console", "Use the dashboard actions to call the backend.", "idle", "Idle");
});

(async function bootstrap() {
    resetDashboardState();
    showOutput("Response Console", "Login to an account to begin.", "idle", "Idle");
    stopInactivityTimer();
    currentSession = null;
    showAuth();
    setAuthFeedback("Use your account number and password to continue.");
})();
