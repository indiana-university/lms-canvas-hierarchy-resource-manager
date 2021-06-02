import React from 'react'
import {Modal, ModalBody, ModalControls, Button} from "rivet-react"

const ConfirmationModal = (props) => {

    const handleConfirm = () => {
        props.handleConfirm();
    };

    let yesButton = <Button key="yes" onClick={handleConfirm.bind(this)}>{props.yesLabel}</Button>
    let noButton = <Button key="no" onClick={props.onDismiss} modifier="secondary">{props.noLabel}</Button>
    if (props.showLoading) {
        yesButton = (
            <Button key="yes" onClick={handleConfirm.bind(this)} aria-busy="true" disabled variant="loading">
                <span class="rvt-button__content">{props.yesLabel}</span>
                <div class="rvt-loader rvt-loader--xs" aria-label="Content loading"></div>
            </Button>
        )

        noButton = (
            <Button key="no" onClick={props.onDismiss} modifier="secondary" aria-busy="true" disabled variant="loading">
                <span class="rvt-button__content">{props.noLabel}</span>
                <div class="rvt-loader rvt-loader--xs" aria-label="Content loading"></div>
            </Button>
        )
    }

    return (
        <Modal title={props.title} isOpen={props.isOpen} onDismiss={props.onDismiss}>
            <ModalBody>
                {props.children}
            </ModalBody>
            <ModalControls>
                {yesButton}
                {noButton}
            </ModalControls>
        </Modal>
    )
}

// Set defaults that can be overridden
ConfirmationModal.defaultProps = {
    yesLabel: "Yes",
    noLabel: "No",
    showLoading: false
}

export default ConfirmationModal