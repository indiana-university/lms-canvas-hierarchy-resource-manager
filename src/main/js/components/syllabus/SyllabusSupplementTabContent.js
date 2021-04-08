import React from 'react'
import Select from 'react-select'
import ConfirmationModal from 'components/ConfirmationModal'
import tinymce from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import { Input } from 'rivet-react'
import axios from 'axios'

class SyllabusSupplementTabContent extends React.Component {

    constructor(props) {
        super(props);

        this.titleInput = "supplementTitle"
        this.usernameInput = "contactUsername"
        this.emailInput = "contactEmail"

        this.state = {
            selectedNode: "",
            syllabus: {syllabusTitle: "", syllabusContent: "", contactUsername: "", contactEmail: ""},
            initialSyllabus: {syllabusTitle: "", syllabusContent: "", contactUsername: "", contactEmail: ""},
            cancelDisabled: true,
            deleteDisabled: true,
            saveDisabled: true,
            inputsDisabled: true,
            saveModalOpen: false,
            deleteModalOpen: false,
            titleLengthError: false,
            usernameLengthError: false,
            emailLengthError: false
        }

        this.handleInit.bind(this)
        this.handleHierarchyOptionChange.bind(this)
        this.handleTextInputChange.bind(this)
        this.handleEditorChange.bind(this)
        this.handleSaveDialogOpen.bind(this)
        this.handleDeleteDialogOpen.bind(this)
        this.handleModalSave.bind(this)
        this.handleModalDelete.bind(this)
        this.handleCancel.bind(this)
        this.handleModalCancel.bind(this)
        this.filePickerCallback.bind(this)
    }

    handleInit = (event) => {
        {/* This is needed so that the tinymce header doesn't get a higher z-index than the react dropdown input */}
        $(".tox-editor-header").css("zIndex", 0)
    }

  handleHierarchyOptionChange = (selectedOption) => {
      var self = this;
      var stateVal = ""
      var reset = true
      if (selectedOption) {
          stateVal = selectedOption.value;
          reset = false;
      }

      self.setState({
                   selectedNode: stateVal,
                   cancelDisabled: true,
                   deleteDisabled: true,
                   saveDisabled: true
                });

      if (reset) {
          self.setState({syllabus: {syllabusTitle: "", syllabusContent: "", contactUsername: "", contactEmail: ""},
                        initialSyllabus: {syllabusTitle: "", syllabusContent: "", contactUsername: "", contactEmail: ""},
                        inputsDisabled: true, titleLengthError: false, usernameLengthError: false, emailLengthError: false})
      } else {
          axios.get(`app/tool/syllabus/node/${stateVal}`)
              .then(response => response.data)
              .then((data) => {
                var deleteDisabled = self.state.deleteDisabled
                if (data.syllabusTitle.length > 0 || data.syllabusContent.length > 0 ||
                    data.contactUsername.length > 0 || data.contactEmail.length > 0) {
                  deleteDisabled = false;
                }
                self.setState({ initialSyllabus: this.cloneObject(data), syllabus: this.cloneObject(data),
                    deleteDisabled: deleteDisabled, inputsDisabled: false })
              })
        }
    }

    isInputValid = (input) => {
        if (!input || input.length > 255 || input.length < 1) {
            return false
        }
        return true
    }

    handleTextInputChange = (event) => {
        var inputElement = event.target.name
        var inputValue = event.target.value

        var syllabus = this.cloneObject(this.state.syllabus)
        if (inputElement === this.titleInput) {
            syllabus.syllabusTitle = inputValue
            this.state.titleLengthError = !this.isInputValid(syllabus.syllabusTitle)
        } else if (inputElement === this.usernameInput) {
            syllabus.contactUsername = inputValue
            this.state.usernameLengthError = !this.isInputValid(syllabus.contactUsername)
        } else if (inputElement === this.emailInput) {
            syllabus.contactEmail = inputValue
            this.state.emailLengthError = !this.isInputValid(syllabus.contactEmail)
        }

        this.setState({ saveDisabled: !this.canSave(syllabus, this.state.initialSyllabus),
                        cancelDisabled: this.canCancel(syllabus, this.state.initialSyllabus),
                        syllabus: syllabus})
    }

    handleEditorChange = (content) => {
        var syllabus = this.cloneObject(this.state.syllabus)
        syllabus.syllabusContent = content

        this.setState({ saveDisabled: !this.canSave(syllabus, this.state.initialSyllabus),
                        cancelDisabled: this.canCancel(syllabus, this.state.initialSyllabus),
                        syllabus: syllabus})
    }

