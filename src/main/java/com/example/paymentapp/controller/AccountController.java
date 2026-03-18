package com.example.paymentapp.controller;

import com.example.paymentapp.dto.AccountRequest;
import com.example.paymentapp.entity.Account;
import com.example.paymentapp.exception.UnauthorizedException;
import com.example.paymentapp.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private static final String SESSION_ACCOUNT_KEY = "accountNumber";

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public Account createAccount(@Valid @RequestBody AccountRequest request) {
        return accountService.createAccount(request);
    }

    @GetMapping("/{accountNumber}")
    public Account getAccount(@PathVariable String accountNumber, HttpServletRequest request) {
        validateAccountAccess(accountNumber, request);
        return accountService.getAccountByNumber(accountNumber);
    }

    @GetMapping("/{accountNumber}/balance")
    public BigDecimal getBalance(@PathVariable String accountNumber, HttpServletRequest request) {
        validateAccountAccess(accountNumber, request);
        return accountService.getBalance(accountNumber);
    }

    private void validateAccountAccess(String accountNumber, HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null) {
            throw new UnauthorizedException("You must log in first");
        }

        Object authenticatedAccount = session.getAttribute(SESSION_ACCOUNT_KEY);

        if (!(authenticatedAccount instanceof String currentAccountNumber) || currentAccountNumber.isBlank()) {
            throw new UnauthorizedException("You must log in first");
        }

        if (!currentAccountNumber.equals(accountNumber)) {
            throw new UnauthorizedException("You can only access your own account");
        }
    }
}
