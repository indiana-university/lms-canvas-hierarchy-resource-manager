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
import ConfirmationModal from 'components/ConfirmationModal'
import InlineError from 'components/InlineError'
import axios from 'axios'
import { get, isEmpty } from 'lodash';

class SelectedTemplate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deleteData: {},
            defaultData: {},
            templateForEdit: null,
            validation: {},
            inputKey: Date.now()
        }

        this.handleEditTemplateModalOpen.bind(this)
        this.handleEditTemplateModalSave.bind(this)

        this.handleModalDelete.bind(this)
        this.handleDeleteDialogOpen.bind(this)

        this.handleModalDefault.bind(this)
        this.handleDefaultModalOpen.bind(this)

        this.handleModalCancel.bind(this)
        this.handleMoreClick.bind(this)
    }

    handleEditTemplateModalSave = () => {
        var elements = document.getElementById('editTemplateForm').elements
        var templateId = elements['editTemplateId'].value;

        var fileInput = elements['editTemplateFileInput'].files;

        const formData = new FormData();
        formData.append('nodeName', this.props.selectedNode);
        formData.append('displayName', elements['editDisplayName'].value);
        formData.append('contactName', elements['editContactName'].value);
        formData.append('contactUsername', elements['editContactUsername'].value);
        formData.append('sourceCourseId', elements['editSourceCourseId'].value);
        formData.append('sponsor', elements['editSponsor'].value);
        formData.append('ccUrl', elements['editCcUrl'].value);
        formData.append('description', elements['editDescription'].value);
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

//        //Can't check the results from formData here as it turns an undefined result into the string "undefined"
//        if (_.isEmpty(fileInput)) {
//            validationPassed = false;
//            validation['templateFileInput'] = {variant: 'danger', note: 'Please upload a file'};
//        }

        if (validationPassed) {
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }

            axios.post(`/app/tool/template/${templateId}/update`, formData, config)
                .then(response => response.data)
                .then((data) => {
                    resetForm("editTemplateForm");
                    this.dialogSaved("The template " + data.displayName + " has been updated in the " + this.props.selectedNode + " account.");
                    this.props.refreshHandler();

                    const editDialog = document.querySelector('[data-rvt-dialog="edit-template-dialog"]');
                    editDialog.close();

                    this.focusOnAlert();
                })
                .catch((error) => {
                    if (error.response.status == 413) {
                        validation['templateFileInput'] = {note: 'Template file is too large and cannot be processed by the server'};
                    } else {
                        validation['templateFileInput'] = {note: 'There was an unknown error while processing your file upload'};
                    }
                    this.setState({validation: validation})
                })
        } else {
            this.setState({validation: validation})

            // move focus to the first invalid form element
            var invalidInputs = $("input[aria-invalid='true']");
            if (invalidInputs.length > 0) {
                invalidInputs.first().focus();
            }
        }
    }

    dialogSaved = (notificationText) => {
        this.props.notificationHandler({display: true, text: notificationText})
        this.setState({validation: {}, inputKey: Date.now(), templateForEdit: null})
    }

    focusOnAlert() {
        var notification = document.querySelector('.rvt-alert');
        if (notification) {
            notification.focus();
        }
    }

    lookupTemplate = (templateId) => {
        return this.props.nodeListInfo.find((template) => {
            return template.id === parseInt(templateId);
        });
    }

    handleModalOpening = (triggerId, dialogId) => {
       // since multiple buttons trigger the same modal, we have to remove the data-rvt-dialog-trigger attribute
       // from all buttons except the one clicked to ensure rivet focuses on the correct button when the
       // modal is cancelled
       var triggerButtons = $('button[data-rvt-dialog-trigger="' + dialogId + '"]');
       triggerButtons.removeAttr("data-rvt-dialog-trigger");

       // add it back to the trigger
       $("#" + triggerId).attr('data-rvt-dialog-trigger', dialogId);

       // move focus to the modal title
       var dialogHeading = $('[data-rvt-dialog="' + dialogId + '"]').find("h1.rvt-dialog__title").first();
       dialogHeading.focus();
    }

    handleEditTemplateModalOpen = (event) => {
        var templateId = event.target.getAttribute("data-id");
        var templateForEdit = this.lookupTemplate(templateId);

        const triggerId = "edit-" + templateId;
        const dialogId = "edit-template-dialog";

        this.handleModalOpening(triggerId, dialogId);

        this.setState({templateForEdit: templateForEdit, validation: {}})
    }

    handleDeleteDialogOpen = () => {
        const templateId = event.target.getAttribute("data-id");
        var templateForDelete = this.lookupTemplate(templateId);

        const triggerId = "delete-" + templateId;
        const dialogId = "delete-template-dialog"

        this.handleModalOpening(triggerId, dialogId);

        this.setState({deleteData: {templateId: templateId, displayName: templateForDelete.displayName,
                nodeName: this.props.selectedNode, isdefault: templateForDelete.defaultTemplate}})
    }

    handleModalDelete = () => {
        const formData = new FormData();
        formData.append('templateId', this.state.deleteData.templateId);

        axios.post("/app/tool/template/delete", formData)
            .then(response => response.data)
            .then((data) => {
                this.setState({deleteData: {}})
                this.props.notificationHandler({display: true, text: "The template was deleted from the " + this.props.selectedNode + " account."})
                this.props.refreshHandler();

                const deleteDialog = document.querySelector('[data-rvt-dialog="delete-template-dialog"]');
                deleteDialog.close();

                this.focusOnAlert();
            })
    }

    handleDefaultModalOpen = () => {
        const templateId = event.target.getAttribute("data-id");
        var templateForDefaultChanges = this.lookupTemplate(templateId);

        const triggerId = "default-" + templateId;
        const dialogId = "change-default-dialog";

        this.handleModalOpening(triggerId, dialogId);

        const nodehasdefault = event.target.getAttribute("data-nodehasdefault");
        this.setState({defaultData: {templateId: templateId, displayName: templateForDefaultChanges.displayName,
                nodeName: this.props.selectedNode, disabling: templateForDefaultChanges.defaultTemplate, nodehasdefault: nodehasdefault}})
    }

    handleModalDefault = () => {
        const formData = new FormData();
        formData.append('templateId', this.state.defaultData.templateId);
        formData.append('enableDefault', !this.state.defaultData.disabling);
        axios.post("/app/tool/template/defaultchange", formData)
            .then(response => response.data)
            .then((data) => {
                this.setState({defaultData: {}})
                this.props.notificationHandler({display: true, text: "Default settings were updated."})
                this.props.refreshHandler();

                const defaultDialog = document.querySelector('[data-rvt-dialog="change-default-dialog"]');
                defaultDialog.close();

                this.focusOnAlert();
            })
    }

    handleModalCancel = () => {
        this.setState({deleteData: {}, defaultData: {}, templateForEdit: null, validation: {}, inputKey: Date.now()})
    }

    handleMoreClick = (event) => {
        // Get the td that this button controls
        var target_td = document.getElementById(event.target.getAttribute('aria-controls'));
        var target_span = event.target.getElementsByTagName('span')[0];

        // Toggle
        if (target_td.hasAttribute('hidden')) {
            target_td.removeAttribute('hidden');
            event.target.setAttribute('aria-expanded', 'true');
            target_span.innerHTML = 'Less Details';
        } else {
            target_td.setAttribute('hidden', null);
            event.target.setAttribute('aria-expanded', 'false');
            target_span.innerHTML = 'More Details';
        }
    }

    render() {
        const nodeHasDefault = this.props.nodeListInfo.some(t => t.defaultTemplate)
        const templates = this.props.nodeListInfo.map((templateModel) => (
            <Template key={templateModel.id} nodeName={this.props.selectedNode} templateData={templateModel}
                handleEditTemplateModalOpen={this.handleEditTemplateModalOpen}
                handleDeleteDialogOpen={this.handleDeleteDialogOpen}
                handleDefaultModalOpen={this.handleDefaultModalOpen} handleMoreClick={this.handleMoreClick}
                nodeHasDefault={nodeHasDefault} />
        ))

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

        let editModal =
            <ConfirmationModal handleConfirm={this.handleEditTemplateModalSave} dialogId="edit-template"
                title="Edit Template" onDismiss={() => this.handleModalCancel("edit-" + this.state.templateForEdit?.id)} yesLabel="Submit" noLabel="Cancel">
                <form id="editTemplateForm">
                    <input type="hidden" id="editTemplateId" key={`templateId_${this.state.inputKey}`} defaultValue={this.state.templateForEdit?.id} />

                    <label for="editDisplayName" className="rvt-label rvt-ts-16 rvt-m-top-sm">Display Name (required)</label>
                    <input key={`displayName_${this.state.inputKey}`} id="editDisplayName" type="text" className="rvt-text-input"
                        defaultValue={this.state.templateForEdit?.displayName} {...displayNameProps} />
                    {displayNameAlert}

                    <label for="editSponsor" className="rvt-label rvt-ts-16 rvt-m-top-sm">Sponsor (required)</label>
                    <input key={`sponsor_${this.state.inputKey}`} id="editSponsor" type="text" className="rvt-text-input"
                        defaultValue={this.state.templateForEdit?.sponsor} {...sponsorProps} />
                    {sponsorAlert}

                    <label for="editContactName" className="rvt-label rvt-ts-16 rvt-m-top-sm">Contact Name (required)</label>
                    <input key={`contactName_${this.state.inputKey}`} id="editContactName" type="text" className="rvt-text-input"
                        defaultValue={this.state.templateForEdit?.contactName} {...contactNameProps} />
                    {contactNameAlert}

                    <label for="editContactUsername" className="rvt-label rvt-ts-16 rvt-m-top-sm">Contact Username (required)</label>
                    <input key={`contactUsername_${this.state.inputKey}`} id="editContactUsername" type="text" className="rvt-text-input"
                        defaultValue={this.state.templateForEdit?.contactUsername} {...contactUsernameProps} />
                    {contactUsernameAlert}

                    <label for="editSourceCourseId" className="rvt-label rvt-ts-16 rvt-m-top-sm">Source Course ID (required)</label>
                    <input key={`sourceCourseId_${this.state.inputKey}`} id="editSourceCourseId" type="text" className="rvt-text-input"
                        defaultValue={this.state.templateForEdit?.sourceCourseId} {...sourceCourseIdProps} />
                    {sourceCourseIdAlert}

                    <label for="editCcUrl" className="rvt-label rvt-ts-16 rvt-m-top-sm">Preview URL (optional)</label>
                    <input key={`ccUrl_${this.state.inputKey}`} id="editCcUrl" type="text" className="rvt-text-input"
                        defaultValue={this.state.templateForEdit?.canvasCommonsUrl} />

                    <label for="editDescription" className="rvt-label rvt-ts-16 rvt-m-top-sm">Description (required)</label>
                    <textarea key={`description_${this.state.inputKey}`} id="editDescription" className="rvt-textarea"
                        defaultValue={this.state.templateForEdit?.description} {...descriptionProps} />
                    {descriptionAlert}

                    <div className="rvt-file rvt-m-top-md" data-rvt-file-input="editTemplateFileInput" key={`file_${this.state.inputKey}`} >
                      <input type="file" data-rvt-file-input-button="editTemplateFileInput" id="editTemplateFileInput"
                        aria-describedby="edit-file-description" />
                      <label for="editTemplateFileInput" className="rvt-button">
                        <span>Upload a file</span>
                        <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="M2 1h8.414L14 4.586V15H2V1Zm2 2v10h8V7.5H7.5V3H4Zm5.5 0v2.5H12v-.086L9.586 3H9.5Z"></path></svg>
                      </label>
                      <div className="rvt-file__preview" data-rvt-file-input-preview="editTemplateFileInput" id="edit-file-description">
                        No file selected
                      </div>
                    </div>
                </form>
            </ConfirmationModal>

        return (
            <div>
                <table id="templateTable" className="rvt-table">
                    <caption className="rvt-sr-only">Templates for the selected node</caption>
                    <thead>
                        <tr className="rvt-vertical-center">
                            <th scope="col" className="tableColumnWidthOverride">Display Name</th>
                            <th scope="col" className="tableColumnWidthOverride">File Name</th>
                            <th scope="col" className="defaultColumnWidthOverride">Default</th>
                            <th scope="col">Actions</th>
                            <th scope="col">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates}
                    </tbody>
                </table>

                <div>
                    {editModal}
                </div>

                <ConfirmationModal handleConfirm={this.handleModalDelete} dialogId="delete-template"
                    title="Delete Template" onDismiss={() => this.handleModalCancel("delete-" + this.state.deleteData.templateId)}
                    yesLabel="Delete" noLabel="Cancel" loadingText="Deleting template">
                    <DeleteModalText deleteData={this.state.deleteData} />
                </ConfirmationModal>

                <ConfirmationModal handleConfirm={this.handleModalDefault}
                    title="Change Default Status"
                    onDismiss={() => this.handleModalCancel("default-" + this.state.defaultData.templateId)}
                    dialogId="change-default" loadingText="Changing default status">
                    <DefaultModalText defaultData={this.state.defaultData} />
                </ConfirmationModal>
            </div>
        )
    }

    componentDidMount() {
        var table = document.getElementById('templateTable');

        // wire up responsive headers (displayed visually since column headers are now visually hidden)
        var headers = table.querySelectorAll('th');
        var cells = table.querySelectorAll('td');
        cells.forEach(function(cell, i) {
            var header_index = i%headers.length;
            var title = document.createElement('span');
            title.setAttribute('aria-hidden', 'true')
            title.classList.add('responsive-cell-header');
            title.innerText = headers[header_index].textContent + ": ";
            cell.prepend(title);
        });
    }
}

