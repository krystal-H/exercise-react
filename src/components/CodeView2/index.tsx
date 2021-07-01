import React, { Component } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-chrome";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/theme-monokai";

import "ace-builds/src-noconflict/ext-language_tools";
// import "ace-builds/src-noconflict/worker-base";
// import "ace-builds/src-noconflict/worker-javascript";
// import "ace-builds/src-noconflict/worker-json";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/snippets/sql";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/snippets/mysql";
// import "ace-builds/src-noconflict/mode-plain_text";
// import "ace-builds/src-noconflict/snippets/plain_text";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/snippets/text";

let ids = 0;
const defaultSty: React.CSSProperties = {
  position: "relative",
  width: "100%",
};

interface CodeViewProps {
  mode?: string; // 代码语言
  height?: number; // 容器的高度
  readOnly?: boolean; // 是否可编辑
  completers?:any;//自定义关键字补全提示

  code: string; // 程序代码
  onChange?: (code: string) => void; // 变更程序代码
}

class CodeView extends Component<CodeViewProps> {
  wrapId: string;
  id: string;
  editor: any;
  constructor(props: CodeViewProps) {
    super(props);
    ids++;
    this.wrapId = "ace-wrap-" + ids;
    this.id = "ace-" + ids;
  }

  setEditor = (e: any) => {
    this.editor = e;
  };
  
complete =(editor:any) =>{
  //向编辑器中添加自动补全列表
  const {completers} = this.props;
  if(completers){
    editor.completers.push({
      getCompletions: function (editors:any, session:any, pos:any, prefix:any, callback:any) {
        callback(null, completers);
      }
    });
  }
  
}


  render() {
    const { wrapId, id, props } = this;
    const {
      mode = "javascript",
      height = 400,
      readOnly = false,
      code,
      onChange,
    } = props;

    return (
      <div id={wrapId} style={defaultSty}>
        <AceEditor
          name={id}
          mode={mode || "text"}
          theme="chrome" // monokai  github
          width="100%"
          height={height + "px"}
          placeholder="请输入..."
          tabSize={2}
          // wrapEnabled={true}  // 自动换行
          // showGutter={true}  // 显示左侧行号
          // showPrintMargin={true}
          // highlightActiveLine={true} // 高亮当前行
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={true}
          enableSnippets={true}
          readOnly={readOnly}
          editorProps={{
            $blockScrolling: true,
          }}
          setOptions={{
            autoScrollEditorIntoView: true,
            useWorker: false,
            // enableEmmet: true,
          }}
          ref={this.setEditor}
          value={code}
          onChange={onChange}
          // onValidate={(annotations) => {
          //   console.log("onValidate", annotations);
          // }}
          onLoad={this.complete}
        />
      </div>
    );
  }
}

export default CodeView;
