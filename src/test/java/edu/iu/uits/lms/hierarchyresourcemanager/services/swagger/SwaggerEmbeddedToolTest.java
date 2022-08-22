package edu.iu.uits.lms.hierarchyresourcemanager.services.swagger;

import edu.iu.uits.lms.email.EmailConstants;
import edu.iu.uits.lms.hierarchyresourcemanager.WebApplication;
import edu.iu.uits.lms.hierarchyresourcemanager.config.SecurityConfig;
import edu.iu.uits.lms.lti.swagger.AbstractSwaggerEmbeddedToolTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static edu.iu.uits.lms.email.EmailConstants.EMAILREST_PROFILE;
import static edu.iu.uits.lms.iuonly.IuCustomConstants.IUCUSTOMREST_PROFILE;

@SpringBootTest(classes = {WebApplication.class, SecurityConfig.class}, properties = {"lms.rabbitmq.queue_env_suffix = test"})
@ActiveProfiles({IUCUSTOMREST_PROFILE, EMAILREST_PROFILE})
public class SwaggerEmbeddedToolTest extends AbstractSwaggerEmbeddedToolTest {

   @Override
   protected List<String> getEmbeddedSwaggerToolPaths() {
      return SwaggerTestUtil.getEmbeddedSwaggerToolPaths(super.getEmbeddedSwaggerToolPaths());
   }
}
