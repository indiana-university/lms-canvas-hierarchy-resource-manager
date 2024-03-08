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

import InlineError from 'components/InlineError'
import PreviewModal from 'components/syllabus/PreviewModal'


class SyllabusPreviewTabContent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {previewItems: [], loading: true, courseIdError: false}

        this.handlePreview.bind(this)
    }

    componentDidMount() {
        // Instead of handling this preview via an onclick event on the Preview button, we need to listen for the
        // rvtDialogOpened event. Otherwise, the modal will open first, then the validation will happen. This
        // way we can validate first and then stop the opening event if needed.
        const previewDialog = document.querySelector('[data-rvt-dialog="preview-dialog"]');
        if (previewDialog) {
            previewDialog.addEventListener('rvtDialogOpened', this.handlePreview);
        }

    }

    componentWillUnmount() {
        // clean up the listener
        const previewDialog = document.querySelector('[data-rvt-dialog="preview-dialog"]');
        if (previewDialog) {
            previewDialog.removeEventListener('rvtDialogOpened', this.handlePreview);
        }
    }


    handlePreview = (event) => {
        
        var courseIdInput = document.getElementById("canvasCourseId");
        var courseId = courseIdInput.value
        
        if (courseId && courseId.trim().length > 0) {
            this.setState({ previewItems: [], loading: true, courseIdError: false })
            axios.get(`/app/tool/syllabus/preview/${courseId}`)
                      .then(response => response.data)
                      .then((data) => {
                        this.setState({ previewItems: data, loading: false })
                      })

        } else {
            this.setState({courseIdError: true})

            // focus on the first invalid input
            var invalidInputs = $("input[aria-invalid='true']");
            if (invalidInputs.length > 0) {
                invalidInputs.first().focus();
            }

            // stop the modal from opening
            event.preventDefault();
        }
    }

    render() {

        var courseIdProps = {};
        var courseIdAlert = null;

        if (this.state.courseIdError) {
            courseIdAlert = <InlineError message="Canvas Course ID is required." errorId="courseIdMsg"></InlineError>
            courseIdProps = {'aria-describedby': 'courseIdMsg', 'aria-invalid': "true"};
        }

        return (
            <div id="syllabusPreviewTab">
                <h2 className="rvt-ts-26 rvt-m-bottom-md">Preview syllabus supplement content for a specific Canvas course</h2>

                <p id="canvasCourseIdNote" className="rvt-m-bottom-md">Enter the Canvas Course ID to preview syllabus content.</p>

                <label htmlFor="canvasCourseId" className="rvt-label rvt-ts-16">Canvas Course ID (required)</label>
                <input type="text" id="canvasCourseId" className="rvt-text-input" aria-describedby="canvasCourseIdNote"
                    {...courseIdProps} />
                {courseIdAlert}

                <div className="rvt-button-group rvt-m-top-sm rvt-m-bottom-sm">
                    <button id="previewButton" className="rvt-button" data-rvt-dialog-trigger="preview-dialog">Preview</button>
                </div>

                <PreviewModal loading={this.state.loading} previewItems={this.state.previewItems} />
            </div>
        )
    }
}

export default SyllabusPreviewTabContent
