package com.example.paymentapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String accountNumber;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
}
