import React from 'react'
import AceEditor from "react-ace";

import './CodeEdit.scss'

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github";

export default function CodeEdit({
    sqlText,
    setSqlText
}) {

    const onChange = (newValue) => {
        setSqlText(newValue)
    }

    return (
        <AceEditor
            mode="sql"
            theme="github"
            height="100%"
            width="100%"
            value={sqlText}
            onChange={onChange}
            showGutter={true}
            showPrintMargin={false}
            enableBasicAutocompletion={true}
            name="sql-edit"
            editorProps={{ $blockScrolling: true }}
        />
    )
}
