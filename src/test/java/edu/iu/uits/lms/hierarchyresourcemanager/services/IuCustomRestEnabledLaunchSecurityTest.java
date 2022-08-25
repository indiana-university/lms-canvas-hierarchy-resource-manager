package edu.iu.uits.lms.hierarchyresourcemanager.services;

import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.iuonly.AbstractIuCustomRestEnabledLaunchSecurityTest;
import org.springframework.context.annotation.Import;

@Import({ToolConfig.class, TestConfig.class})
public class IuCustomRestEnabledLaunchSecurityTest extends AbstractIuCustomRestEnabledLaunchSecurityTest {

}
