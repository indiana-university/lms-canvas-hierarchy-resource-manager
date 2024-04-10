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
        // move focus to the top of the modal when it opens. On closing, rivet will move focus to the preview button
        var previewModal = document.getElementById('preview-dialog-title');
        if (previewModal) {
            previewModal.focus();
        }
    }

    render() {
        let items
        let loader
        if (this.props.loading) {
            loader = (
                <div className="rvt-flex rvt-justify-center rvt-p-tb-xxl">
                  <div className="rvt-loader rvt-loader--lg"></div>
                  <span className="rvt-sr-only">Syllabus preview loading</span>
                </div>
            )
        } else if (this.props.previewItems.length > 0) {
            items = this.props.previewItems.map((previewItem) => (
                <div key={previewItem.nodeName} className="syllabus-divider">
                    <h2 id="preview-title">{previewItem.syllabusTitle} ({previewItem.nodeName})</h2>
                    <div dangerouslySetInnerHTML={{__html: previewItem.syllabusContent}} />
                </div>
            ))
        } else {
            items = <p id="preview-title" tabindex="-1">No supplements apply to this course.</p>
        }
        return (
            <div className="rvt-dialog" id="preview-dialog" role="dialog" aria-labelledby="preview-dialog-title"
                data-rvt-dialog="preview-dialog"
                data-rvt-dialog-modal
                data-rvt-dialog-darken-page
                data-rvt-dialog-disable-page-interaction
                aria-modal="true"
                hidden>
              <header className="rvt-dialog__header">
                <h1 className="rvt-dialog__title" id="preview-dialog-title" tabindex="-1">Supplements Preview</h1>
              </header>
              <div className="rvt-dialog__body">
                <div id="loading-section" aria-live="polite">
                    {loader}
                </div>
                {items}
              </div>
              <div className="rvt-dialog__controls">
                <button type="button" className="rvt-button rvt-button--secondary" data-rvt-dialog-close="preview-dialog" role="button">
                    <span>Close</span>
                </button>
              </div>
              <button className="rvt-button rvt-button--plain rvt-dialog__close" data-rvt-dialog-close="preview-dialog" role="button">
                <span className="rvt-sr-only">Close</span>
                <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="m3.5 2.086 4.5 4.5 4.5-4.5L13.914 3.5 9.414 8l4.5 4.5-1.414 1.414-4.5-4.5-4.5 4.5L2.086 12.5l4.5-4.5-4.5-4.5L3.5 2.086Z"></path></svg>
              </button>
            </div>
        )
    }

}
export default PreviewModal
