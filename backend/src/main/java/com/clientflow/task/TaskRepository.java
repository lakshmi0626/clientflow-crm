package com.clientflow.task;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<FollowUpTask, Long> {}
