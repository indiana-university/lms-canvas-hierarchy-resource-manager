import React, { Component } from 'react'

import { groupBy, kebabCase, sortBy } from 'lodash';

import axios from 'axios';
import 'rivet-collapsible/dist/css/rivet-collapsible.min.css';
import Collapsible from 'rivet-collapsible/dist/js/rivet-collapsible.min.js';
import './ApplyTemplate.css';
import Loading from 'components/Loading.js';
import ConfirmationModal from 'components/ConfirmationModal.js';
import { Alert } from 'rivet-react'
import RvtSvg from 'components/RvtSvg'

class ApplyTemplate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodeHierarchy: [],
            coursePublished: true,
            loading: true,
            applyModalOpen: false,
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
      axios.get(`app/tool/hierarchy/${courseId}`).then(response => {
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

        this.setState({applyModalOpen: true, modalData: {templateId: templateId, templateName: templateName, nodeName: nodeName}})
    }

    handleModalCancel(triggerId) {
        this.setState({applyModalOpen: false, modalData: {}})
        
        // return focus to the trigger element
        var trigger = document.getElementById(triggerId);
        if (trigger) {
            trigger.focus();
        }
    }

    handleModalApply = () => {
        axios.post(`app/tool/template/apply/${courseId}/${this.state.modalData.templateId}`)
            .then(response => response.data)
            .then((data) => {
                this.dialogSaved();
            })
    }

    dialogSaved = () => {
        this.setState({notificationDisplay: true, applyModalOpen: false, modalData: {}})
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
                    <Alert variant="success" title="Success!" isOpen={this.state.notificationDisplay} className="rvt-m-bottom-md"
                                        onDismiss={() => this.setState({notificationDisplay: false})}>
                        Your request to apply the template has been submitted. These changes may take some time to propagate through your Canvas course. You will need to refresh the page for the changes to appear.
                    </Alert>
                    <p className="limitContentWidth">
                        The following templates are available for you to apply to your course.
                        Templates are grouped by the sponsoring unit (e.g., university, campus, school, department).
                        To preview a template in Canvas Commons before applying it to your course, click the "Preview" button, if available.
                        When you are ready to apply a template to your course, click the corresponding <span className="rvt-text-bold">Apply Template</span> button.
                    </p>
                    {nodes}
                    <ConfirmationModal isOpen={this.state.applyModalOpen} handleConfirm={this.handleModalApply} title="Apply Template"
                                       onDismiss={() => this.handleModalCancel("apply-" + this.state.modalData.templateId)}
                                       yesLabel="Apply" noLabel="Cancel" focusId="templateWarning">
                        <React.Fragment>
                            <div id="templateWarning" tabindex="-1">
                                <span className="rvt-text-bold">{this.state.modalData.nodeName} - {this.state.modalData.templateName}</span>
                                <p>
                                    Please note that this action may make changes to your course navigation (including removing the IU
                                    eTexts tool from the navigation of courses that use eTexts), course settings, and/or course content.
                                    If you are uncertain about the impact this template will have on your course, you may want to consider
                                    making a copy of your course before proceeding.
                                </p>
                                <p>
                                    For more information, see <a href="https://kb.iu.edu/d/bgry" target="_blank">
                                    <cite>Apply a template to your Canvas course</cite> <RvtSvg icon="rvt-icon-link-external" ariahide="true" />
                                    <span className="sr-only">Opens in new window</span></a> in the IU Knowledge Base.
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
        <div className="rvt-collapsible rvt-collapsible--panel limitContentWidth rvt-m-top-xs">
            <h2 className="rvt-collapsible__title">
                <button id={`${nodeId}-label`} data-collapsible={nodeId} aria-expanded="false">
                    <svg role="img" aria-labelledby={`${nodeId}-name`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M5.5,15a1,1,0,0,1-.77-1.64L9.2,8,4.73,2.64A1,1,0,0,1,6.27,1.36L11.13,7.2a1.25,1.25,0,0,1,0,1.61L6.27,14.64A1,1,0,0,1,5.5,15ZM9.6,8.48h0Zm0-1h0Z"></path>
                    </svg>
                    <span id={`${nodeId}-name`}>{props.nodeName}</span>
                </button>
            </h2>
            <div className="rvt-collapsible__content rvt-p-top-sm" id={nodeId} aria-hidden="true" aria-labelledby={`${nodeId}-label`}>
                <table>
                    <caption className="sr-only">{`${props.nodeName} templates`}</caption>
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
        </div>
    );
  }

  function Template(props) {
    if (props.templateData) {
        return (
            <tr>
                <th scope="row">{props.templateData.displayName}</th>
                <td>{props.templateData.description}</td>
                <td>{props.templateData.defaultTemplate ? 'Yes' : 'No'}</td>
                <td>
                    <ApplyButton templateData={props.templateData} handleApply={props.handleApply} coursePublished={props.coursePublished}/>
                    <PreviewButton url={props.templateData.canvasCommonsUrl} handlePreview={props.handlePreview} />
                </td>
            </tr>
        )
    } else {
        return null;
    }
  }

  function PreviewButton(props) {
    if (props.url) {
        return (<button className="rvt-button rvt-button--secondary rvt-m-top-sm rvt-m-top-none-lg-up" value={props.url} onClick={props.handlePreview}>Preview</button>)
    } else {
        return null;
    }
  }

  function ApplyButton(props) {
    return (
        <button className="rvt-button rvt-button--secondary rvt-m-right-sm" data-template-id={props.templateData.id}
            data-template-name={props.templateData.displayName} data-node-name={props.templateData.node}
            onClick={props.handleApply} disabled={props.coursePublished}
            id={"apply-" + props.templateData.id}>Apply Template</button>
    )
  }

export default ApplyTemplate;