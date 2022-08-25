package edu.iu.uits.lms.hierarchyresourcemanager.services;

import edu.iu.uits.lms.canvas.config.CanvasClientTestConfig;
import edu.iu.uits.lms.email.service.EmailService;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.controller.HierarchyResourceManagerController;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.UserRepository;
import edu.iu.uits.lms.iuonly.IuClientTestConfig;
import edu.iu.uits.lms.lti.LTIConstants;
import edu.iu.uits.lms.lti.service.TestUtils;
import edu.iu.uits.lms.lti.config.LtiClientTestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import uk.ac.ox.ctl.lti13.security.oauth2.client.lti.authentication.OidcAuthenticationToken;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = HierarchyResourceManagerController.class, properties = {"oauth.tokenprovider.url=http://foo"})
@Import({ToolConfig.class, CanvasClientTestConfig.class, IuClientTestConfig.class, LtiClientTestConfig.class})
public class AppLaunchSecurityTest {

   @Autowired
   private MockMvc mvc;

   @MockBean
   private EmailService emailService;

   @MockBean
   private UserRepository userRepository;

   @MockBean
   private NodeHierarchyRealtimeService nodeHierarchyRealtimeService;

   @MockBean
   private NodeManagerService nodeManagerService;

   @Test
   public void appNoAuthnLaunch() throws Exception {
      //This is a secured endpoint and should not allow access without authn
      mvc.perform(get("/app/manager")
            .header(HttpHeaders.USER_AGENT, TestUtils.defaultUseragent())
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
   }

   @Test
   public void appAuthnLaunch() throws Exception {
      OidcAuthenticationToken token = TestUtils.buildToken("userId",
              "asdf", LTIConstants.INSTRUCTOR_AUTHORITY);

      SecurityContextHolder.getContext().setAuthentication(token);

      //This is a secured endpoint and should not allow access without authn
      mvc.perform(get("/app/manager")
            .header(HttpHeaders.USER_AGENT, TestUtils.defaultUseragent())
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());
   }

   @Test
   public void randomUrlNoAuth() throws Exception {
      //This is a secured endpoint and should not allow access without authn
      mvc.perform(get("/asdf/foobar")
            .header(HttpHeaders.USER_AGENT, TestUtils.defaultUseragent())
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());
   }

   @Test
   public void randomUrlWithAuth() throws Exception {
      OidcAuthenticationToken token = edu.iu.uits.lms.lti.service.TestUtils.buildToken("userId",
              "asdf", LTIConstants.INSTRUCTOR_AUTHORITY);

      SecurityContextHolder.getContext().setAuthentication(token);

      //This is a secured endpoint and should not allow access without authn
      mvc.perform(get("/asdf/foobar")
            .header(HttpHeaders.USER_AGENT, TestUtils.defaultUseragent())
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
   }
}
