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

class ConfirmationModal extends React.Component {

    constructor(props) {
        super(props);
    }
    
    // the edit/delete/default template modals aren't mounted until they are triggered
    componentDidMount() {  
        // rivet-react modals do not handle focus
        // manually set the focus on opening
        //this.setFocus(this.props.isOpen, this.props.focusId);
    }
    
    // the new template modal is mounted immediately so we need to look for update
    componentDidUpdate() {  
        // rivet-react modals do not handle focus
        // manually set the focus on opening
        //this.setFocus(this.props.isOpen, this.props.focusId);
    }
    
    setFocus(isOpen, focusId) {
        if (isOpen) {
            var focusId = document.getElementById(focusId);
            if (focusId) {
                focusId.focus();
            }
        }     
    }

    testClick() {
            alert("I work");
        }

    render() {

        return (
            <div className="rvt-dialog" id={this.props.dialogId} role="dialog" tabindex="-1" aria-labelledby={`${this.props.dialogId}-title`}
                aria-describedby={`${this.props.dialogId}-description`}
                data-rvt-dialog={`${this.props.dialogId}-dialog`}
                data-rvt-dialog-modal
                data-rvt-dialog-darken-page
                data-rvt-dialog-disable-page-interaction
                hidden>
              <header className="rvt-dialog__header">
                <h1 className="rvt-dialog__title" id={`${this.props.dialogId}-title`}>{this.props.title}</h1>
              </header>
              <div className="rvt-dialog__body">
                <p id={`${this.props.dialogId}-description`}>{this.props.children}</p>
              </div>
              <div class="rvt-dialog__controls">
                <button key="yes" type="button" class="rvt-button" onClick={this.testClick}>
                  <span>{this.props.yesLabel}</span>
                </button>
                <button type="button" class="rvt-button rvt-button--secondary" data-rvt-dialog-close={`${this.props.dialogId}-dialog`} >
                  <span>{this.props.noLabel}</span>
                </button>
              </div>
              <button className="rvt-button rvt-button--plain rvt-dialog__close" data-rvt-dialog-close={`${this.props.dialogId}-dialog`} role="button">
                <span className="rvt-sr-only">Close</span>
                <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="m3.5 2.086 4.5 4.5 4.5-4.5L13.914 3.5 9.414 8l4.5 4.5-1.414 1.414-4.5-4.5-4.5 4.5L2.086 12.5l4.5-4.5-4.5-4.5L3.5 2.086Z"></path></svg>
              </button>
            </div>
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
