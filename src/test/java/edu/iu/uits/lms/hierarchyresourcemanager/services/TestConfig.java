package edu.iu.uits.lms.hierarchyresourcemanager.services;

import edu.iu.uits.lms.hierarchyresourcemanager.repository.UserRepository;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;

@TestConfiguration
public class TestConfig {
    @MockBean
    private UserRepository userRepository = null;
}
