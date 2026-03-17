package com.example.paymentapp.service;

import com.example.paymentapp.dto.TransferRequest;
import com.example.paymentapp.entity.Account;
import com.example.paymentapp.entity.TransactionRecord;
import com.example.paymentapp.exception.BadRequestException;
import com.example.paymentapp.exception.ResourceNotFoundException;
import com.example.paymentapp.repository.AccountRepository;
import com.example.paymentapp.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(AccountRepository accountRepository,
                              TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public String transferMoney(TransferRequest request) {
        if (request.getFromAccount().equals(request.getToAccount())) {
            throw new BadRequestException("Sender and receiver accounts cannot be the same");
        }

        Account sender = accountRepository.findByAccountNumber(request.getFromAccount())
                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

        Account receiver = accountRepository.findByAccountNumber(request.getToAccount())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(request.getAmount()));
        receiver.setBalance(receiver.getBalance().add(request.getAmount()));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        TransactionRecord transaction = new TransactionRecord();
        transaction.setFromAccount(request.getFromAccount());
        transaction.setToAccount(request.getToAccount());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        return "Transfer completed successfully";
    }

    public List<TransactionRecord> getTransactions(String accountNumber) {
        return transactionRepository.findByFromAccountOrToAccountOrderByTransactionDateDesc(accountNumber, accountNumber);
    }
}