    canSave = (syllabus, initialSyllabus) => {
        var canSave = false;
        // we can save if all forms have valid input and at least one has changed
       if (this.isInputValid(syllabus.syllabusTitle) &&
           this.isInputValid(syllabus.contactUsername) &&
           this.isInputValid(syllabus.contactEmail) &&
           syllabus.syllabusContent !== "" &&
           this.syllabusIsUpdated(syllabus, initialSyllabus)) {
             canSave = true;
       }

        return canSave;
    }

    syllabusIsUpdated(syllabus, initialSyllabus) {
        return syllabus.syllabusTitle !== initialSyllabus.syllabusTitle ||
               syllabus.contactUsername !== initialSyllabus.contactUsername ||
               syllabus.contactEmail !== initialSyllabus.contactEmail ||
               syllabus.syllabusContent !== initialSyllabus.syllabusContent;
    }

    canCancel = (syllabus, initialSyllabus) => {
        var cancelDisabled = false
        //Disable the cancel button if the fields are unchanged
        if (syllabus.syllabusTitle === initialSyllabus.syllabusTitle &&
            syllabus.syllabusContent === initialSyllabus.syllabusContent &&
            syllabus.contactUsername === initialSyllabus.contactUsername &&
            syllabus.contactEmail === initialSyllabus.contactEmail) {
            cancelDisabled = true
        }
        return cancelDisabled
    }

  handleSaveDialogOpen = () => {
    this.setState({saveModalOpen: true})
  }

  handleDeleteDialogOpen = () => {
    this.setState({deleteModalOpen: true})
  }

  handleModalCancel = () => {
    this.setState({saveModalOpen: false, deleteModalOpen: false})
  }

  handleModalSave = () => {
    const config = { headers: {'content-type': 'application/json'} }
    var inputData = {nodeName: this.state.selectedNode, syllabus: this.cloneObject(this.state.syllabus)}

    axios.post("app/tool/syllabus/submit", JSON.stringify(inputData), config)
        .then(response => response.data)
        .then((data) => {
          this.dialogSaved(data, "The syllabus supplement has been saved to the " + this.state.selectedNode + " account.",
            true, false, true);
        })
  }

  handleModalDelete = () => {
    const config = { headers: {'content-type': 'application/json'} }
    var inputData = {nodeName: this.state.selectedNode}

    axios.post("app/tool/syllabus/delete", JSON.stringify(inputData), config)
        .then(response => response.data)
        .then((data) => {
          this.dialogSaved(data, "The syllabus supplement for " + this.state.selectedNode + " has been deleted.",
            true, true, true)
        })
  }

    dialogSaved = (syllabusData, notificationText, saveDisabled, deleteDisabled, cancelDisabled) => {
        this.props.notificationHandler({display: true, text: notificationText})
        this.setState({initialSyllabus: this.cloneObject(syllabusData), syllabus: this.cloneObject(syllabusData), saveDisabled: saveDisabled,
            deleteDisabled: deleteDisabled, cancelDisabled: cancelDisabled, saveModalOpen: false, deleteModalOpen: false})
    }

    handleCancel = () => {
        this.setState({syllabus: this.cloneObject(this.state.initialSyllabus), saveDisabled: true, cancelDisabled: true,
                titleLengthError: !this.isInputValid(this.state.initialSyllabus.syllabusTitle),
                usernameLengthError: !this.isInputValid(this.state.initialSyllabus.contactUsername),
                emailLengthError: !this.isInputValid(this.state.initialSyllabus.contactEmail)})
    }

    cloneObject(input) {
        return JSON.parse(JSON.stringify(input));
    }

    filePickerCallback = (cb, value, meta) => {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        /*
          Note: In modern browsers input[type="file"] is functional without
          even adding it to the DOM, but that might not be the case in some older
          or quirky browsers like IE, so you might want to add it to the DOM
          just in case, and visually hide it. And do not forget do remove it
          once you do not need it anymore.
        */

        input.onchange = function () {
          var file = this.files[0];

          var reader = new FileReader();
          reader.onload = function () {
            /*
              Note: Now we need to register the blob in TinyMCEs image blob
              registry. In the next release this part hopefully won't be
              necessary, as we are looking to handle it internally.
            */
            var id = 'blobid' + (new Date()).getTime();
            var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
            var base64 = reader.result.split(',')[1];
            var blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);

            /* call the callback and populate the Title field with the file name */
            cb(blobInfo.blobUri(), { title: file.name });
          };
          reader.readAsDataURL(file);
        };

