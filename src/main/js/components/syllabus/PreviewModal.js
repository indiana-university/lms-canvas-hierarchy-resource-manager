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
import {Modal, ModalBody, ModalControls, Button} from "rivet-react"

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
            items = <div className="rvt-loader" aria-label="Content loading"></div>
        } else if (this.props.previewItems.length > 0) {
            items = this.props.previewItems.map((previewItem) => (
                <div key={previewItem.nodeName}>
                    <h2 id="preview-title" tabindex="-1">{previewItem.syllabusTitle} ({previewItem.nodeName})</h2>
                    <div dangerouslySetInnerHTML={{__html: previewItem.syllabusContent}} />
                    <br clear="all"/>
                    <hr className="rvt-p-top-xs"/>
                </div>
            ))
        } else {
            items = <p id="preview-title" tabindex="-1">No supplements apply to this course.</p>
        }
        return (
            <Modal title="Supplements Preview" isOpen={this.props.isOpen} onDismiss={this.props.onDismiss}>
                <ModalBody>
                    {items}
                </ModalBody>
                <ModalControls>
                    <Button onClick={this.props.onDismiss} modifier="secondary">Close</Button>
                </ModalControls>
            </Modal>
        )
    }

}
export default PreviewModal
