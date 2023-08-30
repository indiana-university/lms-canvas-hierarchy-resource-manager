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
import ConfirmationModal from 'components/ConfirmationModal'
import InlineError from 'components/InlineError'
import tinymce from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios'

class SyllabusSupplementTabContent extends React.Component {

    constructor(props) {
        super(props);

        this.titleInput = "supplementTitle"
        this.usernameInput = "contactUsername"
        this.emailInput = "contactEmail"

        this.state = {
            selectedNode: "",
            selectedTerm: "9999",
            selectedTermName: "Default",
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
            emailLengthError: false,
            contentLengthError: false,
            nodeChange: false,
            deletionChange: false
        }

        this.handleInit.bind(this)
        this.handleHierarchyOptionChange.bind(this)
        this.handleTermOptionChange.bind(this)
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
    
    componentDidMount() {
        // unfortunately, the best we can do to identify the node input is to find the first id
        // that starts with "react-select" because a random integer is appended to the id. At this time,
        // react-select is not used anywhere else
        var nodeSelect = document.querySelector('*[id^="react-select"]');
        if (nodeSelect) {
            nodeSelect.setAttribute('aria-labelledby', 'selectNodeLabel');
        }

        // the onclick events on the buttons in the modal are never triggered (possibly a rivet issue?)
        // so we are adding the event listeners here
        const saveSupplementButton = document.getElementById("save-supplement-yes");
        if (saveSupplementButton) {
            /*saveSupplementButton.addEventListener('click', this.handleModalSave);*/
        }

        const deleteSupplementButton = document.getElementById("delete-supplement-yes");
        if (deleteSupplementButton) {
            /*deleteSupplementButton.addEventListener('click', this.handleModalDelete);*/
        }
    }

    handleInit = (event) => {
        {/* This is needed so that the tinymce header doesn't get a higher z-index than the react dropdown input */}
        $(".tox-editor-header").css("zIndex", 0)
        
        var editor = document.getElementById('supplementText_ifr');
        if (editor) {
            editor.setAttribute('aria-label', 'Supplement text (required)');
        }
    }

    handleHierarchyOptionChange = (selectedNode) => {
        var node = selectedNode ? selectedNode.value : null;
        this.lookUpNode(node, this.state.selectedTerm, this.state.selectedTermName);
    }

    handleTermOptionChange = (selectedTerm) => {
        this.lookUpNode(this.state.selectedNode, selectedTerm.value, selectedTerm.label);
    }

    // this function assumes termId will always have a value
    lookUpNode = (node, termId, termName) => {
        this.setState({
            selectedNode: node,
            selectedTerm: termId,
            selectedTermName: termName,
            cancelDisabled: true,
            deleteDisabled: true,
            saveDisabled: true,
            nodeChange: true,
            titleLengthError: false,
            usernameLengthError: false,
            emailLengthError: false,
            contentLengthError: false
        });

        this.handleContentErrorIndicator(true);

        if (node) {
            // we got a node, do the lookup!
            axios.get(`/app/tool/syllabus/node/${node}/${termId}`)
                .then(response => response.data)
                .then((data) => {
                    var deleteDisabled = this.state.deleteDisabled
                    if (data.syllabusTitle.length > 0 || data.syllabusContent.length > 0 ||
                        data.contactUsername.length > 0 || data.contactEmail.length > 0) {
                        deleteDisabled = false;
                    }

                    this.setState({ initialSyllabus: this.cloneObject(data), syllabus: this.cloneObject(data),
                    deleteDisabled: deleteDisabled, inputsDisabled: false });
                });
        } else {
            // reset all the stuff in the form
            this.setState({syllabus: {syllabusTitle: "", syllabusContent: "", contactUsername: "", contactEmail: ""},
                initialSyllabus: {syllabusTitle: "", syllabusContent: "", contactUsername: "", contactEmail: ""},
                inputsDisabled: true});
        }
    }

    isInputValid = (input) => {
        if (!input || input.length > 255 || input.length < 1) {
            return false
        }
        return true
    }
    
    isContentValid = (content) => {
        if (!content || content.length < 1) {
            return false
        } else {
            return true
        }
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
        
        if (!this.state.nodeChange && !this.state.deletionChange) {
            this.handleContentErrorIndicator(this.isContentValid(syllabus.syllabusContent));
            this.state.contentLengthError = !this.isContentValid(syllabus.syllabusContent);
        }

        this.setState({ saveDisabled: !this.canSave(syllabus, this.state.initialSyllabus),
                        cancelDisabled: this.canCancel(syllabus, this.state.initialSyllabus),
                        syllabus: syllabus, nodeChange: false, deletionChange: false})
    }
    
    // for the red outline around the content editor.
    handleContentErrorIndicator(isContentValid) {
        if (isContentValid) {
            //document.getElementById('supplementContentContainer').classList.remove('alert-danger-inline');
            var editor = document.getElementById('supplementText_ifr');
            if (editor) {
                editor.removeAttribute('aria-invalid');
            }
        } else {
            //document.getElementById('supplementContentContainer').classList.add('alert-danger-inline');
            var editor = document.getElementById('supplementText_ifr');
            if (editor) {
                editor.setAttribute('aria-invalid', 'true');
            }
        }
    }

    canSave = (syllabus, initialSyllabus) => {
        var canSave = false;
        // we can save if all forms have valid input and at least one has changed
       if (this.isInputValid(syllabus.syllabusTitle) &&
           this.isInputValid(syllabus.contactUsername) &&
           this.isInputValid(syllabus.contactEmail) &&
           this.isContentValid(syllabus.syllabusContent) &&
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

  handleModalCancel(triggerId) {
    this.setState({saveModalOpen: false, deleteModalOpen: false})
    
    // return focus to the trigger element
    var trigger = document.getElementById(triggerId);
    if (trigger) {
        trigger.focus();
    }
  }

  handleModalSave = () => {
    const config = { headers: {'content-type': 'application/json'} }
    var inputData = {nodeName: this.state.selectedNode, strm: this.state.selectedTerm, syllabus: this.cloneObject(this.state.syllabus)}

    axios.post("/app/tool/syllabus/submit", JSON.stringify(inputData), config)
        .then(response => response.data)
        .then((data) => {
          this.dialogSaved(data, "The syllabus supplement has been saved to the " + this.state.selectedNode + " account in the " + this.state.selectedTermName + " term.",
            true, false, true);
        })

    const saveDialog = document.querySelector('[data-rvt-dialog="save-supplement-dialog"]')
    saveDialog.close();
  }

  handleModalDelete = () => {
    const config = { headers: {'content-type': 'application/json'} }
    var inputData = {nodeName: this.state.selectedNode, strm: this.state.selectedTerm}
    this.state.deletionChange = true;

    axios.post("/app/tool/syllabus/delete", JSON.stringify(inputData), config)
        .then(response => response.data)
        .then((data) => {
          this.dialogSaved(data, "The syllabus supplement for " + this.state.selectedNode + " has been deleted.",
            true, true, true)
        })

    const deleteDialog = document.querySelector('[data-rvt-dialog="delete-supplement-dialog"]')
    deleteDialog.close();
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
                emailLengthError: !this.isInputValid(this.state.initialSyllabus.contactEmail),
                contentLengthError: !this.isContentValid(this.state.initialSyllabus.syllabusContent)});
                
        this.handleContentErrorIndicator(this.isContentValid(this.state.initialSyllabus.syllabusContent));
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
    var noteNode = null;
    if (this.state.titleLengthError) {
        noteNode = <InlineError message="Supplement Title is required and must be 255 characters or less." errorId="titleError"></InlineError>
        inputProps = {'aria-describedby': 'titleError', 'aria-invalid': "true"};
    }

    var contactUserProps = {}
    var contactUserNote = null
    if (this.state.usernameLengthError) {
        contactUserNote = <InlineError message="Supplement Contact Username is required." errorId="usernameError"></InlineError>
        contactUserProps = {'aria-describedby': 'usernameError', 'aria-invalid': "true"};
    }

    var contactEmailProps = {}
    var contactEmailNote = null
    if (this.state.emailLengthError) {
        contactEmailNote = <InlineError message="Supplement Contact Email is required." errorId="emailError"></InlineError>
        contactEmailProps = {'aria-describedby': 'emailError', 'aria-invalid': "true"};
    }

    var contentProps = {}
    var contentNote = null
    if (this.state.contentLengthError) {
        contentNote = <InlineError message="Supplement Text is required." errorId="contentError"></InlineError>
        contentProps = {'aria-describedby': 'contentError', 'aria-invalid': "true"};
    }


  return (
        <div id="syllabusTabDiv">
            <span className="rvt-ts-26 rvt-text-bold rvt-display-block rvt-m-bottom-md">Add, update, or delete a syllabus supplement</span>
            <label id="selectNodeLabel">Node:
                <span className="rvt-sr-only">Select a node to add, update, or delete its syllabus supplement.</span>
            </label>
            <div className="rvt-m-bottom-md">
                <Select options={this.props.hierarchy} id="hierNodeName" name="hierNodeName" isSearchable={true} isClearable={true} placeholder="Select Node" className="node-select"
                    onChange={this.handleHierarchyOptionChange} classNamePrefix="node-rivet"/>
            </div>

            <label id="selectTermLabel">Term:
                <span className="rvt-sr-only">Select the specific term to add, update, or delete its syllabus supplement.</span>
            </label>
            <div className="rvt-m-bottom-md">
                <Select options={this.props.terms} id="termId" name="termId" isSearchable={true} isClearable={false} className="node-select"
                    onChange={this.handleTermOptionChange} defaultValue={this.props.terms[0]} classNamePrefix="node-rivet" />
            </div>

            <label for="text-input-default" className="rvt-label rvt-ts-16">Supplement Title (required)</label>
            <input type="text" id="text-input-default" name={this.titleInput} className="rvt-text-input"
                disabled={this.state.inputsDisabled} value={this.state.syllabus.syllabusTitle}
                onChange={this.handleTextInputChange} {...inputProps} />
            {noteNode}


            <label htmlFor="supplementText" className="rvt-label rvt-ts-16 rvt-m-top-md">Supplement Text (required)</label>
            <div id="supplementContentContainer">
                <Editor id="supplementText" className="rvt-m-bottom-md" value={this.state.syllabus.syllabusContent}
                    onEditorChange={this.handleEditorChange} onInit={this.handleInit} disabled={this.state.inputsDisabled}
                    init={{ plugins: 'advlist code image link lists table',
                            toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | link image table | bullist numlist outdent indent | code',
                            image_title: true,
                            automatic_uploads: true,
                            file_picker_types: 'image',
                            file_picker_callback: this.filePickerCallback}}
                />
            </div>
            {contentNote}
            
            <label for="contact-username" className="rvt-label rvt-ts-16 rvt-m-top-md">Contact Username (required)</label>
            <input id="contact-username" type="text" name={this.usernameInput} className="rvt-text-input"
                disabled={this.state.inputsDisabled} value={this.state.syllabus.contactUsername}
                onChange={this.handleTextInputChange} {...contactUserProps}
                maxLength="255" />
            {contactUserNote}

            <label for="contact-email" className="rvt-label rvt-ts-16 rvt-m-top-md">Contact Email (required)</label>
            <input id="contact-email" type="text" name={this.emailInput} className="rvt-text-input"
                disabled={this.state.inputsDisabled} value={this.state.syllabus.contactEmail}
                onChange={this.handleTextInputChange} {...contactEmailProps}
                maxLength="255" />
            {contactEmailNote}

            <div className="rvt-button-group rvt-button-group--right rvt-m-top-xl rvt-m-bottom-sm">
                <button id="syllabusSupplementCancelButton" className="rvt-button rvt-button--secondary"
                    disabled={this.state.cancelDisabled} onClick={this.handleCancel}>Cancel</button>
                <button id="syllabusSupplementDeleteButton" type="button" className="rvt-button" onClick={this.handleDeleteDialogOpen}
                    disabled={this.state.deleteDisabled} data-rvt-dialog-trigger="delete-supplement-dialog">Delete</button>
                <button id="syllabusSupplementSaveButton" data-rvt-dialog-trigger="save-supplement-dialog"type="button" className="rvt-button" onClick={this.handleSaveDialogOpen}
                    disabled={this.state.saveDisabled}>Save</button>
            </div>

            <ConfirmationModal isOpen={this.state.saveModalOpen} handleConfirm={this.handleModalSave} title="Save Confirmation"
                    onDismiss={() => this.handleModalCancel("syllabusSupplementSaveButton")} focusId="confirmSupplementSave" dialogId="save-supplement">
                <p id="confirmSupplementSave" tabindex="-1">Are you sure you wish to save this supplement to the {this.state.selectedNode} account for the {this.state.selectedTermName} term?</p>
            </ConfirmationModal>
            <ConfirmationModal isOpen={this.state.deleteModalOpen} handleConfirm={this.handleModalDelete} title="Delete Confirmation"
                    onDismiss={() => this.handleModalCancel("syllabusSupplementDeleteButton")} focusId="confirmSupplementDelete" dialogId="delete-supplement">
                <p id="confirmSupplementDelete" tabindex="-1">Are you sure you wish to delete this supplement from the {this.state.selectedNode} account for the {this.state.selectedTermName} term?</p>
            </ConfirmationModal>
        </div>

      );
  }
}


export default SyllabusSupplementTabContent
