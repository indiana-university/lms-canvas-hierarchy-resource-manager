package edu.iu.uits.lms.hierarchyresourcemanager.services;

/*-
 * #%L
 * lms-lti-hierarchyresourcemanager
 * %%
 * Copyright (C) 2015 - 2023 Indiana University
 * %%
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the Indiana University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 * #L%
 */

import edu.iu.uits.lms.common.test.CommonTestUtils;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.CourseTemplateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.config.SecurityConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.rest.HierarchyResourceManagerRestController;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.iuonly.repository.FileStorageRepository;
import edu.iu.uits.lms.iuonly.repository.HierarchyResourceRepository;
import edu.iu.uits.lms.iuonly.services.AuthorizedUserService;
import edu.iu.uits.lms.lti.config.TestUtils;
import edu.iu.uits.lms.lti.repository.DefaultInstructorRoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Collection;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = HierarchyResourceManagerRestController.class, properties = {"oauth.tokenprovider.url=http://foo", "lms.swagger.cors.origin=asdf", "lms.js.cors.origin=http://www.someurl.com"})
@ContextConfiguration(classes = {HierarchyResourceManagerRestController.class, SecurityConfig.class, ToolConfig.class})
@Slf4j
@ActiveProfiles("swagger")
public class CorsTest {

   public static String COURSE_ID_TST = "1234";

   @Autowired
   private MockMvc mvc;

   @MockitoBean
   private AuthorizedUserService authorizedUserService;

   @MockitoBean
   private HierarchyResourceRepository hierarchyResourceRepository;

   @MockitoBean
   private FileStorageRepository fileStorageRepository;

   @MockitoBean
   private NodeManagerService hierarchyResourceService;

   @MockitoBean
   private CourseTemplateMessageSender courseTemplateMessageSender;

   @MockitoBean
   private DefaultInstructorRoleRepository defaultInstructorRoleRepository;

   @MockitoBean
   private ClientRegistrationRepository clientRegistrationRepository;

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
