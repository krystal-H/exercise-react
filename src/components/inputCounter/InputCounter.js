import React, { Component } from 'react';
import { Input } from 'antd';
import './InputCounter.scss';

/**
 * str 输入的文本
 * onChange 值改变事件
 * placeholder 提示语
 * suffix 单位
 * allowClear 删除按钮
 */
export default class InputCounter extends Component {
    render() {
        let {
                astrictNub,
                str='',
                onChange,
                placeholder,
                suffix='',
                allowClear=false
            } = this.props;
        let warningTag = str&&str.length>astrictNub?true:false;//输入内容大于限制时进行警示
        return (
            <div className='inputCounter'>
                {/* 输入框 */}
                <Input 
                    className={warningTag?'input-border-color input':'input'} 
                    value={str} 
                    onChange={onChange} 
                    placeholder={placeholder} 
                    suffix={suffix} 
                    allowClear={allowClear}
                />
                {/* 超出提出文本 */}
                {warningTag?<p className={warningTag?'warning':''}>不超过{astrictNub}个字符</p>:null}
            </div>
        );
    }
}