function CanvasCommonsUrl(props) {
    if (props.url != null && props.url.trim().length > 0) {
        return (
            <a href={props.url} target="_blank" rel="noopener noreferrer">{props.url}</a>
        )
    } else {
        return "No URL available";
    }
}

function Template(props) {
    if (props.templateData != null) {
        return (
            <tr id={"row-" + props.templateData.id} className="rvt-vertical-center">
                <th scope="row" className="tableColumnWidthOverride">{props.templateData.displayName}</th>
                <td className="tableColumnWidthOverride"><a href={props.templateData.fileUrl} className="rvt-link-bold">{props.templateData.fileName}</a></td>
                <td className="defaultColumnWidthOverride">{props.templateData.defaultTemplate ? 'Yes' : 'No'}</td>
                <td>
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-right-sm"
                            data-id={props.templateData.id} id={"edit-" + props.templateData.id}
                            data-rvt-dialog-trigger="edit-template-dialog" onClick={props.handleEditTemplateModalOpen}>
                        Edit <span className="rvt-sr-only">{props.templateData.displayName}</span>
                    </button>
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-right-sm"
                        data-id={props.templateData.id} id={"delete-" + props.templateData.id}
                        onClick={props.handleDeleteDialogOpen}  data-rvt-dialog-trigger="delete-template-dialog">
                        Delete <span className="rvt-sr-only">{props.templateData.displayName}</span>
                    </button>
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-right-sm"
                        onClick={props.handleDefaultModalOpen} data-id={props.templateData.id} data-nodehasdefault={props.nodeHasDefault}
                        id={"default-" + props.templateData.id} data-rvt-dialog-trigger="change-default-dialog">
                        <span>{props.templateData.defaultTemplate ? 'Disable Default' : 'Enable Default'}</span>
                        <span className="rvt-sr-only"> for {props.templateData.displayName}</span>
                    </button>
                    <button type="button" className="rvt-button rvt-button--secondary" onClick={props.handleMoreClick}
                            aria-expanded="false" aria-controls={props.templateData.id}>
                        <span>More Details </span>
                        <span className="rvt-sr-only"> for {props.templateData.displayName}</span>
                    </button>
                </td>
                <td role="cell" id={props.templateData.id} hidden>
                    <dl className="detailsflex -rvt-m-top-md">
                        <dt>Sponsor</dt>
                        <dd>{props.templateData.sponsor}</dd>
                        <dt>Contact Name</dt>
                        <dd>{props.templateData.contactName}</dd>
                        <dt>Contact Username</dt>
                        <dd>{props.templateData.contactUsername}</dd>
                        <dt>Source Course ID</dt>
                        <dd>{props.templateData.sourceCourseId}</dd>
                        <dt>Preview URL</dt>
                        <dd><CanvasCommonsUrl url={props.templateData.canvasCommonsUrl} /></dd>
                        <dt>Description</dt>
                        <dd>{props.templateData.description}</dd>
                    </dl>
                </td>
            </tr>
        )
    } else {
        return null;
    }
}

