package com.example.paymentapp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {
    @NotBlank
    private String accountNumber;

    @NotBlank
    private String accountHolderName;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal balance;

    @NotBlank
    @Email
    private String email;
}
