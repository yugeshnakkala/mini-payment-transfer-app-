package com.example.paymentapp.service;

import com.example.paymentapp.dto.AccountRequest;
import com.example.paymentapp.dto.LoginRequest;
import com.example.paymentapp.entity.Account;
import com.example.paymentapp.exception.BadRequestException;
import com.example.paymentapp.exception.ResourceNotFoundException;
import com.example.paymentapp.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
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
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        return accountRepository.save(account);
    }

    public Account getAccountByNumber(String accountNumber) {
        return findAccountEntityByNumber(accountNumber);
    }

    public BigDecimal getBalance(String accountNumber) {
        return getAccountByNumber(accountNumber).getBalance();
    }

    public Account login(LoginRequest request) {
        Account account = findAccountEntityByNumber(request.getAccountNumber());

        if (account.getPasswordHash() == null || account.getPasswordHash().isBlank()) {
            throw new BadRequestException(
                    "This account does not have a password yet. Please create a new account with password login enabled."
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Invalid account number or password");
        }

        return account;
    }

    private Account findAccountEntityByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
    }
}
