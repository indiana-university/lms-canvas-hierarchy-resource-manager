import React from 'react'
import Select from 'react-select'
import SelectedTemplate from 'components/coursetemplating/SelectedTemplate'
import ConfirmationModal from 'components/ConfirmationModal'
import Loading from 'components/Loading.js'
import {File, Form, InlineAlert, Input, Textarea} from 'rivet-react'
import axios from 'axios'
import { isEmpty } from 'lodash';

class TemplatingTabContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedNode: "",
            nodeListInfo: [],
            fileUploadDisabled: true,
            saveNewTemplateModalOpen: false,
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
        this.setState({saveNewTemplateModalOpen: true})
    }

    handleNewTemplateModalCancel = () => {
        resetForm("newTemplateForm");
        this.setState({saveNewTemplateModalOpen: false, defaultModalOpen: false, validation: {}, fileInputKey: Date.now()})
        document.getElementById('addNewTemplate').focus();
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

        if (isEmpty(formData.get('sourceCourseId'))) {
            validationPassed = false;
            validation['sourceCourseId'] = {variant: 'danger', note: <React.Fragment><strong>Source Course ID</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('sponsor'))) {
            validationPassed = false;
            validation['sponsor'] = {variant: 'danger', note: <React.Fragment><strong>Sponsor</strong> is required</React.Fragment>};
        }

        if (isEmpty(formData.get('description'))) {
            validationPassed = false;
            validation['description'] = {variant: 'danger', note: <React.Fragment><strong>Description</strong> is required</React.Fragment>};
        }

        //Can't check the results from formData here as it turns an undefined result into the string "undefined"
        if (_.isEmpty(fileInput)) {
            validationPassed = false;
            validation['templateFileInput'] = {variant: 'danger', note: 'Please upload a file'};
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
  //      console.log(inputKey)
        this.props.notificationHandler({display: true, text: notificationText})
        this.setState({saveNewTemplateModalOpen: false, validation: {}, fileInputKey: Date.now(), disableModalButtons: false})
    }

  render() {
    let fileAlert = null
    let fileAttributes = {'aria-required': 'true'}
    if (this.state.validation.templateFileInput) {
        fileAlert = <InlineAlert id="missingFileAlert" variant={this.state.validation.templateFileInput.variant}>{this.state.validation.templateFileInput.note}</InlineAlert>
        fileAttributes = {'aria-required': 'true', 'aria-describedby': 'missingFileAlert', 'aria-invalid': true}
    }

  return (
        <div>
            <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Manage templates</span>
            <label id="nodeSelectCourseTemplate">Node</label>
            <div className="rvt-m-bottom-md">
                <Select options={this.props.hierarchy} isSearchable={true} isClearable={true} placeholder="Select Node" className="node-select"
                    onChange={this.handleHierarchyOptionChange} classNamePrefix="node-rivet" aria-labelledby="nodeSelectCourseTemplate" />
            </div>

            <button id="addNewTemplate" className="rvt-button rvt-button--secondary rvt-m-bottom-sm" onClick={this.handleNewTemplateModalOpen}
                disabled={!this.state.selectedNode} aria-disabled={!this.state.selectedNode}>New Template</button>

            <Loading loading={this.state.loading} />
            <NodeTable selectedNode={this.state.selectedNode} nodeListInfo={this.state.nodeListInfo}
                    notificationHandler={this.props.notificationHandler} refreshHandler={this.handleRefresh}/>

            <ConfirmationModal isOpen={this.state.saveNewTemplateModalOpen} handleConfirm={this.handleNewTemplateModalSave}
                title="New Template" onDismiss={this.handleNewTemplateModalCancel} yesLabel="Submit" noLabel="Cancel" 
                showLoading={this.state.disableModalButtons} focusId="newDisplayName">
                <Form id="newTemplateForm">
                    <Input id="newDisplayName" type="text" label="Display Name (required)" margin={{bottom: 'sm'}}
                        {...this.state.validation.displayName} />
                    <Input id="newSponsor" type="text" label="Sponsor (required)" margin={{bottom: 'sm'}}
                        {...this.state.validation.sponsor} />
                    <Input id="newContactName" type="text" label="Contact Name (required)" margin={{bottom: 'sm'}}
                        {...this.state.validation.contactName} />
                    <Input id="newContactUsername" type="text" label="Contact Username (required)" margin={{bottom: 'sm'}}
                        {...this.state.validation.contactUsername} />
                    <Input id="newSourceCourseId" type="text" label="Source Course ID (required)" margin={{bottom: 'sm'}}
                        {...this.state.validation.sourceCourseId} />
                    <Input id="newCcUrl" type="text" label="Preview URL (optional)" margin={{bottom: 'sm'}}/>
                    <Textarea id="newDescription" label="Description (required)" margin={{bottom: 'sm'}}
                        {...this.state.validation.description} />
                    <File key={this.state.fileInputKey} id="newTemplateFileInput" margin={{bottom: 'sm'}} {...fileAttributes} />
                    {fileAlert}
                </Form>
            </ConfirmationModal>
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
                                        notificationHandler={props.notificationHandler} refreshHandler={props.refreshHandler}/>;
          }
          return <p>No templates for selected node</p>;

      }

function resetForm(formId) {
    var theForm = document.getElementById(formId);
    theForm.reset();
}

export default TemplatingTabContent
