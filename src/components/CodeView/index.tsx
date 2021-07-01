import React, { Component } from "react";
// import "./jshint";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/sql/sql";
// import "codemirror/addon/display/fullscreen";
import "codemirror/addon/scroll/simplescrollbars";
// import "codemirror/addon/lint/lint";
// import "codemirror/addon/lint/javascript-lint";
// import "codemirror/addon/hint/javascript-hint";
import formatToCodeMirror from "./format";

import "codemirror/lib/codemirror.css";
// import "codemirror/addon/display/fullscreen.css";
import "codemirror/addon/scroll/simplescrollbars.css";
// import "codemirror/addon/hint/show-hint.css";
// import "codemirror/addon/lint/lint.css";

formatToCodeMirror(CodeMirror);

let ids = 0;

interface CodeViewProps {
  mode?: string; // 代码语言
  height?: number; // 容器的高度
  readOnly?: boolean; // 是否可编辑
  autoFormat?: boolean; // 是否一创建时自动格式化，默认进行格式化

  code: string; // 程序代码
  onChange?: (code: string) => void; // 变更程序代码
}

class CodeView extends Component<CodeViewProps> {
  wrapId: string;
  wrap: HTMLDivElement | null;
  id: string;
  textarea: HTMLTextAreaElement | null;
  editor: CodeMirror.Editor | null;
  codeStr: string | null;
  constructor(props: CodeViewProps) {
    super(props);
    ids++;
    this.wrapId = "CodeMirror-wrap" + ids;
    this.id = "CodeMirror" + ids;
    this.editor = null;
    this.codeStr = null;
  }
  componentDidMount() {
    const { id, wrapId, props } = this;
    const {
      mode = "javascript",
      height = 400,
      readOnly = false,
      autoFormat = true,
      onChange,
    } = props;
    this.wrap = document.getElementById(wrapId) as HTMLDivElement;
    this.textarea = document.getElementById(id) as HTMLTextAreaElement;
    const editor = CodeMirror.fromTextArea(this.textarea, {
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      scrollbarStyle: "simple",
      // styleActiveLine: true,
      // matchBrackets: true,
      mode,
      // gutters: ["CodeMirror-lint-markers"],
      // lint: true,
      readOnly,
      /*extraKeys: {
        F11: function (cm) {
          cm.setOption("fullScreen" as any, !cm.getOption("fullScreen" as any));
        },
        Esc: function (cm) {
          if (cm.getOption("fullScreen" as any))
            cm.setOption("fullScreen" as any, false);
        },
      },*/
    });
    editor.setSize("100%", height);
    this.editor = editor;

    this.setValue(autoFormat);

    if (!readOnly && onChange) {
      editor.on("change", (cm) => onChange(cm.getValue()));
    }

    // if (fullScreen) {
    //   fullScreen(this.fullScreen);
    // }
  }
  // componentDidUpdate() {
  //   this.setValue();
  // }
  componentWillUnmount() {
    setTimeout(() => {
      const { wrap } = this;
      if (wrap !== null) {
        const p = wrap.parentNode;
        if (p) p.removeChild(wrap);
      }
    }, 500);
  }

  // fullScreen = () => {
  //   const { editor } = this;
  //   if (editor) {
  //     editor.setOption(
  //       "fullScreen" as any,
  //       !editor.getOption("fullScreen" as any)
  //     );
  //   }
  // };

  setValue = (_autoFormat?: boolean) => {
    const {
      editor,
      props: { code, autoFormat = true },
      codeStr,
    } = this;
    const auto = _autoFormat !== undefined ? _autoFormat : autoFormat;

    if (editor && codeStr !== code) {
      this.codeStr = code;
      editor.setValue(code);
      if (auto) {
        CodeMirror.commands["selectAll"](editor);
        var range = {
          from: editor.getCursor(true as any),
          to: editor.getCursor(false as any),
        };
        (editor as any).autoFormatRange(range.from, range.to);
        editor.setCursor({ line: 0, ch: 0 });
      }
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

export default CodeView;
