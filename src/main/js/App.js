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
import React from 'react'
import styled from 'styled-components'
import axios from 'axios'

import ApplyTemplate from 'components/coursetemplating/ApplyTemplate'
import TemplatingTabContent from 'components/coursetemplating/TemplatingTabContent'
import SyllabusSupplementTabContent from 'components/syllabus/SyllabusSupplementTabContent'
import SyllabusPreviewTabContent from 'components/syllabus/SyllabusPreviewTabContent'
import {CircleArrow as ScrollUpButton} from 'react-scroll-up-button';
import {Alert, Tabs, Tab} from "rivet-react"
import 'rivet-uits/css/rivet.min.css'

class App extends React.Component {
  /**
    * Initialization stuff
    */
  constructor() {
    super()
    // Set the x-auth-token head for all requests
    // The customId value got injected in to the react.html file and is a global variable
    axios.defaults.headers.common['X-Auth-Token'] = customId;
    axios.defaults.headers.common[csrfHeaderName] = csrfValue;

    this.state = {
        hierarchy: [],
        terms: [],
        notification: {display: false, text: ""}
    }
  }

  /**
   * Call off to the REST endpoints to load data
   * Also set a listener for cleaning up the modal after close
   */
  componentDidMount(){
  var self = this;
    axios.all([getHierarchy(), getTerms()])
        .then(axios.spread(function (hierarchy, terms) {
            self.setState({
                hierarchy: hierarchy.data,
                terms: terms.data
            });
        }))
        .catch(error => {
            alert(error);
        });
  }
  
  componentDidUpdate() {
    // add aria-describedby to the alert message so the content is read by the screenreader
    // move focus to the msg or else focus disappears on success
    if (this.state.notification.display) {
        var messageText = document.querySelector('.rvt-alert__message');
        if (messageText) {
            messageText.id = "alertMsgId";
            var alertDialog = document.querySelector('.rvt-alert');
            if (alertDialog) {
                alertDialog.setAttribute('aria-describedby', messageText.id);
            }
        }
        var notification = document.querySelector('.rvt-alert__dismiss');
        if (notification) {
            notification.focus();
        }
    }
  }

  /**
   * Render
   */
  render() {
    var title = "";
    var content = null;
    if (courseId) {
        title = "Apply Course Template";
        content = <ApplyTemplate notificationHandler={this.handleNotifications.bind(this)} />
    } else {
        title = "Canvas Node Manager";
        content = <NodeManager hierarchy={this.state.hierarchy} terms={this.state.terms} notificationHandler={this.handleNotifications.bind(this)} />
    }
    return (
        <div>
            <div className="rvt-container" id="main-container" role="main">
                <h1 className="rvt-ts-36 rvt-p-top-sm rvt-m-bottom-md">{title}</h1>

                <Alert variant="success" title="Success!" isOpen={this.state.notification.display} className="rvt-m-bottom-md"
                    onDismiss={() => this.setState({notification: {display: false}})}>
                      {this.state.notification.text}
                </Alert>

                {content}
            </div>
            <ScrollUpButton />
        </div>
    );
  }

  handleNotifications(notificationState) {
    this.setState({notification: notificationState});
  }

}

function NodeManager(props) {
    return (
        <Tabs variant="fitted">
            <Tab id="tab-templates" title="Course Templating">
                <TemplatingTabContent hierarchy={props.hierarchy} notificationHandler={props.notificationHandler} />
            </Tab>
            <Tab id="tab-supplements" title="Syllabus Supplements">
                <SyllabusSupplementTabContent hierarchy={props.hierarchy} terms={props.terms} notificationHandler={props.notificationHandler} />
            </Tab>
            <Tab id="tab-preview" title="Preview Supplements">
                <SyllabusPreviewTabContent />
            </Tab>
        </Tabs>
    )
}

  function getHierarchy() {
    return axios.get(`/app/tool/hierarchy`);
  }

  function getTerms() {
    return axios.get(`/app/tool/syllabus/terms`);
  }

export default App
