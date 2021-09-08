import React from 'react'
import ConfirmationModal from 'components/ConfirmationModal'
import {File, Form, Input, Textarea} from 'rivet-react'
import axios from 'axios'
import { get, isEmpty } from 'lodash';

class SelectedTemplate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deleteModalOpen: false,
            defaultModalOpen: false,
            editTemplateModalOpen: false,
            deleteData: {},
            defaultData: {},
            templateForEdit: null,
            validation: {},
            inputKey: Date.now(),
            disableModalButtons: false
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
        formData.append('ccUrl', elements['editCcUrl'].value);
        formData.append('description', elements['editDescription'].value);
        formData.append('templateFileInput', fileInput[0]);

        var validationPassed = true;
        var validation = {};

        if (isEmpty(formData.get('displayName'))) {
            validationPassed = false;
            validation['displayName'] = {variant: 'danger', note: <React.Fragment><strong>Display Name</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('contactName'))) {
            validationPassed = false;
            validation['contactName'] = {variant: 'danger', note: <React.Fragment><strong>Contact Name</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('contactUsername'))) {
            validationPassed = false;
            validation['contactUsername'] = {variant: 'danger', note: <React.Fragment><strong>Contact Username</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('description'))) {
            validationPassed = false;
            validation['description'] = {variant: 'danger', note: <React.Fragment><strong>Description</strong> is required</React.Fragment>};
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
            this.setState({disableModalButtons: true})
            axios.post(`app/tool/template/${templateId}/update`, formData, config)
                .then(response => response.data)
                .then((data) => {
                    resetForm("editTemplateForm");
                    this.dialogSaved("The template " + data.displayName + " has been updated in the " + this.props.selectedNode + " account.");
                    this.props.refreshHandler();
                })
                .catch((error) => {
                    if (error.response.status == 413) {
                        validation['templateFileInput'] = {variant: 'danger', note: 'Template file is too large and cannot be processed by the server'};
                    } else {
                        validation['templateFileInput'] = {variant: 'danger', note: 'There was an unknown error while processing your file upload'};
                    }
                    this.setState({validation: validation, disableModalButtons: false})
                })
        } else {
            this.setState({validation: validation})
        }
    }

    dialogSaved = (notificationText) => {
        this.props.notificationHandler({display: true, text: notificationText})
        this.setState({editTemplateModalOpen: false, validation: {}, inputKey: Date.now(), templateForEdit: null, disableModalButtons: false})
    }

    lookupTemplate = (templateId) => {
        return this.props.nodeListInfo.find((template) => {
            return template.id === parseInt(templateId);
        });
    }

    handleEditTemplateModalOpen = (event) => {
        var templateId = event.target.getAttribute("data-id");
        var templateForEdit = this.lookupTemplate(templateId);
        this.setState({editTemplateModalOpen: true, templateForEdit: templateForEdit, validation: {}})
    }

    handleDeleteDialogOpen = () => {
        const templateId = event.target.getAttribute("data-id");
        var templateForDelete = this.lookupTemplate(templateId);
        this.setState({deleteModalOpen: true, deleteData: {templateId: templateId, displayName: templateForDelete.displayName,
                nodeName: this.props.selectedNode, isdefault: templateForDelete.defaultTemplate}})
    }

    handleModalDelete = () => {
        const formData = new FormData();
        formData.append('templateId', this.state.deleteData.templateId);

        axios.post("app/tool/template/delete", formData)
            .then(response => response.data)
            .then((data) => {
                this.setState({deleteModalOpen: false, deleteData: {}})    
                this.props.notificationHandler({display: true, text: "The template was deleted from the " + this.props.selectedNode + " account."})
                this.props.refreshHandler();
            })
    }

    handleDefaultModalOpen = () => {
        const templateId = event.target.getAttribute("data-id");
        var templateForDefaultChanges = this.lookupTemplate(templateId);

        const nodehasdefault = event.target.getAttribute("data-nodehasdefault");
        this.setState({defaultModalOpen: true, defaultData: {templateId: templateId, displayName: templateForDefaultChanges.displayName,
                nodeName: this.props.selectedNode, disabling: templateForDefaultChanges.defaultTemplate, nodehasdefault: nodehasdefault}})
    }

    handleModalDefault = () => {
        const formData = new FormData();
        formData.append('templateId', this.state.defaultData.templateId);
        formData.append('enableDefault', !this.state.defaultData.disabling);
        axios.post("app/tool/template/defaultchange", formData)
            .then(response => response.data)
            .then((data) => {
                this.setState({defaultModalOpen: false, defaultData: {}})
                this.props.notificationHandler({display: true, text: "Default settings were updated."})
                this.props.refreshHandler();
            })
    }

    handleModalCancel(triggerId) {
        this.setState({editTemplateModalOpen: false, deleteModalOpen: false, deleteData: {}, defaultModalOpen: false,
                defaultData: {}, templateForEdit: null, validation: {}, inputKey: Date.now()})
     
        // return focus to the trigger element
        var trigger = document.getElementById(triggerId);
        if (trigger) {
            trigger.focus();
        }
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

        let editModal;
        if (this.state.templateForEdit) {
            editModal =
                <ConfirmationModal isOpen={this.state.editTemplateModalOpen} handleConfirm={this.handleEditTemplateModalSave}
                    title="Edit Template" onDismiss={() => this.handleModalCancel("edit-" + this.state.templateForEdit.id)} yesLabel="Submit" noLabel="Cancel" 
                    showLoading={this.state.disableModalButtons} focusId="editDisplayName">
                    <Form id="editTemplateForm">
                        <Input key={`templateId_${this.state.inputKey}`} id="editTemplateId" type="hidden" defaultValue={this.state.templateForEdit.id} />
                        <Input key={`displayName_${this.state.inputKey}`} id="editDisplayName" type="text" label="Display Name (required)" margin={{bottom: 'sm'}}
                            defaultValue={this.state.templateForEdit.displayName} {...this.state.validation.displayName} />
                        <Input key={`contactName_${this.state.inputKey}`} id="editContactName" type="text" label="Contact Name (required)" margin={{bottom: 'sm'}}
                            defaultValue={this.state.templateForEdit.contactName} {...this.state.validation.contactName} />
                        <Input key={`contactUsername_${this.state.inputKey}`} id="editContactUsername" type="text" label="Contact Username (required)" margin={{bottom: 'sm'}}
                            defaultValue={this.state.templateForEdit.contactUsername} {...this.state.validation.contactUsername} />
                        <Input key={`ccUrl_${this.state.inputKey}`} id="editCcUrl" type="text" label="Canvas Commons URL (optional)" margin={{bottom: 'sm'}}
                            defaultValue={this.state.templateForEdit.canvasCommonsUrl} />
                        <Textarea key={`description_${this.state.inputKey}`} id="editDescription" label="Description (required)" margin={{bottom: 'sm'}}
                            defaultValue={this.state.templateForEdit.description} {...this.state.validation.description} />
                        <File key={`file_${this.state.inputKey}`} id="editTemplateFileInput" margin={{bottom: 'sm'}} />
                    </Form>
                </ConfirmationModal>
        }
    
        return (
            <div>
                <table id="templateTable">
                    <caption className="sr-only">Templates for the selected node</caption>
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

                {editModal}

                <ConfirmationModal isOpen={this.state.deleteModalOpen} handleConfirm={this.handleModalDelete}
                    title="Delete Template" onDismiss={() => this.handleModalCancel("delete-" + this.state.deleteData.templateId)} 
                    yesLabel="Delete" noLabel="Cancel" focusId={"delete-instr-" + this.state.deleteData.templateId}>
                    <DeleteModalText deleteData={this.state.deleteData} />
                </ConfirmationModal>

                <ConfirmationModal isOpen={this.state.defaultModalOpen} handleConfirm={this.handleModalDefault}
                    title="Change Default Status" focusId={"default-instr-" + this.state.defaultData.templateId}
                    onDismiss={() => this.handleModalCancel("default-" + this.state.defaultData.templateId)}>
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
            <a href={props.url} target="_blank">{props.url}</a>
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
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-right-sm" onClick={props.handleEditTemplateModalOpen}
                            data-id={props.templateData.id} id={"edit-" + props.templateData.id}>
                        <span className="rvt-sr-only">Edit entry</span>
                        <span>Edit</span>
                    </button>
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-right-sm rvt-m-top-sm rvt-m-top-none-xl-up"
                        onClick={props.handleDeleteDialogOpen} data-id={props.templateData.id} id={"delete-" + props.templateData.id}>
                        <span>Delete</span>
                    </button>
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-right-sm rvt-m-top-sm rvt-m-top-none-xl-up"
                        onClick={props.handleDefaultModalOpen} data-id={props.templateData.id} data-nodehasdefault={props.nodeHasDefault}
                        id={"default-" + props.templateData.id}>
                        <span>{props.templateData.defaultTemplate ? 'Disable Default' : 'Enable Default'}</span>
                    </button>
                    <button type="button" className="rvt-button rvt-button--secondary rvt-m-top-sm rvt-m-top-none-xl-up" onClick={props.handleMoreClick}
                            aria-expanded="false" aria-controls={props.templateData.id}>
                        <span>More Details</span>
                    </button>
                </td>
                <td role="cell" id={props.templateData.id} hidden>
                    <dl>
                        <div className="detailsflex">
                            <div>
                                <dt>Contact Name</dt>
                                <dd>{props.templateData.contactName}</dd>
                                <dt>Contact Username</dt>
                                <dd>{props.templateData.contactUsername}</dd>
                            </div>
                            <div className="rvt-m-left-md longdetailswidthlimit">
                                <dt>Canvas Commons URL</dt>
                                <dd><CanvasCommonsUrl url={props.templateData.canvasCommonsUrl} /></dd>
                                <dt>Description</dt>
                                <dd>{props.templateData.description}</dd>
                            </div>
                       </div>
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