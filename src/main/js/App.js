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

import SuccessAlert from 'components/SuccessAlert'
import ApplyTemplate from 'components/coursetemplating/ApplyTemplate'
import TemplatingTabContent from 'components/coursetemplating/TemplatingTabContent'
import SyllabusSupplementTabContent from 'components/syllabus/SyllabusSupplementTabContent'
import SyllabusPreviewTabContent from 'components/syllabus/SyllabusPreviewTabContent'
import {CircleArrow as ScrollUpButton} from 'react-scroll-up-button';

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
    // move focus to the msg or else focus disappears on success
    if (this.state.notification.display) {
        var notification = document.querySelector('.rvt-alert');
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
            <div className="rvt-container-xl" id="main-container" role="main">
                <SuccessAlert displayAlert={this.state.notification.display} alertTitle="Success!" alertMessage={this.state.notification.text}
                    onDismiss={() => this.setState({notification: {display: false}})} />
                <h1 className="rvt-ts-36 rvt-p-top-sm rvt-m-bottom-md">{title}</h1>
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
        <div className="rvt-tabs" data-rvt-tabs="tabset-1">
          <div className="rvt-tabs__tablist" aria-label="Canvas Node Manager Options" data-rvt-tablist>
            <button className="rvt-tabs__tab" data-rvt-tab="template-tab">Course Templating</button>
            <button className="rvt-tabs__tab" data-rvt-tab="syllabus-tab">Syllabus Supplements</button>
            <button className="rvt-tabs__tab" data-rvt-tab="preview-tab">Preview Supplements</button>
          </div>
          <div className="rvt-tabs__panel" id="template-tab" data-rvt-tab-panel="template-tab" data-rvt-tab-init>
            <TemplatingTabContent hierarchy={props.hierarchy} notificationHandler={props.notificationHandler} />
          </div>
          <div className="rvt-tabs__panel" id="syllabus-tab" data-rvt-tab-panel="syllabus-tab">
            <SyllabusSupplementTabContent hierarchy={props.hierarchy} terms={props.terms} notificationHandler={props.notificationHandler} />
          </div>
          <div className="rvt-tabs__panel" id="preview-tab" data-rvt-tab-panel="preview-tab">
            <SyllabusPreviewTabContent />
          </div>
        </div>
    )
}

  function getHierarchy() {
    return axios.get(`/app/tool/hierarchy`);
  }

  function getTerms() {
    return axios.get(`/app/tool/syllabus/terms`);
  }

export default App
