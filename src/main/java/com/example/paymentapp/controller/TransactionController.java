package com.example.paymentapp.controller;

import com.example.paymentapp.dto.TransferRequest;
import com.example.paymentapp.entity.TransactionRecord;
import com.example.paymentapp.exception.UnauthorizedException;
import com.example.paymentapp.service.TransactionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final String SESSION_ACCOUNT_KEY = "accountNumber";

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    public String transferMoney(@Valid @RequestBody TransferRequest request, HttpServletRequest requestContext) {
        validateAccountAccess(request.getFromAccount(), requestContext);
        return transactionService.transferMoney(request);
    }

    @GetMapping("/{accountNumber}")
    public List<TransactionRecord> getTransactions(@PathVariable String accountNumber, HttpServletRequest request) {
        validateAccountAccess(accountNumber, request);
        return transactionService.getTransactions(accountNumber);
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
