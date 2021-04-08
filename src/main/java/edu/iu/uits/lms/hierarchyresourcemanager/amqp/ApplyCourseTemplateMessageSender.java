package edu.iu.uits.lms.hierarchyresourcemanager.amqp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ApplyCourseTemplateMessageSender {
    @Autowired
    private RabbitTemplate template;

    @Autowired
    @Qualifier("applyCourseTemplateQueue")
    private Queue queue;

    public void send(ApplyCourseTemplateMessage message) {
        log.info("Sending message to queue {}", queue.getName());
        template.convertAndSend(queue.getName(), message);
    }
}
