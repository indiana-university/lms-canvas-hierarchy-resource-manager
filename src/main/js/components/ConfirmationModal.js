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

class ConfirmationModal extends React.Component {

    constructor(props) {
        super(props);
    }
    
    // the edit/delete/default template modals aren't mounted until they are triggered
    componentDidMount() {  
        // rivet-react modals do not handle focus
        // manually set the focus on opening
        this.setFocus(this.props.isOpen, this.props.focusId);      
    }
    
    // the new template modal is mounted immediately so we need to look for update
    componentDidUpdate() {  
        // rivet-react modals do not handle focus
        // manually set the focus on opening
        this.setFocus(this.props.isOpen, this.props.focusId);       
    }
    
    setFocus(isOpen, focusId) {
        if (isOpen) {
            var focusId = document.getElementById(focusId);
            if (focusId) {
                focusId.focus();
            }
        }     
    }

    render() {
        let yesButton = <Button key="yes" onClick={this.props.handleConfirm}>{this.props.yesLabel}</Button>
        let noButton = <Button key="no" onClick={this.props.onDismiss} modifier="secondary">{this.props.noLabel}</Button>
        if (this.props.showLoading) {
            yesButton = (
                <Button key="yes" onClick={this.props.handleConfirm} aria-busy="true" disabled variant="loading">
                    <span class="rvt-button__content">{this.props.yesLabel}</span>
                    <div class="rvt-loader rvt-loader--xs" aria-label="Content loading"></div>
                </Button>
            )
    
            noButton = (
                <Button key="no" onClick={this.props.onDismiss} modifier="secondary" aria-busy="true" disabled variant="loading">
                    <span class="rvt-button__content">{this.props.noLabel}</span>
                    <div class="rvt-loader rvt-loader--xs" aria-label="Content loading"></div>
                </Button>
            )
        }

        return (
            <Modal title={this.props.title} isOpen={this.props.isOpen} onDismiss={this.props.onDismiss}>
                <ModalBody>
                    {this.props.children}
                </ModalBody>
                <ModalControls>
                    {yesButton}
                    {noButton}
                </ModalControls>
            </Modal>
        )
    }
}

// Set defaults that can be overridden
ConfirmationModal.defaultProps = {
    yesLabel: "Yes",
    noLabel: "No",
    showLoading: false
}

export default ConfirmationModal
