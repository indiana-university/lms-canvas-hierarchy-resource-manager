package edu.iu.uits.lms.hierarchyresourcemanager.services;

import edu.iu.uits.lms.canvas.config.CanvasClientTestConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.lti.AbstractLTIRestDisabledLaunchSecurityTest;
import edu.iu.uits.lms.lti.config.LtiClientTestConfig;
import org.springframework.context.annotation.Import;

@Import({ToolConfig.class, CanvasClientTestConfig.class, LtiClientTestConfig.class, TestConfig.class})
public class LTIRestDisabledLaunchSecurityTest extends AbstractLTIRestDisabledLaunchSecurityTest {

}
