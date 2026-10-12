package com.clientflow.lead;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Entity
@Table(name = "leads")
public class Lead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank private String name;
    @NotBlank private String company;
    @Email @NotBlank private String email;
    private String phone;
    private String source;
    private String owner;
    private String status = "New";
    private Double dealValue = 0.0;
    private LocalDate createdAt = LocalDate.now();

    public Lead() {}

    public Lead(String name, String company, String email, String phone, String source,
                String owner, String status, Double dealValue, LocalDate createdAt) {
        this.name = name; this.company = company; this.email = email; this.phone = phone;
        this.source = source; this.owner = owner; this.status = status;
        this.dealValue = dealValue; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getDealValue() { return dealValue; }
    public void setDealValue(Double dealValue) { this.dealValue = dealValue; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}
