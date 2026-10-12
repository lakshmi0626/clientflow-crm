package com.clientflow.task;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Entity
@Table(name = "follow_up_tasks")
public class FollowUpTask {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String title;
    private String customerName;
    private String assignee;
    private LocalDate dueDate;
    private String priority = "Medium";
    private String status = "Pending";

    public FollowUpTask() {}
    public FollowUpTask(String title, String customerName, String assignee, LocalDate dueDate, String priority, String status) {
        this.title=title; this.customerName=customerName; this.assignee=assignee;
        this.dueDate=dueDate; this.priority=priority; this.status=status;
    }
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title=title; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName=customerName; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee=assignee; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate=dueDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority=priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status=status; }
}
