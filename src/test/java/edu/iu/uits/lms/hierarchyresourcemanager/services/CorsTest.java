package edu.iu.uits.lms.hierarchyresourcemanager.services;

import edu.iu.uits.lms.common.test.CommonTestUtils;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.CourseTemplateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.UserRepository;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.lti.config.TestUtils;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Collection;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(properties = {"oauth.tokenprovider.url=http://foo", "lms.swagger.cors.origin=asdf", "lms.js.cors.origin=http://www.someurl.com"})
@Import(ToolConfig.class)
@Slf4j
@ActiveProfiles("swagger")
public class CorsTest {

   public static String COURSE_ID_TST = "1234";

   @Autowired
   private MockMvc mvc;

   @MockBean
   private NodeHierarchyRealtimeService nodeHierarchyRealtimeService;

   @MockBean
   private UserRepository userRepository;

   @MockBean
   private NodeManagerService hierarchyResourceService;

   @MockBean
   private CourseTemplateMessageSender courseTemplateMessageSender;

   public static String DISPLAY_NAME = "Foobar";
   public static String DESCRIPTION = "DESCRIPTION";
   public static long HR_ID = 1L;

   @BeforeEach
   public void setup() throws HierarchyResourceException {
      HierarchyResource resource = new HierarchyResource();
      resource.setId(HR_ID);
      resource.setDescription(DESCRIPTION);
      resource.setDisplayName(DISPLAY_NAME);
      when(hierarchyResourceService.getClosestDefaultTemplateForCanvasCourse(COURSE_ID_TST)).thenReturn(resource);
   }

   @Test
   public void restCheckCors() throws Exception {
      //This is not a secured endpoint so should be successful
      SecurityContextHolder.getContext().setAuthentication(null);
      mvc.perform(get("/rest/hrm/canvasCourseId/{canvasCourseId}/node", COURSE_ID_TST)
                  .header(HttpHeaders.USER_AGENT, CommonTestUtils.defaultUseragent())
                  .header(HttpHeaders.ORIGIN, "http://www.someurl.com")
                  .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.displayName").value(DISPLAY_NAME))
            .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(DESCRIPTION))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(HR_ID))
            .andExpect(MockMvcResultMatchers.header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://www.someurl.com"));
   }

   @Test
   public void restCheckCorsNoOrigin() throws Exception {
      //This is not a secured endpoint so should be successful
      SecurityContextHolder.getContext().setAuthentication(null);
      mvc.perform(get("/rest/hrm/canvasCourseId/{canvasCourseId}/node", COURSE_ID_TST)
                  .header(HttpHeaders.USER_AGENT, CommonTestUtils.defaultUseragent())
                  .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.displayName").value(DISPLAY_NAME))
            .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(DESCRIPTION))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(HR_ID))
            .andExpect(MockMvcResultMatchers.header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
   }

   @Test
   public void restCheckCorsOptions() throws Exception {
      //This is not a secured endpoint so should be successful
      SecurityContextHolder.getContext().setAuthentication(null);
      mvc.perform(options("/rest/hrm/canvasCourseId/{canvasCourseId}/node", COURSE_ID_TST)
                  .header(HttpHeaders.USER_AGENT, CommonTestUtils.defaultUseragent())
                  .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());
   }

   @Test
   public void restCheckCors2() throws Exception {
      Jwt jwt = TestUtils.createJwtToken("asdf");

      Collection<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("SCOPE_lms:rest", "ROLE_LMS_REST_ADMINS");
      JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities);

      mvc.perform(get("/rest/hrm/canvasCourseId/{canvasCourseId}", COURSE_ID_TST)
                  .header(HttpHeaders.USER_AGENT, CommonTestUtils.defaultUseragent())
                  .header(HttpHeaders.ORIGIN, "http://www.someurl.com")
                  .contentType(MediaType.APPLICATION_JSON)
                  .with(authentication(token)))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.displayName").value(DISPLAY_NAME))
            .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(DESCRIPTION))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(HR_ID))
            .andExpect(MockMvcResultMatchers.header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
   }

   @Test
   public void restCheckCors2NoOrigin() throws Exception {
      Jwt jwt = TestUtils.createJwtToken("asdf");

      Collection<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("SCOPE_lms:rest", "ROLE_LMS_REST_ADMINS");
      JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities);

      mvc.perform(get("/rest/hrm/canvasCourseId/{canvasCourseId}", COURSE_ID_TST)
                  .header(HttpHeaders.USER_AGENT, CommonTestUtils.defaultUseragent())
                  .contentType(MediaType.APPLICATION_JSON)
                  .with(authentication(token)))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.displayName").value(DISPLAY_NAME))
            .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(DESCRIPTION))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(HR_ID))
            .andExpect(MockMvcResultMatchers.header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
   }

   @Test
   public void restCheckCors2Options() throws Exception {
      Jwt jwt = TestUtils.createJwtToken("asdf");

      Collection<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("SCOPE_lms:rest", "ROLE_LMS_REST_ADMINS");
      JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities);

      mvc.perform(options("/rest/hrm/canvasCourseId/{canvasCourseId}", COURSE_ID_TST)
                  .header(HttpHeaders.USER_AGENT, CommonTestUtils.defaultUseragent())
                  .header(HttpHeaders.ORIGIN, "http://www.someurl.com")
                  .contentType(MediaType.APPLICATION_JSON)
                  .with(authentication(token)))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
   }

}
