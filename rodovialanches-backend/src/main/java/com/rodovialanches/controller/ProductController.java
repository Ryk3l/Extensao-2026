package com.rodovialanches.controller;

import com.rodovialanches.model.Product;
import com.rodovialanches.repository.OrderItemRepository;
import com.rodovialanches.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductController(ProductRepository productRepository, OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping
    public List<Product> list() { return productRepository.findAll(); }

    /**
     * Cria um novo produto.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Nome do produto é obrigatório.");
        }
        if (product.getPrice() == null || product.getPrice() < 0) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Preço inválido.");
        }
        if (product.getQuantity() == null || product.getQuantity() < 0) {
            product.setQuantity(0);
        }
        product.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(productRepository.save(product));
    }

    /**
     * Atualiza nome e/ou preço de um produto existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Product body) {
        return productRepository.findById(id)
                .map(product -> {
                    if (body.getName() != null) {
                        String name = body.getName().trim();
                        if (name.isEmpty()) {
                            return ResponseEntity.badRequest()
                                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                                    .body((Object) "Nome do produto não pode ficar vazio.");
                        }
                        product.setName(name);
                    }
                    if (body.getPrice() != null) {
                        if (body.getPrice() < 0) {
                            return ResponseEntity.badRequest()
                                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                                    .body((Object) "Preço inválido.");
                        }
                        product.setPrice(body.getPrice());
                    }
                    return ResponseEntity.ok((Object) productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Define o estoque do produto com um valor absoluto.
     */
    @PutMapping("/{id}/quantity")
    public ResponseEntity<?> setQuantity(@PathVariable Long id, @RequestParam int quantity) {
        if (quantity < 0) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Quantidade não pode ser negativa.");
        }
        return productRepository.findById(id)
                .map(product -> {
                    product.setQuantity(quantity);
                    return ResponseEntity.ok((Object) productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Ajusta o estoque do produto somando o delta (pode ser negativo).
     */
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam int delta) {
        return productRepository.findById(id)
                .map(product -> {
                    int newQuantity = (product.getQuantity() == null ? 0 : product.getQuantity()) + delta;
                    if (newQuantity < 0) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                                .body((Object) "Estoque não pode ficar negativo.");
                    }
                    product.setQuantity(newQuantity);
                    return ResponseEntity.ok((Object) productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (orderItemRepository.existsByProduct_Id(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .contentType(MediaType.parseMediaType("text/plain; charset=UTF-8"))
                    .body("Produto possui pedidos vinculados e não pode ser removido.");
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
