import React, { Component } from 'react';
import { Form, Input } from 'antd';
import Counter from '../../components/Counter';
import './TextAreaCounter.scss';

const { TextArea } = Input;

/**
 * label 标签栏名称,
 * formId fromId用于form获取数据,
 * str='' 输入的值,
 * initialVal 默认值,
 * astrictNub 限制长度,          默认值200
 * rows 输入框行数,              默认值2
 * placeholder 提示内容,         默认值：请输入
 * isRequired 必填与否,         默认值：false
 * getFieldDecorator 用于和表单进行双向绑定，可查文档
 * width 输入框宽度
 * colon 是否展示：
 * message 错误提示内容
 */
export default class TextAreaCounter extends Component {
    render() {
        let {
            label,
            formId,
            initialVal,
            astrictNub=200,
            rows=2,
            placeholder='请输入',
            getFieldDecorator,
            isRequired=false,
            width='',
            colon=true,
            message,
            getFieldValue,
            disabled
        } = this.props;
        return (
            <Form.Item label={label} colon={colon}>
                <div className='textAreaCounter'>
                    {getFieldDecorator(formId, {
                        rules: [{ max: +astrictNub, message: `最大输入长度为${astrictNub}` },{
                            required:isRequired,
                            message:`请输入${label||message}`,
                        }],
                        initialValue:initialVal,
                    })(
                        <TextArea
                            className='textArea'
                            rows={rows}
                            placeholder={placeholder}
                            style={{width}}
                            disabled={disabled}
                        />
                    )}
                    <Counter astrictNub={astrictNub} str={getFieldValue(formId)||''} />
                </div>
            </Form.Item>
        );
    }
}
