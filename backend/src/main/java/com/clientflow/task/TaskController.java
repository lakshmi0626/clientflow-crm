package com.clientflow.task;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskRepository repository;
    public TaskController(TaskRepository repository) { this.repository = repository; }

    @GetMapping
    public List<FollowUpTask> all() { return repository.findAll(); }

    @PutMapping("/{id}")
    public FollowUpTask update(@PathVariable Long id, @Valid @RequestBody FollowUpTask input) {
        FollowUpTask task = repository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Follow-up task not found"));
        task.setTitle(input.getTitle());
        task.setCustomerName(input.getCustomerName());
        task.setAssignee(input.getAssignee());
        task.setDueDate(input.getDueDate());
        task.setPriority(input.getPriority());
        task.setStatus(input.getStatus() == null || input.getStatus().isBlank() ? "Pending" : input.getStatus());
        return repository.save(task);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Follow-up task not found");
        }
        repository.deleteById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FollowUpTask create(@Valid @RequestBody FollowUpTask task) {
        if (task.getStatus() == null || task.getStatus().isBlank()) task.setStatus("Pending");
        if (task.getPriority() == null || task.getPriority().isBlank()) task.setPriority("Medium");
        return repository.save(task);
    }
}
