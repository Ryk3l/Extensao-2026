package com.rodovialanches.service;

import com.rodovialanches.model.Order;
import com.rodovialanches.model.OrderItem;
import com.rodovialanches.model.OrderStatus;
import com.rodovialanches.repository.OrderRepository;
import com.rodovialanches.repository.ProductRepository;
import com.rodovialanches.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(Order order) {
        if (order.getWaiter() == null || order.getWaiter().getId() == null) {
            throw new IllegalArgumentException("Garçom não informado");
        }
        var waiter = userRepository.findById(order.getWaiter().getId())
                .orElseThrow(() -> new IllegalArgumentException("Garçom não encontrado: " + order.getWaiter().getId()));
        order.setWaiter(waiter);

        if (order.getCustomer() == null || order.getCustomer().getId() == null) {
            throw new IllegalArgumentException("Cliente não informado");
        }
        var customer = userRepository.findById(order.getCustomer().getId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + order.getCustomer().getId()));
        if (!"CLIENTE".equals(customer.getRole())) {
            throw new IllegalArgumentException("O usuário informado não é um cliente");
        }
        order.setCustomer(customer);

        if (order.getTableNumber() == null || order.getTableNumber() < 1 || order.getTableNumber() > 8) {
            throw new IllegalArgumentException("Número de mesa inválido");
        }

        order.setStatus(OrderStatus.PENDING_PREPARATION);
        for (OrderItem it : order.getItems()) {
            var product = productRepository.findById(it.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado: " + it.getProduct().getId()));
            if (product.getQuantity() < it.getQuantity()) {
                throw new IllegalArgumentException("Estoque insuficiente para " + product.getName());
            }
            product.setQuantity(product.getQuantity() - it.getQuantity());
            productRepository.save(product);
            it.setProduct(product);
            it.setOrder(order);
        }
        return orderRepository.save(order);
    }

    public List<Order> listAll() { return orderRepository.findAll(); }

    public List<Order> listByStatus(OrderStatus status) { return orderRepository.findByStatus(status); }

    public Optional<Order> find(Long id) { return orderRepository.findById(id); }

    @Transactional
    public Order updateStatus(Long id, OrderStatus status) {
        Order o = orderRepository.findById(id).orElseThrow();
        o.setStatus(status);
        return orderRepository.save(o);
    }

    @Transactional
    public boolean delete(Long id) {
        if (!orderRepository.existsById(id)) return false;
        orderRepository.deleteById(id);
        return true;
    }
}
