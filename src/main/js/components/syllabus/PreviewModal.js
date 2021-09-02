import React from 'react'
import {Modal, ModalBody, ModalControls, Button} from "rivet-react"

class PreviewModal extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidUpdate() {    
        if (this.props.isOpen) {
            var previewModal = document.getElementById('preview-title');
            if (previewModal) {
                previewModal.focus();
            }
        }    
    }

    render() {
        let items
        if (this.props.loading) {
            items = <div className="rvt-loader" aria-label="Content loading"></div>
        } else if (this.props.previewItems.length > 0) {
            items = this.props.previewItems.map((previewItem) => (
                <div key={previewItem.nodeName}>
                    <h2 id="preview-title" tabindex="-1">{previewItem.syllabusTitle} ({previewItem.nodeName})</h2>
                    <div dangerouslySetInnerHTML={{__html: previewItem.syllabusContent}} />
                    <br clear="all"/>
                    <hr className="rvt-p-top-xs"/>
                </div>
            ))
        } else {
            items = <p id="preview-title">No supplements apply to this course.</p>
        }
        return (
            <Modal title="Supplements Preview" isOpen={this.props.isOpen} onDismiss={this.props.onDismiss}>
                <ModalBody>
                    {items}
                </ModalBody>
                <ModalControls>
                    <Button onClick={this.props.onDismiss} modifier="secondary">Close</Button>
                </ModalControls>
            </Modal>
        )
    }

}
export default PreviewModal