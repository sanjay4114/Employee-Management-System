package com.ems.backend.config;

import com.ems.backend.entity.Role;
import com.ems.backend.entity.User;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner createDefaultAdmin() {
        return args -> {
            User admin = userRepository.findByUsername("admin").orElse(null);
            if (admin == null) {
                admin = User.builder().username("admin").build();
            }
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        };
    }
}