        input.click();
      }

render() {
    /*
        There's a shorthand for the <React.Fragment> which is just <>, but I couldn't get it to work!
        Could be related to the various babel dependencies, but I didn't have time to mess with it!
    */
    var inputProps = {}
    var noteNode = <React.Fragment>Title for syllabus supplement.</React.Fragment>
    if (this.state.titleLengthError) {
        noteNode = <React.Fragment><strong>Supplement Title</strong> needs to be provided and be 255 characters or less</React.Fragment>
        inputProps.variant = 'danger'
    }

    var contactUserProps = {}
    var contactUserNote = <React.Fragment></React.Fragment>
    if (this.state.usernameLengthError) {
        contactUserNote = <React.Fragment><strong>Supplement Contact Username</strong> must be provided</React.Fragment>
        contactUserProps.variant = 'danger'
    }

    var contactEmailProps = {}
    var contactEmailNote = <React.Fragment></React.Fragment>
    if (this.state.emailLengthError) {
        contactEmailNote = <React.Fragment><strong>Supplement Contact Email</strong> must be provided</React.Fragment>
        contactEmailProps.variant = 'danger'
    }


  return (
        <div id="syllabusTabDiv">
            <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Add, update, or delete a syllabus supplement</span>
            <label htmlFor="nodeSelectCourseTemplate">Node Select:</label>
            <div className="rvt-m-bottom-md">
                <Select options={this.props.hierarchy} id="hierNodeName" name="hierNodeName" isSearchable={true} isClearable={true} placeholder="Select Node" className="node-select"
                    onChange={this.handleHierarchyOptionChange} classNamePrefix="node-rivet"/>
            </div>

            <Input type="text" name={this.titleInput} label="Supplement Title" margin={{bottom: 'md'}}
                    disabled={this.state.inputsDisabled} value={this.state.syllabus.syllabusTitle}
                    onChange={this.handleTextInputChange} note={noteNode} {...inputProps} />

            <label htmlFor="supplementText">Supplement Text</label>

            <Editor id="supplementText" className="rvt-m-bottom-md" value={this.state.syllabus.syllabusContent}
                onEditorChange={this.handleEditorChange} onInit={this.handleInit} disabled={this.state.inputsDisabled}
                init={{ plugins: 'advlist code image link lists table',
                        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | link image table | bullist numlist outdent indent | code',
                        image_title: true,
                        automatic_uploads: true,
                        file_picker_types: 'image',
                        file_picker_callback: this.filePickerCallback}}
            />

            <Input type="text" name={this.usernameInput} label="Contact Username" margin={{top: 'md', bottom: 'md'}}
                disabled={this.state.inputsDisabled} value={this.state.syllabus.contactUsername}
                onChange={this.handleTextInputChange} note={contactUserNote} {...contactUserProps}
                maxLength="255" />

            <Input type="text" name={this.emailInput} label="Contact Email" margin={{bottom: 'md'}}
                disabled={this.state.inputsDisabled} value={this.state.syllabus.contactEmail}
                onChange={this.handleTextInputChange} note={contactEmailNote} {...contactEmailProps}
                maxLength="255" />

            <div className="rvt-button-group rvt-button-group--right rvt-m-top-sm rvt-m-bottom-sm">
                <button id="syllabusSupplementCancelButton" className="rvt-button rvt-button--secondary"
                    disabled={this.state.cancelDisabled} onClick={this.handleCancel}>Cancel</button>
                <button id="syllabusSupplementDeleteButton" className="rvt-button" onClick={this.handleDeleteDialogOpen}
                    disabled={this.state.deleteDisabled}>Delete</button>
                <button id="syllabusSupplementSaveButton" className="rvt-button" onClick={this.handleSaveDialogOpen}
                    disabled={this.state.saveDisabled}>Save</button>
            </div>

            <ConfirmationModal isOpen={this.state.saveModalOpen} handleConfirm={this.handleModalSave} title="Save Confirmation"
                    onDismiss={this.handleModalCancel}>
                <p>Are you sure you wish to save this supplement to the {this.state.selectedNode} account?</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={this.state.deleteModalOpen} handleConfirm={this.handleModalDelete} title="Delete Confirmation"
                    onDismiss={this.handleModalCancel}>
                <p>Are you sure you wish to delete this supplement from the {this.state.selectedNode} account?</p>
            </ConfirmationModal>
        </div>

      );
  }
}

export default SyllabusSupplementTabContent
