package com.example.paymentapp.repository;

import com.example.paymentapp.entity.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionRecord, Long> {
    List<TransactionRecord> findByFromAccountOrToAccountOrderByTransactionDateDesc(String fromAccount, String toAccount);
}
