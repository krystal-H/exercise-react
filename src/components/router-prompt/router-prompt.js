import React from 'react';
import { Prompt} from "react-router-dom";

// 1、编辑状态由使用者自己维护
export default function RouterPrompt ({message,promptBoolean}) {
    return  <Prompt message={
                        location =>
                            !promptBoolean
                            ? true
                            : message || '当前页面有未保存的内容，是否离开?'
                    }
            />
}