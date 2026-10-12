package com.clientflow.customer;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String name;
    @NotBlank private String company;
    @Email @NotBlank private String email;
    private String phone;
    private String industry;
    private String status = "Active";

    public Customer() {}
    public Customer(String name, String company, String email, String phone, String industry, String status) {
        this.name=name; this.company=company; this.email=email; this.phone=phone;
        this.industry=industry; this.status=status;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name=name; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company=company; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email=email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone=phone; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry=industry; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status=status; }
}
