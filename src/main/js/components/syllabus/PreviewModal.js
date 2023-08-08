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

class PreviewModal extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidUpdate() {
        if (this.props.isOpen) {
            var previewModal = document.getElementById('preview-title');
            if (previewModal) {
                previewModal.focus();
            }
        }
    }

    render() {
        let items
        if (this.props.loading) {
            items = (
                <div className="rvt-flex rvt-justify-center rvt-p-tb-xxl">
                  <div className="rvt-loader rvt-loader--lg" role="alert" aria-label="Syllabus preview loading"></div>
                </div>
            )
        } else if (this.props.previewItems.length > 0) {
            items = this.props.previewItems.map((previewItem) => (
                <div key={previewItem.nodeName} className="syllabus-divider">
                    <h2 id="preview-title" tabindex="-1">{previewItem.syllabusTitle} ({previewItem.nodeName})</h2>
                    <div dangerouslySetInnerHTML={{__html: previewItem.syllabusContent}} />
                </div>
            ))
        } else {
            items = <p id="preview-title" tabindex="-1">No supplements apply to this course.</p>
        }
        return (
            <div class="rvt-dialog" id="preview-dialog" role="dialog" aria-labelledby="preview-dialog-title"
                data-rvt-dialog="preview-dialog"
                data-rvt-dialog-modal
                data-rvt-dialog-darken-page
                data-rvt-dialog-disable-page-interaction
                hidden>
              <header class="rvt-dialog__header">
                <h1 class="rvt-dialog__title" id="preview-dialog-title">Supplements Preview</h1>
              </header>
              <div class="rvt-dialog__body">
                {items}
              </div>
              <div class="rvt-dialog__controls">
                <button type="button" class="rvt-button rvt-button--secondary" data-rvt-dialog-close="preview-dialog" role="button">
                    <span>Close</span>
                </button>
              </div>
              <button class="rvt-button rvt-button--plain rvt-dialog__close" data-rvt-dialog-close="preview-dialog" role="button">
                <span class="rvt-sr-only">Close</span>
                <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="m3.5 2.086 4.5 4.5 4.5-4.5L13.914 3.5 9.414 8l4.5 4.5-1.414 1.414-4.5-4.5-4.5 4.5L2.086 12.5l4.5-4.5-4.5-4.5L3.5 2.086Z"></path></svg>
              </button>
            </div>
        )
    }

}
export default PreviewModal
