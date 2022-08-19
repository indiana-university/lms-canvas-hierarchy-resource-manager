package edu.iu.uits.lms.hierarchyresourcemanager.services.swagger;

import edu.iu.uits.lms.hierarchyresourcemanager.WebApplication;
import edu.iu.uits.lms.hierarchyresourcemanager.config.SecurityConfig;
import edu.iu.uits.lms.lti.swagger.AbstractSwaggerDisabledTest;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest(classes = {WebApplication.class, SecurityConfig.class}, properties = {"lms.rabbitmq.queue_env_suffix = test"})
public class SwaggerDisabledTest extends AbstractSwaggerDisabledTest {

   @Override
   protected List<String> getEmbeddedSwaggerToolPaths() {
      return SwaggerTestUtil.getEmbeddedSwaggerToolPaths(super.getEmbeddedSwaggerToolPaths());
   }
}