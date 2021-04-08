package rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.ContentMigrationStatusUpdateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import edu.iu.uits.lms.hierarchyresourcemanager.rest.CourseTemplatingSpringRestWebservice;
import edu.iu.uits.lms.hierarchyresourcemanager.services.CourseTemplatingService;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.View;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class CourseTemplatingSpringRestWebserviceTest {

   @Autowired
   @InjectMocks
   private CourseTemplatingSpringRestWebservice courseTemplatingSpringRestWebservice;

   @Autowired
   @Mock
   private CourseTemplatingService courseTemplatingService;

   @Autowired
   @Mock
   private ContentMigrationStatusUpdateMessageSender contentMigrationStatusUpdateMessageSender;

   private MockMvc mockMvc;

   @Mock
   private View view;

   private static TemplatedCourse TC1 = new TemplatedCourse("cID1", "sisID1", "tID1", TemplatedCourse.STATUS.COMPLETE);
   private static TemplatedCourse TC2 = new TemplatedCourse("cID2", "sisID2", "tID1", TemplatedCourse.STATUS.COMPLETE);
   private static TemplatedCourse TC3 = new TemplatedCourse("cID3", "sisID3", "tID2", TemplatedCourse.STATUS.PENDING);
   private static TemplatedCourse TC4 = new TemplatedCourse("cID4", "sisID4", "tID2", TemplatedCourse.STATUS.COMPLETE);
   private static TemplatedCourse TC5 = new TemplatedCourse("cID5", null, "tID2", TemplatedCourse.STATUS.ERROR);

   @Before
   public void setup() {
      MockitoAnnotations.initMocks(this);
      mockMvc = MockMvcBuilders.standaloneSetup(courseTemplatingSpringRestWebservice)
            .setSingleView(view)
            .build();
   }

   private void testCalls(CourseTemplatingSpringRestWebservice.RequestModel rm, List<TemplatedCourse> expectedResults) throws Exception {
      ResultActions mockMvcAction = mockMvc.perform(MockMvcRequestBuilders.post("/rest/coursetemplate/find")
            .contentType(MediaType.APPLICATION_JSON_UTF8)
            .content(convertObjectToJsonBytes(rm)));
      mockMvcAction.andExpect(MockMvcResultMatchers.status().isOk());
      mockMvcAction.andExpect(MockMvcResultMatchers.content().bytes(convertObjectToJsonBytes(expectedResults)));
   }

   @Test
   public void testGetNone() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel();
      testCalls(rm, Collections.emptyList());
   }

   @Test
   public void testGetBoth() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel(TC1.getSisCourseId(), TC1.getTermId(), null);
      Mockito.when(courseTemplatingService.getTemplatedCourses(TC1.getTermId(), TC1.getSisCourseId(), null)).thenReturn(Collections.singletonList(TC1));
      testCalls(rm, Collections.singletonList(TC1));
   }

   @Test
   public void testGetTerm() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel(null, TC3.getTermId(), null);
      Mockito.when(courseTemplatingService.getTemplatedCourses(TC3.getTermId(), null, null)).thenReturn(Arrays.asList(TC3, TC4, TC5));
      testCalls(rm, Arrays.asList(TC3, TC4, TC5));
   }

   @Test
   public void testGetCourse() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel(TC5.getSisCourseId(), null, null);

      Mockito.when(courseTemplatingService.getTemplatedCourses(null, TC5.getSisCourseId(), null)).thenReturn(Collections.singletonList(TC5));
      testCalls(rm, Collections.singletonList(TC5));
   }

   @Test
   public void testTriggerUpdateLive() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel();
      ResultActions mockMvcAction = mockMvc.perform(MockMvcRequestBuilders.post("/rest/coursetemplate/update/live")
            .contentType(MediaType.APPLICATION_JSON_UTF8)
            .content(convertObjectToJsonBytes(rm)));
      mockMvcAction.andExpect(MockMvcResultMatchers.status().isOk());
      mockMvcAction.andExpect(MockMvcResultMatchers.content().string("done"));
   }

   @Test
   public void testTriggerUpdateQueue() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel();
      ResultActions mockMvcAction = mockMvc.perform(MockMvcRequestBuilders.post("/rest/coursetemplate/update/queue")
            .contentType(MediaType.APPLICATION_JSON_UTF8)
            .content(convertObjectToJsonBytes(rm)));
      mockMvcAction.andExpect(MockMvcResultMatchers.status().isOk());
      mockMvcAction.andExpect(MockMvcResultMatchers.content().string("queued"));
   }

   @Test
   public void testTriggerUpdateError() throws Exception {
      CourseTemplatingSpringRestWebservice.RequestModel rm = new CourseTemplatingSpringRestWebservice.RequestModel();
      ResultActions mockMvcAction = mockMvc.perform(MockMvcRequestBuilders.post("/rest/coursetemplate/update/foo")
            .contentType(MediaType.APPLICATION_JSON_UTF8)
            .content(convertObjectToJsonBytes(rm)));
      mockMvcAction.andExpect(MockMvcResultMatchers.status().isNotFound());
      mockMvcAction.andExpect(MockMvcResultMatchers.content().string("error"));
   }

   /**
    * Serialize an object into a byte array
    * @param object Object to serialize
    * @return Serialized results
    * @throws IOException If error with the ObjectMapper
    */
   private static byte[] convertObjectToJsonBytes(Object object) throws IOException {
      ObjectMapper mapper = new ObjectMapper();
      return mapper.writeValueAsBytes(object);
   }
}
