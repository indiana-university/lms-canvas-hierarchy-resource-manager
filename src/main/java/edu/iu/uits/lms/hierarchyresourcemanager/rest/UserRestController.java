package edu.iu.uits.lms.hierarchyresourcemanager.rest;

/*-
 * #%L
 * lms-lti-hierarchyresourcemanager
 * %%
 * Copyright (C) 2015 - 2022 Indiana University
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

import edu.iu.uits.lms.hierarchyresourcemanager.model.RestUser;
import edu.iu.uits.lms.hierarchyresourcemanager.model.User;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/rest/user"})
//@LmsSwaggerDocumentation
public class UserRestController {

    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/{id}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public User getUserFromId(@PathVariable Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @RequestMapping(value = "/username/{username}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public User getBatchEmailFromUsername(@PathVariable String username) {
        return userRepository.findByUsername(username);
    }

    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public List<User> getUsersAll() {
        List<User> users = (List<User>) userRepository.findAll();
        return users;
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    public User updateUser(@PathVariable Long id, @RequestBody RestUser user) {
        User updatedUser = userRepository.findById(id).orElse(null);

        if (user.getAuthorizedUser() != null) {
            updatedUser.setAuthorizedUser(user.getAuthorizedUser());
        }

        if (user.getCanvasUserId() != null) {
            updatedUser.setCanvasUserId(user.getCanvasUserId());
        }

        if (user.getDisplayName() != null) {
            updatedUser.setDisplayName(user.getDisplayName());
        }

        if (user.getUsername() != null) {
            updatedUser.setUsername(user.getUsername());
        }

        if (user.getEmail() != null) {
            updatedUser.setEmail(user.getEmail());
        }

        return userRepository.save(updatedUser);
    }

    @RequestMapping(method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public User createUser(@RequestBody RestUser user) {
        User newUser = new User();
        newUser.setAuthorizedUser(user.getAuthorizedUser());
        newUser.setCanvasUserId(user.getCanvasUserId());
        newUser.setDisplayName(user.getDisplayName());
        newUser.setUsername(user.getUsername());
        newUser.setEmail(user.getEmail());

        return userRepository.save(newUser);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "Delete success.";
    }

}
