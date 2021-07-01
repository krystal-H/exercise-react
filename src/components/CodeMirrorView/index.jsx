import React, { Component } from "react";
import CodeMirror from "codemirror";
import formatToCodeMirror from "./format";
// import cssToCodeMirror from "./css";
import jsToCodeMirror from "./javascript";
// import "./codemirror.scss";
import "codemirror/lib/codemirror.css";

formatToCodeMirror(CodeMirror);
// cssToCodeMirror(CodeMirror);
jsToCodeMirror(CodeMirror);

let ids = 0;

class CodeMirrorView extends Component {
    constructor(props) {
        super(props);
        ids++;
        this.wrapId = "CodeMirror-wrap" + ids;
        this.id = "CodeMirror" + ids;
        this.editor = null;
        this.codeStr = null;
    }
    componentDidMount() {
        const editor = CodeMirror.fromTextArea(
            document.getElementById(this.id),
            {
                lineNumbers: true,
                mode: "application/json",
                readOnly: true,
            }
        );
        editor.setSize("100%", "700px");
        this.editor = editor;
        this.setValue();
    }
    componentDidUpdate() {
        this.setValue();
    }
    componentWillUnmount() {
        setTimeout(() => {
            const wrap = document.getElementById(this.wrapId);
            if (wrap) {
                wrap.parentNode.removeChild(wrap);
            }
        }, 500);
    }

    setValue = () => {
        const {
            editor,
            props: { code },
            codeStr,
        } = this;

        if (codeStr !== code) {
            this.codeStr = code;
            editor.setValue(code);
            CodeMirror.commands["selectAll"](editor);
            var range = {
                from: editor.getCursor(true),
                to: editor.getCursor(false),
            };
            editor.autoFormatRange(range.from, range.to);
            editor.setCursor({ line: 0, ch: 0 });
        }
    };
    render() {
        const { id, wrapId } = this;
        return (
            <div id={wrapId}>
                <textarea id={id} name="code"></textarea>
            </div>
        );
    }
}

export default CodeMirrorView;
