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
import React, { Component } from 'react'

import { groupBy, kebabCase, sortBy } from 'lodash';

import axios from 'axios';
import 'rivet-collapsible/dist/css/rivet-collapsible.min.css';
import Collapsible from 'rivet-collapsible/dist/js/rivet-collapsible.min.js';
import './ApplyTemplate.css';
import Loading from 'components/Loading.js';
import ConfirmationModal from 'components/ConfirmationModal.js';
import RvtSvg from 'components/RvtSvg'

class ApplyTemplate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodeHierarchy: [],
            coursePublished: true,
            loading: true,
            modalData: {},
            notificationDisplay: false
        }

        this.handlePreviewClick.bind(this)
        this.handleApplyClick.bind(this)
        this.handleModalCancel.bind(this)
        this.handleModalApply.bind(this)
    }

    /**
     * Call off to the REST endpoints to load data
     */
    componentDidMount(){
      var self = this;
      axios.get(`/app/tool/hierarchy/${courseId}`).then(response => {
            var wrapper = response.data;
            this.setState({
              nodeHierarchy: wrapper.templates,
              coursePublished: wrapper.coursePublished,
              loading: false
            });
          });

      Collapsible.init();
    }

    handlePreviewClick(event) {
        var url = event.target.value;
        window.open(url);
    }

    handleApplyClick = (event) => {
        const templateId = event.target.getAttribute("data-template-id");
        const templateName = event.target.getAttribute("data-template-name");
        const nodeName = event.target.getAttribute("data-node-name");
        const triggerId = "apply-" + templateId;

        // move focus to the subheading
        $("#dialog-focus").focus();

        // When the rivet dialog closes, it always is the last event.  So when we try to manually move
        // the focus on cancel, it gets overridden when the modal closes (the first instance of data-rvt-dialog-trigger always gets focus).
        // To combat this, we remove the trigger from every button except the one that was just clicked. We trick rivet so it
        // returns focus to the correct button

        // remove the data-rvt-dialog-trigger from all buttons
        var triggerButtons = $('button[data-rvt-dialog-trigger="apply-template-dialog"]');
        triggerButtons.removeAttr("data-rvt-dialog-trigger");

        // add it back to the trigger
        $("#" + triggerId).attr('data-rvt-dialog-trigger', 'apply-template-dialog');

        this.setState({modalData: {templateId: templateId, templateName: templateName, nodeName: nodeName}})
    }

    handleModalCancel() {
        this.setState({modalData: {}})
    }

    handleModalApply = () => {
        axios.post(`/app/tool/template/apply/${courseId}/${this.state.modalData.templateId}`)
            .then(response => response.data)
            .then((data) => {

                const applyTemplateDialog = document.querySelector('[data-rvt-dialog="apply-template-dialog"]');
                applyTemplateDialog.close();

                this.dialogSaved();

                const notificationText = "Your request to apply the template has been submitted. These changes may take some time to propagate through your Canvas course. You will need to refresh the page for the changes to appear."
                this.props.notificationHandler({display: true, text: notificationText});

            })
    }

    dialogSaved = () => {
        this.setState({notificationDisplay: true, modalData: {}})
    }

    render() {
        var stateData = this.state.nodeHierarchy;

        if (stateData.length > 0) {
            var data = groupBy(stateData, "node")
            const nodes = Object.entries(data).map(([key,value]) => (
                <Node key={key} nodeName={key} nodeData={sortBy(value, ['displayName'])} handlePreview={this.handlePreviewClick}
                        handleApply={this.handleApplyClick} coursePublished={this.state.coursePublished} />
            ))

            return (
                <React.Fragment>
                    <p>
                        The following templates are available for you to apply to your course.
                        Templates are grouped by the sponsoring unit (e.g., university, campus, school, department).
                        Some templates may be previewed by clicking the template name, though not all templates have previews.
                        When you are ready to apply a template to your course, click the corresponding <span className="rvt-text-bold">Apply Template</span> button.
                    </p>
                    <div className="rvt-accordion rvt-m-top-xs" data-rvt-accordion="template-accordion">
                        {nodes}
                    </div>

                    <ConfirmationModal handleConfirm={this.handleModalApply} title="Apply Template"
                               onDismiss={() => this.handleModalCancel()} yesLabel="Apply" noLabel="Cancel"
                               dialogId="apply-template" showLoading loadingText="Applying template">
                        <React.Fragment>
                            <div id="templateWarning">
                                <span id="dialog-focus" tabindex="-1" className="rvt-text-bold">{this.state.modalData.nodeName} - {this.state.modalData.templateName}</span>
                                <p>
                                    Please note that this action may make changes to your course navigation (including removing the IU
                                    eTexts tool from the navigation of courses that use eTexts), course settings, and/or course content.
                                    If you are uncertain about the impact this template will have on your course, you may want to consider
                                    making a copy of your course before proceeding.
                                </p>
                                <p>
                                    For more information, see <a href="https://kb.iu.edu/d/bgry" target="_blank">
                                    Apply a template to your Canvas course
                                    <RvtSvg icon="rvt-icon-link-external" classes="external-link-icon" title="Opens in new window"/>
                                    </a> in the IU Knowledge Base.
                                </p>
                            </div>
                        </React.Fragment>
                    </ConfirmationModal>
                </React.Fragment>
            )
        } else {
            return (<Loading loading={this.state.loading} />)
        }
    }
}

  function Node(props) {
    const templates = props.nodeData.map((templateModel) => (
                <Template key={templateModel.id} templateData={templateModel} handlePreview={props.handlePreview}
                        handleApply={props.handleApply} coursePublished={props.coursePublished}/>
            ))
    const nodeId = kebabCase(props.nodeName)

    return (
        <>
        <h2 className="rvt-accordion__summary">
            <button id={`${nodeId}-label`} className="rvt-accordion__toggle" data-rvt-accordion-trigger={`${nodeId}-accordion`}>
                <span className="rvt-accordion__toggle-text" id={`${nodeId}-name`}>{props.nodeName}</span>
                <span className="rvt-accordion__toggle-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <g fill="currentColor">
                        <path className="rvt-accordion__icon-bar" d="M8,15a1,1,0,0,1-1-1V2A1,1,0,0,1,9,2V14A1,1,0,0,1,8,15Z" />
                        <path d="M14,9H2A1,1,0,0,1,2,7H14a1,1,0,0,1,0,2Z" />
                      </g>
                    </svg>
                </span>
            </button>
        </h2>
        <div className="rvt-accordion__panel"
            id={`${nodeId}-accordion`} data-rvt-accordion-panel={`${nodeId}-accordion`}>
            <table id={`${nodeId}-table`}>
                <caption className="rvt-sr-only">{`${props.nodeName} templates`}</caption>
                <thead>
                <tr>
                    <th scope="col" className="nameColWidth">Template Name</th>
                    <th scope="col" className="descriptionColWidth">Description</th>
                    <th scope="col" className="defaultColWidth">Default</th>
                    <th scope="col" className="buttonColWidth">Action</th>
                </tr>
                </thead>
                <tbody>
                    {templates}
                </tbody>
            </table>
        </div>
        </>
    );
  }

  function Template(props) {
    if (props.templateData) {
        return (
            <tr>
                <th scope="row">
                    <PreviewLink templateName={props.templateData.displayName} previewUrl={props.templateData.canvasCommonsUrl} />
                </th>
                <td>{props.templateData.description}</td>
                <td>{props.templateData.defaultTemplate ? 'Yes' : 'No'}</td>
                <td>
                    <ApplyButton templateData={props.templateData} handleApply={props.handleApply} coursePublished={props.coursePublished} />
                </td>
            </tr>
        )
    } else {
        return null;
    }
  }

  function PreviewLink(props) {
    if (props.previewUrl) {
        return (
            <>
               <a href={props.previewUrl} target="_blank" rel="noopener noreferrer">
                   {props.templateName}
                   <RvtSvg icon="rvt-icon-link-external" classes="external-link-icon" title="Preview opens in new window"/>
               </a>
            </>
        )
    } else {
        return props.templateName;
    }
  }

  function ApplyButton(props) {
    return (
        <button className="rvt-button rvt-button--secondary rvt-m-right-sm" data-template-id={props.templateData.id}
            data-template-name={props.templateData.displayName} data-node-name={props.templateData.node}
            onClick={props.handleApply} disabled={props.coursePublished}
            id={"apply-" + props.templateData.id}
            data-rvt-dialog-trigger="apply-template-dialog">Apply Template <span className="rvt-sr-only">{props.templateData.displayName}</span></button>
    )
  }

export default ApplyTemplate;
