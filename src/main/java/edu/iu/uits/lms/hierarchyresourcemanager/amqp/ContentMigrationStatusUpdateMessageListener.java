package edu.iu.uits.lms.hierarchyresourcemanager.amqp;

import edu.iu.uits.lms.hierarchyresourcemanager.handler.ContentMigrationStatusMessageHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@RabbitListener(queues = "${hierarchyresourcemanager.contentMigrationStatusUpdateQueueName}")
@Component
@Profile("!batch")
@Slf4j
public class ContentMigrationStatusUpdateMessageListener {
    @Autowired
    ContentMigrationStatusMessageHandler contentMigrationStatusMessageHandler;

    @RabbitHandler
    public void receive(ContentMigrationStatusUpdateMessage message) {
        log.info("Received <{}>", message);

        // do the message stuff!
        contentMigrationStatusMessageHandler.handleMessage(message);
    }
}
