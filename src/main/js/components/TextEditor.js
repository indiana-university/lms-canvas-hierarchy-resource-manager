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
            'alignright alignjustify | link image table | bullist numlist outdent indent | code',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          image_title: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          file_picker_callback: handleFilePickerCallback,
          iframe_aria_text: ariaText,
          promotion: false
        }}
      />
    </>
  );
}
