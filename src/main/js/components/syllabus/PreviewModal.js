import React from 'react'
import {Modal, ModalBody, ModalControls, Button} from "rivet-react"

const PreviewModal = (props) => {

    let items
    if (props.loading) {
        items = <div className="rvt-loader" aria-label="Content loading"></div>
    } else if (props.previewItems.length > 0) {
        items = props.previewItems.map((previewItem) => (
            <div key={previewItem.nodeName}>
                <h2>{previewItem.syllabusTitle} ({previewItem.nodeName})</h2>
                <div dangerouslySetInnerHTML={{__html: previewItem.syllabusContent}} />
                <br clear="all"/>
                <hr className="rvt-p-top-xs"/>
            </div>
        ))
    } else {
        items = <p>No supplements apply to this course.</p>
    }
    return (
        <Modal title="Supplements Preview" isOpen={props.isOpen} onDismiss={props.onDismiss}>
            <ModalBody>
                {items}
            </ModalBody>
            <ModalControls>
                <Button onClick={props.onDismiss} modifier="secondary">Close</Button>
            </ModalControls>
        </Modal>
    )

}
export default PreviewModal