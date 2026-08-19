package com.skillforge.service;

import com.razorpay.Order;
import com.razorpay.RazorpayException;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.skillforge.model.PaymentRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    public JSONObject createOrder(PaymentRequest request) throws Exception {
        validateKeys();

        BigDecimal amount = request.getTotalAmount().setScale(2, RoundingMode.HALF_UP);
        long amountInPaise = amount.movePointRight(2).longValueExact();

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "SF-" + System.currentTimeMillis());

        if (request.getCartItems() != null && !request.getCartItems().isEmpty()) {
            PaymentRequest.CartItem item = request.getCartItems().get(0);
            JSONObject notes = new JSONObject();
            notes.put("courseId", item.getId());
            notes.put("courseName", item.getTitle());
            options.put("notes", notes);
        }

        Order order = client.orders.create(options);
        return order.toJson();
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) throws Exception {
        validateKeys();

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", orderId);
        attributes.put("razorpay_payment_id", paymentId);
        attributes.put("razorpay_signature", signature);

        return Utils.verifyPaymentSignature(attributes, keySecret);
    }

    public String getCourseAccessUrl(String orderId, String courseId) throws Exception {
        validateKeys();
        String expectedCourseId = courseId;
        String url = courseUrl(expectedCourseId);
        if (url == null) {
            throw new IllegalArgumentException("Unknown course");
        }

        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        Order order = client.orders.fetch(orderId);
        JSONObject notes = order.toJson().optJSONObject("notes");
        String orderedCourseId = notes == null ? null : notes.optString("courseId", "");

        if (!expectedCourseId.equals(orderedCourseId)) {
            throw new IllegalArgumentException("Course does not match the Razorpay order");
        }
        return url;
    }

    private String courseUrl(String courseId) {
        return switch (courseId) {
            case "java-dsa" -> "https://drive.google.com/drive/folders/1g6l7HGTYU1CvOHqJkoTe4SMCwIl1RFGy?usp=drive_link";
            case "mern" -> "https://drive.google.com/drive/folders/1livMLYnzI8F99rgZOKZCW-Cqjir8dK6D?usp=drive_link";
            case "aiml" -> "https://drive.google.com/drive/folders/19LLmW3ADtut6Iz9u7c_kchjtjp9SqcUV?usp=drive_link";
            default -> null;
        };
    }

    private void validateKeys() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException(
                    "Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
            );
        }
    }

    public String getKeyId() {
        return keyId;
    }
}
