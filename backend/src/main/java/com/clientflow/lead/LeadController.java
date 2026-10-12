package com.clientflow.lead;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
public class LeadController {
    private final LeadRepository repository;
    public LeadController(LeadRepository repository) { this.repository = repository; }

    @GetMapping public List<Lead> all() { return repository.findAllByOrderByCreatedAtDesc(); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Lead create(@Valid @RequestBody Lead lead) {
        if (repository.existsByEmailIgnoreCase(lead.getEmail())) throw new ResponseStatusException(HttpStatus.CONFLICT, "A lead with this email already exists");
        if (lead.getStatus() == null || lead.getStatus().isBlank()) lead.setStatus("New");
        if (!List.of("New", "Contacted", "Negotiation", "Won", "Lost").contains(lead.getStatus())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported lead status");
        if (lead.getDealValue() == null || lead.getDealValue() < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deal value must be zero or greater");
        if (lead.getCreatedAt() == null) lead.setCreatedAt(LocalDate.now());
        return repository.save(lead);
    }

    @PutMapping("/{id}")
    public Lead update(@PathVariable Long id, @Valid @RequestBody Lead input) {
        Lead lead = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        if (repository.existsByEmailIgnoreCaseAndIdNot(input.getEmail(), id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Another lead with this email already exists");
        lead.setName(input.getName()); lead.setCompany(input.getCompany()); lead.setEmail(input.getEmail()); lead.setPhone(input.getPhone());
        lead.setSource(input.getSource()); lead.setOwner(input.getOwner()); lead.setDealValue(input.getDealValue());
        if (input.getStatus() != null && List.of("New", "Contacted", "Negotiation", "Won", "Lost").contains(input.getStatus())) lead.setStatus(input.getStatus());
        return repository.save(lead);
    }

    @PatchMapping("/{id}/status")
    public Lead updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Lead lead = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        String status = body.get("status");
        if (status == null || !List.of("New", "Contacted", "Negotiation", "Won", "Lost").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported lead status");
        lead.setStatus(status); return repository.save(lead);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found");
        repository.deleteById(id);
    }
}
