const output = document.getElementById("output");

function showOutput(title, data) {
    const rendered = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    output.textContent = `${title}\n\n${rendered}`;
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

async function sendRequest(title, url, options = {}) {
    showOutput("Loading...", `${options.method || "GET"} ${url}`);

    try {
        const response = await fetch(url, options);
        const data = await parseResponse(response);
        showOutput(title, data);
    } catch (error) {
        showOutput(`${title} Failed`, error.message);
    }
}

document.getElementById("create-account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.balance = Number(payload.balance);

    await sendRequest("Account Created", "/api/accounts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
});

document.getElementById("get-account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountNumber = new FormData(event.currentTarget).get("accountNumber");
    await sendRequest("Account Details", `/api/accounts/${encodeURIComponent(accountNumber)}`);
});

document.getElementById("get-balance-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountNumber = new FormData(event.currentTarget).get("accountNumber");
    await sendRequest("Account Balance", `/api/accounts/${encodeURIComponent(accountNumber)}/balance`);
});

document.getElementById("transfer-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.amount = Number(payload.amount);

    await sendRequest("Transfer Result", "/api/transactions/transfer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
});

document.getElementById("get-transactions-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountNumber = new FormData(event.currentTarget).get("accountNumber");
    await sendRequest("Transaction History", `/api/transactions/${encodeURIComponent(accountNumber)}`);
});

document.getElementById("clear-output-button").addEventListener("click", () => {
    showOutput("API Response", "Use one of the forms above to test the backend.");
});
