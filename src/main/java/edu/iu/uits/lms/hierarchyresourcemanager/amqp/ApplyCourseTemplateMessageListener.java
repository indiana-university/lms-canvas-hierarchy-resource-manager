package edu.iu.uits.lms.hierarchyresourcemanager.amqp;

import edu.iu.uits.lms.hierarchyresourcemanager.handler.ApplyCourseTemplateMessageHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@RabbitListener(queues = "${hierarchyresourcemanager.applyCourseTemplateQueueName}")
@Component
@Profile("!batch")
@Slf4j
public class ApplyCourseTemplateMessageListener {
    @Autowired
    ApplyCourseTemplateMessageHandler applyCourseTemplateMessageHandler;

    @RabbitHandler
    public void receive(ApplyCourseTemplateMessage message) {
        log.info("Received <{}>", message);

        // do the message stuff!
        applyCourseTemplateMessageHandler.handleMessage(message);
    }
}
