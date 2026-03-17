package com.example.paymentapp.controller;

import com.example.paymentapp.dto.TransferRequest;
import com.example.paymentapp.entity.TransactionRecord;
import com.example.paymentapp.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    public String transferMoney(@Valid @RequestBody TransferRequest request) {
        return transactionService.transferMoney(request);
    }

    @GetMapping("/{accountNumber}")
    public List<TransactionRecord> getTransactions(@PathVariable String accountNumber) {
        return transactionService.getTransactions(accountNumber);
    }
}
