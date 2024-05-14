package edu.iu.uits.lms.hierarchyresourcemanager.services.swagger;

import edu.iu.uits.lms.hierarchyresourcemanager.WebApplication;
import edu.iu.uits.lms.hierarchyresourcemanager.config.SecurityConfig;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;

@Import({WebApplication.class, SecurityConfig.class})
public class HrmSwaggerConfig {
   @MockBean
   private BufferingApplicationStartup bufferingApplicationStartup;

}
