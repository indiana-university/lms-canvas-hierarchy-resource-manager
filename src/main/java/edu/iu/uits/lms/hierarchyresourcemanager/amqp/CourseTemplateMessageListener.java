package edu.iu.uits.lms.hierarchyresourcemanager.amqp;

import edu.iu.uits.lms.common.coursetemplates.CourseTemplateMessage;
import edu.iu.uits.lms.hierarchyresourcemanager.handler.CourseTemplateMessageHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@RabbitListener(queues = "${hierarchyresourcemanager.courseTemplateQueueName}")
@Component
@Profile("!batch")
@Slf4j
public class CourseTemplateMessageListener {
    @Autowired
    CourseTemplateMessageHandler courseTemplateMessageHandler;

    @RabbitHandler
    public void receive(CourseTemplateMessage message) {
        log.info("Received <{}>", message);

        // do the message stuff!
        courseTemplateMessageHandler.handleMessage(message);
    }
}
