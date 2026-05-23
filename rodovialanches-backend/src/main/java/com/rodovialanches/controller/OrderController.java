package com.rodovialanches.controller;

import com.rodovialanches.model.Order;
import com.rodovialanches.model.OrderStatus;
import com.rodovialanches.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) { this.orderService = orderService; }

    /**
     * Cria um novo pedido.
     * O payload deve enviar waiter.id, customer.id, tableNumber e items.
     */
    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Order order) {
        Order saved = orderService.createOrder(order);
        return ResponseEntity.ok(saved);
    }

    /**
     * Lista todos os pedidos no sistema.
     */
    @GetMapping
    public List<Order> list() {
        return orderService.listAll();
    }

    @GetMapping("/status/{status}")
    public List<Order> byStatus(@PathVariable OrderStatus status) { return orderService.listByStatus(status); }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        Order updated = orderService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return orderService.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