function DefaultModalText(props) {
    var bonusDefaultText = null
    var defaultInfoText = null
    if (props.defaultData.disabling) {
        defaultInfoText = <p>Are you sure you wish to disable the default status for <span className="rvt-text-bold">{props.defaultData.displayName}</span> for the <span className="rvt-text-bold">{props.defaultData.nodeName}</span> account?</p>
    } else {
        defaultInfoText = <p>Are you sure you wish to set the template <span className="rvt-text-bold">{props.defaultData.displayName}</span> to default for the <span className="rvt-text-bold">{props.defaultData.nodeName}</span> account?</p>
        if (props.defaultData.nodehasdefault == "true") {
            bonusDefaultText = <p>Setting this as default will remove the default status from another template for this node.</p>
        }
    }
    return (
        <div tabindex="-1" id={"default-instr-" + props.defaultData.templateId}>
            {defaultInfoText}
            {bonusDefaultText}
        </div>
    )
    
}

function DeleteModalText(props) {
    var bonusDeleteText = null

    if (props.deleteData.isdefault) {
        bonusDeleteText = <p>Deleting this template will also remove the default template for this node.</p>
    }
    return (
        <div tabindex="-1" id={"delete-instr-" + props.deleteData.templateId}>
            <p>
                Are you sure you wish to delete the template <span className="rvt-text-bold">{props.deleteData.displayName}</span> from the <span className="rvt-text-bold">{props.deleteData.nodeName}</span> account?
            </p>
            {bonusDeleteText}
        </div>
    )
}

function resetForm(formId) {
    var theForm = document.getElementById(formId);
    theForm.reset();
}

export default SelectedTemplate
