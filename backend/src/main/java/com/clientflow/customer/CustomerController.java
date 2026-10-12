package com.clientflow.customer;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerRepository repository;
    public CustomerController(CustomerRepository repository) { this.repository = repository; }

    @GetMapping public List<Customer> all() { return repository.findAll(); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Customer create(@Valid @RequestBody Customer customer) {
        if (repository.existsByEmailIgnoreCase(customer.getEmail())) throw new ResponseStatusException(HttpStatus.CONFLICT, "A customer with this email already exists");
        return repository.save(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @Valid @RequestBody Customer input) {
        Customer customer = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        if (repository.existsByEmailIgnoreCaseAndIdNot(input.getEmail(), id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Another customer with this email already exists");
        customer.setName(input.getName()); customer.setCompany(input.getCompany()); customer.setEmail(input.getEmail());
        customer.setPhone(input.getPhone()); customer.setIndustry(input.getIndustry()); customer.setStatus(input.getStatus());
        return repository.save(customer);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        repository.deleteById(id);
    }
}
