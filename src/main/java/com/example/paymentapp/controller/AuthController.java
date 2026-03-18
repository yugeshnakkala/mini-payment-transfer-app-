package com.example.paymentapp.controller;

import com.example.paymentapp.dto.LoginRequest;
import com.example.paymentapp.entity.Account;
import com.example.paymentapp.exception.UnauthorizedException;
import com.example.paymentapp.service.AccountService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String SESSION_ACCOUNT_KEY = "accountNumber";

    private final AccountService accountService;

    public AuthController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/login")
    public Account login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        Account account = accountService.login(request);
        session.setAttribute(SESSION_ACCOUNT_KEY, account.getAccountNumber());
        return account;
    }

    @GetMapping("/me")
    public Account getCurrentAccount(HttpServletRequest request) {
        return accountService.getAccountByNumber(getAuthenticatedAccountNumber(request));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return Map.of("message", "Logged out successfully");
    }

    private String getAuthenticatedAccountNumber(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null) {
            throw new UnauthorizedException("You must log in first");
        }

        Object accountNumber = session.getAttribute(SESSION_ACCOUNT_KEY);

        if (!(accountNumber instanceof String authenticatedAccount) || authenticatedAccount.isBlank()) {
            throw new UnauthorizedException("You must log in first");
        }

        return authenticatedAccount;
    }
}
