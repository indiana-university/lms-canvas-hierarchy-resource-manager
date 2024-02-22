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

        this.confirmationActions.bind(this);
        this.handleLoadingButton.bind(this);
    }

    componentDidMount() {
        /* Listen for the dialog close event */
        const dataId = '[data-rvt-dialog=\"' + this.props.dialogId + '-dialog\"]';
        const thisDialog = document.querySelector(dataId);
        if (thisDialog) {
           thisDialog.addEventListener('rvtDialogClosed', this.resetDialog.bind(this, this.props.dialogId));
        }
    }

    componentWillUnmount() {
        // clean up the event listeners
        const dataId = '[data-rvt-dialog=\"' + this.props.dialogId + '-dialog\"]';
        const thisDialog = document.querySelector(dataId);
        if (thisDialog) {
            if (this.props.showLoading) {
                thisDialog.removeEventListener('rvtDialogClosed', this.resetDialog.bind(this, this.props.dialogId));
            }
        }
    }

    confirmationActions(event, confirmationHandler, showLoading, loadingText, dialogId) {
        confirmationHandler();

        if (showLoading) {
            this.handleLoadingButton(dialogId, loadingText, event);
        }
    }

    handleLoadingButton(dialogId, loadingText, event) {
        var loadingButton = $(event.target);
        loadingButton.attr("aria-busy", true);
        loadingButton.addClass("rvt-button--loading");

        var rvtLoader = loadingButton.find('.rvt-loader').first();
        if (rvtLoader) {
            rvtLoader.removeClass("rvt-display-none");
        }

        // Screenreader-only text to notify there is some loading action happening
        var spinner = loadingButton.find('.spinner-sr-text').first();
        if (spinner) {
            if (loadingText) {
                spinner.text(loadingText);
            } else {
                spinner.text("Loading");
            }

            spinner.removeClass("rvt-display-none");
        }

        // disable the buttons in the modal
        var mainDialog = $('#' + dialogId);
        var dialogControls = mainDialog.find('.loading-btn');
        dialogControls.prop('disabled', true);
    }

    resetDialog(dialogId) {
        var yesButton = $('#' + dialogId + '-yes');
        yesButton.removeClass("rvt-button--loading");
        yesButton.removeAttr("aria-busy");

        const loader = yesButton.find(".rvt-loader");
        loader.addClass("rvt-display-none");

        var spinner = yesButton.find('.spinner-sr-text').first();
        if (spinner) {
            spinner.addClass("rvt-display-none");
        }

        // enable the buttons
        $('.loading-btn').prop('disabled', false);
    }

    render() {

        return (
            // The data-rvt-dialog-modal allows the user to close the modal by clicking outside of it. However, this
            // is causing issues with forms and properties not being reset properly in react, so don't use that attribute
            // on the dialogs
            <div className="rvt-dialog" id={`${this.props.dialogId}-dialog`} role="dialog" aria-labelledby={`${this.props.dialogId}-title`}
                aria-describedby={`${this.props.dialogId}-description`}
                data-rvt-dialog={`${this.props.dialogId}-dialog`}
                data-rvt-dialog-darken-page
                data-rvt-dialog-disable-page-interaction
                hidden>

              <h1 className="rvt-dialog__header rvt-dialog__title" id={`${this.props.dialogId}-title`} tabIndex="-1">{this.props.title}</h1>

              <div className="rvt-dialog__body">
                <div id={`${this.props.dialogId}-description`}>{this.props.children}</div>
              </div>
              <div className="rvt-dialog__controls">
                <button id={`${this.props.dialogId}-yes`} key="yes" type="button" className="rvt-button loading-btn" onClick={(event) => this.confirmationActions(event, this.props.handleConfirm, this.props.showLoading, this.props.loadingText, this.props.dialogId)}>
                  <span className="rvt-button__content">{this.props.yesLabel}</span>
                  <span className="rvt-loader rvt-loader--xs rvt-display-none"></span>
                  <p aria-live="polite"><span className="rvt-sr-only spinner-sr-text rvt-display-none">Loading</span></p>
                </button>
                <button type="button" className="rvt-button rvt-button--secondary loading-btn" data-rvt-dialog-close={`${this.props.dialogId}-dialog`} onClick={this.props.onDismiss} >
                  <span>{this.props.noLabel}</span>
                </button>
              </div>
              <button className="rvt-button rvt-button--plain rvt-dialog__close loading-btn" data-rvt-dialog-close={`${this.props.dialogId}-dialog`} role="button"
                onClick={this.props.onDismiss}>
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
