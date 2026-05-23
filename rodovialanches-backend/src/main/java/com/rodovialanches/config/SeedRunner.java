package com.rodovialanches.config;

import com.rodovialanches.model.Product;
import com.rodovialanches.model.User;
import com.rodovialanches.repository.ProductRepository;
import com.rodovialanches.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SeedRunner implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public SeedRunner(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            var users = List.of(
                    makeUser(1L, "Garcom1", "GARCOM"),
                    makeUser(2L, "Cozinha1", "COZINHA"),
                    makeUser(3L, "Balcao1", "BALCAO"),
                    makeUser(4L, "Gerente1", "GERENTE"),
                    makeUser(5L, "Cliente1", "CLIENTE")
            );
            userRepository.saveAll(users);
        }

        if (productRepository.count() == 0) {
            var products = List.of(
                    makeProduct(1L, "X-Salada", 12.50, 20),
                    makeProduct(2L, "X-Burguer", 10.00, 20),
                    makeProduct(3L, "Batata Frita", 8.00, 30),
                    makeProduct(4L, "Refrigerante Lata", 5.00, 50)
            );
            productRepository.saveAll(products);
        } else {
            var toFix = productRepository.findAll().stream()
                    .filter(p -> p.getQuantity() == null)
                    .peek(p -> {
                        if (p.getName().contains("Batata")) p.setQuantity(30);
                        else if (p.getName().contains("Refrigerante")) p.setQuantity(50);
                        else p.setQuantity(20);
                    })
                    .toList();
            if (!toFix.isEmpty()) {
                productRepository.saveAll(toFix);
            }
        }
    }

    private User makeUser(Long id, String name, String role) {
        User u = new User(); u.setId(id); u.setName(name); u.setRole(role); return u;
    }

    private Product makeProduct(Long id, String name, Double price, Integer quantity) {
        Product p = new Product(); p.setId(id); p.setName(name); p.setPrice(price); p.setQuantity(quantity); return p;
    }
}
