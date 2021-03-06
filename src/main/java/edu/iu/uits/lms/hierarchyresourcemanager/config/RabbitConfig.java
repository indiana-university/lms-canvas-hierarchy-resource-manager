package edu.iu.uits.lms.hierarchyresourcemanager.config;

import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

   @Autowired
   private ToolConfig toolConfig = null;

   @Bean(name = "courseTemplateQueue")
   Queue courseTemplateQueue() {
      return new Queue(toolConfig.getCourseTemplateQueueName());
   }
}
