package com.example.paymentapp.service;

import com.example.paymentapp.dto.AccountRequest;
import com.example.paymentapp.entity.Account;
import com.example.paymentapp.exception.BadRequestException;
import com.example.paymentapp.exception.ResourceNotFoundException;
import com.example.paymentapp.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Account createAccount(AccountRequest request) {
        if (accountRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new BadRequestException("Account number already exists");
        }

        Account account = new Account();
        account.setAccountNumber(request.getAccountNumber());
        account.setAccountHolderName(request.getAccountHolderName());
        account.setBalance(request.getBalance());
        account.setEmail(request.getEmail());
        return accountRepository.save(account);
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
    }

    public BigDecimal getBalance(String accountNumber) {
        return getAccountByNumber(accountNumber).getBalance();
    }
}
