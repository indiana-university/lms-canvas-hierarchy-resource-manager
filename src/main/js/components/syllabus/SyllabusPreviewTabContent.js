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
import axios from 'axios'

import PreviewModal from 'components/syllabus/PreviewModal'


class SyllabusPreviewTabContent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {previewItems: [], loading: true, modalOpen: false}

        this.handlePreview.bind(this)
        this.handleModalCancel.bind(this)
        this.handleKeyPress.bind(this)
    }

    handlePreview = (event) => {
        
        var courseIdInput = document.getElementById("canvasCourseId");
        var courseId = courseIdInput.value
        
        var courseNote = document.getElementById("canvasCourseIdNote");
        var courseIdError = document.getElementById("canvasCourseIdError");
        
        if (courseId && courseId.trim().length > 0) {
            courseIdInput.classList.remove('rvt-validation-danger');
            courseIdInput.removeAttribute('aria-invalid');
            courseIdInput.setAttribute('aria-describedby', 'canvasCourseIdNote');
            courseIdError.classList.add('rvt-display-none');
            courseNote.classList.remove('rvt-display-none');
            
            this.setState({ previewItems: [], loading: true, modalOpen: true })
            axios.get(`/app/tool/syllabus/preview/${courseId}`)
                      .then(response => response.data)
                      .then((data) => {
                        this.setState({ previewItems: data, loading: false })
                      })
        } else {
            courseIdInput.classList.add('rvt-validation-danger');
            courseIdInput.setAttribute('aria-invalid', 'true');
            courseIdInput.setAttribute('aria-describedby', 'courseIdErrorNote');
            courseIdError.classList.remove('rvt-display-none');
            courseNote.classList.add('rvt-display-none');
            courseIdInput.focus();
        }
    }

    handleModalCancel(triggerId) {
        this.setState({modalOpen: false})
        // return focus to the trigger element
        var trigger = document.getElementById(triggerId);
        if (trigger) {
            trigger.focus();
        }
    }

    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.handlePreview()
        }
    }

    render() {

        return (
            <div id="syllabusPreviewTab">
                <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Preview syllabus supplement content for a specific Canvas course</span>

                <label htmlFor="canvasCourseId">Canvas Course ID (required)</label>
                <input type="text" id="canvasCourseId" aria-describedby="canvasCourseIdNote" onKeyPress={this.handleKeyPress}/>
                <small id="canvasCourseIdNote" className="rvt-m-bottom-md">Enter the Canvas Course ID to preview syllabus content</small>
                <div id="canvasCourseIdError" class="rvt-inline-alert rvt-inline-alert--danger rvt-display-none">
                    <span class="rvt-inline-alert__icon">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                            <g fill="currentColor">
                                <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM8,14a6,6,0,1,1,6-6A6,6,0,0,1,8,14Z" />
                                <path d="M10.83,5.17a1,1,0,0,0-1.41,0L8,6.59,6.59,5.17A1,1,0,0,0,5.17,6.59L6.59,8,5.17,9.41a1,1,0,1,0,1.41,1.41L8,9.41l1.41,1.41a1,1,0,0,0,1.41-1.41L9.41,8l1.41-1.41A1,1,0,0,0,10.83,5.17Z"/>
                            </g>
                        </svg>
                    </span>
                    <span class="rvt-inline-alert__message" id="courseIdErrorNote">
                        <strong>Canvas Course ID</strong> is required.
                    </span>
                </div>

                <div className="rvt-button-group rvt-button-group--right rvt-m-top-sm rvt-m-bottom-sm">
                    <button id="previewButton" className="rvt-button" onClick={this.handlePreview}>Preview</button>
                </div>

                <PreviewModal loading={this.state.loading} isOpen={this.state.modalOpen} onDismiss={() => this.handleModalCancel("previewButton")}
                    previewItems={this.state.previewItems} />
            </div>
        )
    }
}

export default SyllabusPreviewTabContent
