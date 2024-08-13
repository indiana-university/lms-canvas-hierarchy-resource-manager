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
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TextEditor(props) {
  const editorRef = useRef(null);
  const handleFilePickerCallback = props.filePickerCallback;
  const scriptSrc = process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'
  const ariaText = props.ariaText;

  return (
    <>
      <Editor
        tinymceScriptSrc='/app/webjars/tinymce/tinymce.min.js'
        value={props.value}
        id={props.id}
        onEditorChange={props.onEditorChange}
        onInit={props.onInit}
        disabled={props.disabled}
        init={{
          height: 250,
          plugins: [
            'advlist', 'lists', 'link', 'image', 'code', 'table', 'wordcount'
          ],
          toolbar: 'undo redo | styleselect | bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | link image table | bullist numlist outdent indent | code | opensInNew hiddenSRText ariaDescribedBy',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          image_title: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          file_picker_callback: handleFilePickerCallback,
          iframe_aria_text: ariaText,
          promotion: false,
          extended_valid_elements: 'svg[*],path[*]',
          setup: (editor) => {
            editor.ui.registry.addButton("opensInNew", {
                text: 'Opens in New Window',
                tooltip: 'Insert Opens in New Window image',
                icon: 'new-tab',
                onAction: () => tinyMCE.execCommand('mceInsertContent', false, '<svg aria-hidden="true" fill="currentColor" focusable="false" height="12" viewBox="0 0 16 16" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M15 1H9v2h2.586l-3 3L10 7.414l3-3V7h2V1Z"></path><path d="M7 3H1v12h12V9h-2v4H3V5h4V3Z"></path></svg>')
            });
            editor.ui.registry.addButton("hiddenSRText", {
                text: 'Hidden SR text',
                tooltip: 'Insert hidden SR text once per document.',
                icon: 'preview',
                onAction: () => tinyMCE.execCommand('mceInsertContent', false, '<span id="sr-new-window" hidden>Opens in new window</span>')
            });
            editor.ui.registry.addButton("ariaDescribedBy", {
                text: 'aria-describedby',
                tooltip: 'Add aria-describedby to link',
                icon: 'accessibility-check',
                onAction: () => tinyMCE.execCommand('mceInsertContent', false, 'aria-describedby="sr-new-window"')
            });
          }

        }}
      />
    </>
  );
}
