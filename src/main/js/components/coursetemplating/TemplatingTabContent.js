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
        fileAlert = <InlineError id="missingFileAlert" alertMessage={this.state.validation.templateFileInput.note}></InlineError>
        fileAttributes = {'aria-required': 'true', 'aria-describedby': 'missingFileAlert', 'aria-invalid': true}
    }

  return (
        <div>
            <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Manage templates</span>
            <label id="nodeSelectCourseTemplate" className="rvt-label rvt-ts-16">Node!</label>
            <div className="rvt-m-bottom-md">
                <Select options={this.props.hierarchy} isSearchable={true} isClearable={true} placeholder="Select Node" className="node-select"
                    onChange={this.handleHierarchyOptionChange} classNamePrefix="node-rivet" aria-labelledby="nodeSelectCourseTemplate" />
            </div>

            <button id="addNewTemplate" className="rvt-button rvt-button--secondary rvt-m-bottom-sm" onClick={this.handleNewTemplateModalOpen}
                disabled={!this.state.selectedNode} aria-disabled={!this.state.selectedNode}>New Template</button>

            <Loading loading={this.state.loading} />
            <NodeTable selectedNode={this.state.selectedNode} nodeListInfo={this.state.nodeListInfo}
                    notificationHandler={this.props.notificationHandler} refreshHandler={this.handleRefresh}/>


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

function InlineError(props) {
    return (
        <div class="rvt-inline-alert rvt-inline-alert--standalone rvt-inline-alert--danger">
          <span class="rvt-inline-alert__icon">
            <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="m8 6.586-2-2L4.586 6l2 2-2 2L6 11.414l2-2 2 2L11.414 10l-2-2 2-2L10 4.586l-2 2Z"></path><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8Z"></path></svg>
          </span>
          <span class="rvt-inline-alert__message" id="{props.id}">{props.alertMessage}</span>
        </div>
    )
}

export default TemplatingTabContent
