package com.rodovialanches.repository;

import com.rodovialanches.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByNameIgnoreCaseAndPhoneAndRole(String name, String phone, String role);
}
