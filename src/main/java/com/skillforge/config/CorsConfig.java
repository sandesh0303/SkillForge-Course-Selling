package com.skillforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        .allowedOrigins(
                                "https://skillforgecourse.netlify.app",
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:5176",
                                "http://localhost:5177",
                                "http://127.0.0.1:5173",
                                "http://127.0.0.1:5174",
                                "http://127.0.0.1:5176",
                                "http://127.0.0.1:5177"
                        )
                        .allowedMethods(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "PATCH",
                                "OPTIONS"
                        )
                        .allowedHeaders("*")
                        .exposedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}