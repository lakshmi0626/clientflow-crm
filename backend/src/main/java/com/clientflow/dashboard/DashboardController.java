package com.clientflow.dashboard;

import com.clientflow.customer.CustomerRepository;
import com.clientflow.lead.Lead;
import com.clientflow.lead.LeadRepository;
import com.clientflow.task.TaskRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final LeadRepository leads;
    private final CustomerRepository customers;
    private final TaskRepository tasks;

    public DashboardController(LeadRepository leads, CustomerRepository customers, TaskRepository tasks) {
        this.leads = leads; this.customers = customers; this.tasks = tasks;
    }

    @GetMapping
    public Map<String, Object> summary() {
        List<Lead> all = leads.findAll();
        Map<String, Long> pipeline = all.stream().collect(Collectors.groupingBy(
            lead -> lead.getStatus() == null ? "New" : lead.getStatus(), Collectors.counting()));
        double wonValue = all.stream().filter(l -> "Won".equals(l.getStatus()))
            .map(Lead::getDealValue).filter(Objects::nonNull).mapToDouble(Double::doubleValue).sum();
        long active = all.stream().filter(l -> !List.of("Won", "Lost").contains(l.getStatus())).count();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalLeads", all.size());
        result.put("activeLeads", active);
        result.put("totalCustomers", customers.count());
        result.put("pendingTasks", tasks.findAll().stream().filter(t -> !"Completed".equals(t.getStatus())).count());
        result.put("wonRevenue", wonValue);
        result.put("pipeline", pipeline);
        result.put("recentLeads", all.stream().sorted(Comparator.comparing(Lead::getCreatedAt,
            Comparator.nullsLast(Comparator.reverseOrder()))).limit(5).toList());
        return result;
    }
}
