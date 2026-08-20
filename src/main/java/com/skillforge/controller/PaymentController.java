package com.skillforge.controller;

import com.skillforge.model.PaymentRequest;
import com.skillforge.model.PaymentVerifyRequest;
import com.skillforge.service.RazorpayService;

import jakarta.validation.Valid;

import org.json.JSONObject;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(
        origins = {
                "https://skillforgecourse.netlify.app",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
        },
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.PATCH,
                RequestMethod.OPTIONS
        },
        allowedHeaders = "*"
)
public class PaymentController {

    private final RazorpayService razorpayService;

    public PaymentController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    // =========================
    // CREATE RAZORPAY ORDER
    // =========================

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody PaymentRequest request) {

        try {

            JSONObject order = razorpayService.createOrder(request);

            return ResponseEntity.ok(order.toMap());

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "message",
                            "Unable to create Razorpay order",
                            "error",
                            e.getMessage()
                    ));
        }
    }

    // =========================
    // VERIFY RAZORPAY PAYMENT
    // =========================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {

        try {

            boolean valid = razorpayService.verifyPayment(
                    request.getRazorpay_order_id(),
                    request.getRazorpay_payment_id(),
                    request.getRazorpay_signature()
            );

            if (!valid) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "verified",
                                false,
                                "message",
                                "Invalid payment signature"
                        ));
            }

            String courseId =
                    request.getCourseId() == null
                            ? ""
                            : request.getCourseId();

            String accessUrl =
                    razorpayService.getCourseAccessUrl(
                            request.getRazorpay_order_id(),
                            courseId
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "verified",
                            true,

                            "message",
                            "Payment verified successfully",

                            "courseId",
                            courseId,

                            "accessUrl",
                            accessUrl
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "verified",
                            false,

                            "message",
                            "Payment verification failed",

                            "error",
                            e.getMessage()
                    ));
        }
    }

    // =========================
    // OPTIONS / CORS PREFLIGHT
    // =========================

    @RequestMapping(
            value = {"/create", "/verify"},
            method = RequestMethod.OPTIONS
    )
    public ResponseEntity<Void> options() {

        return ResponseEntity
                .ok()
                .build();
    }
}