import React from 'react'
import {Modal, ModalBody, ModalControls, Button} from "rivet-react"

const ConfirmationModal = (props) => {

    const handleConfirm = () => {
        props.handleConfirm();
    };

    return (
        <Modal title={props.title} isOpen={props.isOpen} onDismiss={props.onDismiss}>
            <ModalBody>
                {props.children}
            </ModalBody>
            <ModalControls>
                <Button key="yes" onClick={handleConfirm.bind(this)}>{props.yesLabel}</Button>
                <Button key="no" onClick={props.onDismiss} modifier="secondary">{props.noLabel}</Button>
            </ModalControls>
        </Modal>
    )
}

// Set defaults that can be overridden
ConfirmationModal.defaultProps = {
    yesLabel: "Yes",
    noLabel: "No"
}

export default ConfirmationModal