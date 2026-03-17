package com.example.paymentapp.controller;

import com.example.paymentapp.dto.AccountRequest;
import com.example.paymentapp.entity.Account;
import com.example.paymentapp.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public Account createAccount(@Valid @RequestBody AccountRequest request) {
        return accountService.createAccount(request);
    }

    @GetMapping("/{accountNumber}")
    public Account getAccount(@PathVariable String accountNumber) {
        return accountService.getAccountByNumber(accountNumber);
    }

    @GetMapping("/{accountNumber}/balance")
    public BigDecimal getBalance(@PathVariable String accountNumber) {
        return accountService.getBalance(accountNumber);
    }
}
