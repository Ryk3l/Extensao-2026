package com.rodovialanches.controller;

import com.rodovialanches.model.User;
import com.rodovialanches.repository.OrderRepository;
import com.rodovialanches.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public UserController(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Lista todos os usuários registrados.
     */
    @GetMapping
    public List<User> list() {
        return userRepository.findAll();
    }

    /**
     * Cadastra um novo garçom.
     * Recebe apenas o nome no corpo da requisição e garante que o papel será GARCOM.
     */
    @PostMapping("/waiters")
    public ResponseEntity<User> createWaiter(@RequestBody User user) {
        if (user.getName() == null || user.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        user.setRole("GARCOM");
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
    }

    /**
     * Cadastra um novo cliente.
     * Recebe nome e telefone; bloqueia duplicidade (mesmo nome + mesmo telefone).
     */
    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestBody User user) {
        if (user.getName() == null || user.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Nome é obrigatório.");
        }
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Telefone é obrigatório.");
        }
        String name = user.getName().trim();
        String phone = user.getPhone().trim();
        if (userRepository.existsByNameIgnoreCaseAndPhoneAndRole(name, phone, "CLIENTE")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Já existe um cliente com esse nome e telefone.");
        }
        user.setName(name);
        user.setPhone(phone);
        user.setRole("CLIENTE");
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
    }

    /**
     * Atualiza um usuário existente.
     * Permite alterar o nome e telefone do usuário.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User user) {
        return userRepository.findById(id)
                .map(existing -> {
                    String newName = user.getName() != null && !user.getName().isBlank() ? user.getName().trim() : existing.getName();
                    String newPhone = user.getPhone() != null ? user.getPhone().trim() : existing.getPhone();
                    if ("CLIENTE".equals(existing.getRole()) && newPhone != null && !newPhone.isBlank()) {
                        boolean changed = !newName.equalsIgnoreCase(existing.getName()) || !newPhone.equals(existing.getPhone());
                        if (changed && userRepository.existsByNameIgnoreCaseAndPhoneAndRole(newName, newPhone, "CLIENTE")) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                                    .body((Object) "Já existe um cliente com esse nome e telefone.");
                        }
                    }
                    existing.setName(newName);
                    if (user.getPhone() != null) existing.setPhone(newPhone);
                    return ResponseEntity.ok((Object) userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deleta um usuário do sistema.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (orderRepository.existsByWaiter_Id(id) || orderRepository.existsByCustomer_Id(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Usuário possui pedidos vinculados e não pode ser removido.");
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
