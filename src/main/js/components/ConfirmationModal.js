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