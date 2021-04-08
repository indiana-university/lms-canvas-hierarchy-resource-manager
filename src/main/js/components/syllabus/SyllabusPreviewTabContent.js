import React from 'react'
import axios from 'axios'

import PreviewModal from 'components/syllabus/PreviewModal'


class SyllabusPreviewTabContent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {previewItems: [], loading: true, modalOpen: false}

        this.handlePreview.bind(this)
        this.handleModalCancel.bind(this)
        this.handleKeyPress.bind(this)
    }

    handlePreview = (event) => {
        this.setState({ previewItems: [], loading: true, modalOpen: true })
        var courseId = document.getElementById("canvasCourseId").value

        axios.get(`app/tool/syllabus/preview/${courseId}`)
                  .then(response => response.data)
                  .then((data) => {
                    this.setState({ previewItems: data, loading: false })
                  })
    }

    handleModalCancel = () => {
        this.setState({modalOpen: false})
    }

    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.handlePreview()
        }
    }

    render() {

        return (
            <div id="syllabusPreviewTab">
                <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Preview syllabus supplement content for a specific Canvas course</span>

                <label htmlFor="canvasCourseId">Canvas Course Id</label>
                <input type="text" id="canvasCourseId" aria-describedby="canvasCourseIdNote" onKeyPress={this.handleKeyPress}/>
                <small id="canvasCourseIdNote" className="rvt-display-block rvt-m-bottom-md">Enter the Canvas course id to preview syllabus content</small>

                <div className="rvt-button-group rvt-button-group--right rvt-m-top-sm rvt-m-bottom-sm">
                    <button id="previewButton" className="rvt-button" onClick={this.handlePreview}>Preview</button>
                </div>

                <PreviewModal loading={this.state.loading} isOpen={this.state.modalOpen} onDismiss={this.handleModalCancel}
                    previewItems={this.state.previewItems} />
            </div>
        )
    }
}

export default SyllabusPreviewTabContent