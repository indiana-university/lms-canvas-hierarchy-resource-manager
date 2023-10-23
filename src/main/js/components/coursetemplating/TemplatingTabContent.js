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
import Select from 'react-select'
import SelectedTemplate from 'components/coursetemplating/SelectedTemplate'
import ConfirmationModal from 'components/ConfirmationModal'
import InlineError from 'components/InlineError'
import Loading from 'components/Loading.js'
import axios from 'axios'
import { isEmpty } from 'lodash';

class TemplatingTabContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedNode: "",
            nodeListInfo: [],
            fileUploadDisabled: true,
            loading: false,
            validation: {},
            fileInputKey: Date.now(),
            disableModalButtons: false
        }

        this.handleHierarchyOptionChange.bind(this)
        this.handleNewTemplateModalOpen.bind(this)
        this.handleNewTemplateModalSave.bind(this)
        this.handleNewTemplateModalCancel.bind(this)
        this.handleRefresh.bind(this)
    }

    handleHierarchyOptionChange = (selectedOption) => {
      var stateVal = ""
      if (selectedOption) {
          stateVal = selectedOption.value;
          this.setState({loading: true});
          this.nodeDataLookup(stateVal);
      } else {
          this.setState({selectedNode: ""});
      }
    }

    /**
     * Called by subcomponents when they want to trigger a data refresh on the currently selected node
     * (usually following some edit/delete operation)
     **/
    handleRefresh = () => {
        this.nodeDataLookup(this.state.selectedNode);
    }

    nodeDataLookup = (nodeValue) => {
        axios.get(`/app/tool/template/nodes/${nodeValue}`)
            .then(response => response.data)
            .then((data) => {
                this.setState({nodeListInfo: data, selectedNode: nodeValue, loading: false})
            })
    }

    handleNewTemplateModalOpen = () => {
        resetForm("newTemplateForm");

        // move focus to the dialog heading
        var dialogHeading = $("h1.rvt-dialog__title").first();
        dialogHeading.focus();
    }

    handleNewTemplateModalCancel = () => {
        resetForm("newTemplateForm");
        this.setState({validation: {}, fileInputKey: Date.now()})
    }

    handleNewTemplateModalSave = () => {
        var elements = document.getElementById('newTemplateForm').elements

        var fileInput = elements['newTemplateFileInput'].files;

        const formData = new FormData();
        formData.append('nodeName', this.state.selectedNode);
        formData.append('displayName', elements['newDisplayName'].value);
        formData.append('contactName', elements['newContactName'].value);
        formData.append('contactUsername', elements['newContactUsername'].value);
        formData.append('sourceCourseId', elements['newSourceCourseId'].value);
        formData.append('sponsor', elements['newSponsor'].value);
        formData.append('ccUrl', elements['newCcUrl'].value);
        formData.append('description', elements['newDescription'].value);
        formData.append('templateFileInput', fileInput[0]);

        var validationPassed = true;
        var validation = {};

        if (isEmpty(formData.get('displayName'))) {
            validationPassed = false;
            validation['displayName'] = {note: <React.Fragment><strong>Display Name</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('contactName'))) {
            validationPassed = false;
            validation['contactName'] = {note: <React.Fragment><strong>Contact Name</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('contactUsername'))) {
            validationPassed = false;
            validation['contactUsername'] = {note: <React.Fragment><strong>Contact Username</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('sourceCourseId'))) {
            validationPassed = false;
            validation['sourceCourseId'] = {note: <React.Fragment><strong>Source Course ID</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('sponsor'))) {
            validationPassed = false;
            validation['sponsor'] = {note: <React.Fragment><strong>Sponsor</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('description'))) {
            validationPassed = false;
            validation['description'] = {note: <React.Fragment><strong>Description</strong> is required</React.Fragment>};
        }

        //Can't check the results from formData here as it turns an undefined result into the string "undefined"
        if (_.isEmpty(fileInput)) {
            validationPassed = false;
            validation['templateFileInput'] = {note: 'Please upload a file'};
        }

        if (validationPassed) {
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            this.setState({disableModalButtons: true})
            axios.post("/app/tool/template/submit", formData, config)
                .then(response => response.data)
                .then((data) => {
                    resetForm("newTemplateForm");
                    this.dialogSaved("The template " + data.displayName + " has been associated with the " + this.state.selectedNode + " account.");
                    this.nodeDataLookup(this.state.selectedNode);

                    const newTemplateDialog = document.querySelector('[data-rvt-dialog="new-template-dialog"]')
                    newTemplateDialog.close();
                })
                .catch((error) => {
                    if (error.response.status == 413) {
                        validation['templateFileInput'] = {note: 'Template file is too large and cannot be processed by the server'};
                    } else {
                        validation['templateFileInput'] = {note: 'There was an unknown error while processing your file upload'};
                    }
                    this.setState({validation: validation, disableModalButtons: false})
                })
        } else {
            this.setState({validation: validation})
        }
    }

  dialogSaved = (notificationText) => {
        this.props.notificationHandler({display: true, text: notificationText})
        this.setState({validation: {}, fileInputKey: Date.now(), disableModalButtons: false})
    }

  render() {
    let fileAlert = null
    let fileAttributes = {'aria-required': 'true'}
    if (this.state.validation.templateFileInput) {
        fileAlert = <InlineError errorId="missingFileAlert" message={this.state.validation.templateFileInput.note}></InlineError>
        fileAttributes = {'aria-required': 'true', 'aria-describedby': 'missingFileAlert', 'aria-invalid': true}
    }

    let displayNameAlert = null
    let displayNameProps = {};
    if (this.state.validation.displayName) {
        displayNameAlert = <InlineError errorId="displayNameError" message={this.state.validation.displayName.note}></InlineError>
        displayNameProps = {'aria-describedby': 'displayNameError', 'aria-invalid': "true"};
    }

    let sponsorAlert = null
    let sponsorProps = {};
    if (this.state.validation.sponsor) {
        sponsorAlert = <InlineError errorId="sponsorError" message={this.state.validation.sponsor.note}></InlineError>
        sponsorProps = {'aria-describedby': 'sponsorError', 'aria-invalid': "true"};
    }

    let contactNameAlert = null
    let contactNameProps = {};
    if (this.state.validation.contactName) {
        contactNameAlert = <InlineError errorId="contactNameError" message={this.state.validation.contactName.note}></InlineError>
        contactNameProps = {'aria-describedby': 'contactNameError', 'aria-invalid': "true"};
    }

    let contactUsernameAlert = null
    let contactUsernameProps = {};
    if (this.state.validation.contactUsername) {
        contactUsernameAlert = <InlineError errorId="contactUsernameError" message={this.state.validation.contactUsername.note}></InlineError>
        contactUsernameProps = {'aria-describedby': 'contactUsernameError', 'aria-invalid': "true"};
    }

    let sourceCourseIdAlert = null
    let sourceCourseIdProps = {};
    if (this.state.validation.sourceCourseId) {
        sourceCourseIdAlert = <InlineError errorId="sourceCourseIdError" message={this.state.validation.sourceCourseId.note}></InlineError>
        sourceCourseIdProps = {'aria-describedby': 'sourceCourseIdError', 'aria-invalid': "true"};
    }

    let descriptionAlert = null
    let descriptionProps = {};
    if (this.state.validation.description) {
        descriptionAlert = <InlineError errorId="descriptionError" message={this.state.validation.description.note}></InlineError>
        descriptionProps = {'aria-describedby': 'descriptionError', 'aria-invalid': "true"};
    }

  return (
        <div>
            <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Manage templates</span>
            <label id="nodeSelectCourseTemplate" className="rvt-label rvt-ts-16">Node</label>
            <div className="rvt-m-bottom-md">
                <Select options={this.props.hierarchy} isSearchable={true} isClearable={true} placeholder="Select Node" className="node-select"
                    onChange={this.handleHierarchyOptionChange} classNamePrefix="node-rivet" aria-labelledby="nodeSelectCourseTemplate" />
            </div>

            <button id="addNewTemplate" className="rvt-button rvt-button--secondary rvt-m-bottom-sm" onClick={this.handleNewTemplateModalOpen}
                disabled={!this.state.selectedNode} aria-disabled={!this.state.selectedNode} data-rvt-dialog-trigger="new-template-dialog">
                New Template
            </button>

            <Loading loading={this.state.loading} />
            <NodeTable selectedNode={this.state.selectedNode} nodeListInfo={this.state.nodeListInfo}
                    notificationHandler={this.props.notificationHandler} refreshHandler={this.handleRefresh}/>

            {/* this container below is important. React will give a rendering error without it */}
            <div>
                <ConfirmationModal isOpen={this.state.saveNewTemplateModalOpen} handleConfirm={this.handleNewTemplateModalSave}
                    title="New Template" onDismiss={this.handleNewTemplateModalCancel} yesLabel="Submit" noLabel="Cancel"
                    loadingText="Saving template" dialogId="new-template">
                    <form id="newTemplateForm">
                        <label for="newDisplayName" className="rvt-label rvt-ts-16">Display Name (required)</label>
                        <input id="newDisplayName" type="text" className="rvt-text-input" {...displayNameProps} />
                        {displayNameAlert}

                        <label for="newSponsor" className="rvt-label rvt-ts-16 rvt-m-top-sm">Sponsor (required)</label>
                        <input id="newSponsor" type="text" className="rvt-text-input" {...sponsorProps} />
                        {sponsorAlert}

                        <label for="newContactName" className="rvt-label rvt-ts-16 rvt-m-top-sm">Contact Name (required)</label>
                        <input id="newContactName" type="text" className="rvt-text-input" {...contactNameProps} />
                        {contactNameAlert}

                        <label for="newContactUsername" className="rvt-label rvt-ts-16 rvt-m-top-sm">Contact Username (required)</label>
                        <input id="newContactUsername" type="text" className="rvt-text-input" {...contactUsernameProps} />
                        {contactUsernameAlert}

                        <label for="newSourceCourseId" className="rvt-label rvt-ts-16 rvt-m-top-sm">Source Course ID (required)</label>
                        <input id="newSourceCourseId" type="text" className="rvt-text-input" {...sourceCourseIdProps} />
                        {sourceCourseIdAlert}

                        <label for="newCcUrl" className="rvt-label rvt-ts-16 rvt-m-top-sm">Preview URL (optional)</label>
                        <input id="newCcUrl" type="text" className="rvt-text-input" />

                        <label for="newDescription" className="rvt-label rvt-ts-16 rvt-m-top-sm">Description (required)</label>
                        <textarea id="newDescription" className="rvt-textarea" {...descriptionProps} />
                        {descriptionAlert}

                        <div className="rvt-file rvt-m-top-sm" data-rvt-file-input="newTemplateFileInput">
                          <input type="file" data-rvt-file-input-button="newTemplateFileInput" id="newTemplateFileInput" aria-describedby="new-file-description"
                              {...fileAttributes} key={this.state.fileInputKey} />
                          <label for="newTemplateFileInput" className="rvt-button">
                            <span>Upload a file</span>
                            <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="M2 1h8.414L14 4.586V15H2V1Zm2 2v10h8V7.5H7.5V3H4Zm5.5 0v2.5H12v-.086L9.586 3H9.5Z"></path></svg>
                          </label>
                          <div className="rvt-file__preview" data-rvt-file-input-preview="newTemplateFileInput" id="new-file-description" key={this.state.fileInputKey}>
                            No file selected
                          </div>
                        </div>
                        {fileAlert}
                    </form>
                </ConfirmationModal>
            </div>
        </div>
      );
    }
}

function NodeTable(props) {
//alert(JSON.stringify(props, null, 4));
          if (!props.selectedNode) {
              return "";
          } else if (props.nodeListInfo != null && props.nodeListInfo.length > 0) {
              return <SelectedTemplate nodeListInfo={props.nodeListInfo} selectedNode={props.selectedNode}
                                        notificationHandler={props.notificationHandler}
                                        refreshHandler={props.refreshHandler}
                                        key={"templates-" + props.nodeListInfo.length} />;
            {/*This key is important because it forces a re-mount otherwise the modal triggers on any new templates won't work}*/}
          }
          return <p>No templates for selected node</p>;

      }

function resetForm(formId) {
    var theForm = document.getElementById(formId);
    theForm.reset();
}

export default TemplatingTabContent
