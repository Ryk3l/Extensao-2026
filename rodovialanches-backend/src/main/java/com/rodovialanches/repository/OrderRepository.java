package com.rodovialanches.repository;

import com.rodovialanches.model.Order;
import com.rodovialanches.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    boolean existsByWaiter_Id(Long waiterId);
    boolean existsByCustomer_Id(Long customerId);
}
