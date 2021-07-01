import * as React from 'react';
import {
    Select,
    Empty
} from 'antd';
import './selectSpan.scss';

/**
 * props与级联选择相同, 可直接替换级联选择
 */
class SelectSpan extends React.Component {
    state = {
        value: [],
        index: 0,
    }

    // 切换大类
    handleClick = (index, e) => {
        e.preventDefault();
        this.setState({
            index,
        });
    }

    // 选择值
    handleValue = (target, selectedOptions, e) => {
        const {
            value,
            onChange
        } = this.props;
        if (typeof onChange === "function") {
            onChange(target, selectedOptions);
        }
        // 受控组件不改变值
        if (typeof value !== "undefined") {
            return;
        }
        this.setState({
            value: target
        });
    }

    componentWillReceiveProps(nextProps) {
        const {
            value
        } = nextProps;
        if (this.props.value !== value) {
            this.setState({
                value: value || []
            })
        }
    }

    render() {
        const {
            options,
            placeholder,
            style
        } = this.props;
        const {
            index,
            value
        } = this.state;

        function createValue(list, arr) {
            let str = "";
            while (arr.length) {
                let id = arr.shift();
                let temp = list.find(item => item.value === id);
                str += arr.length ? temp.label + '/' : temp.label;
                list = temp.children;
            }
            return str;
        }

        const selectValue = value.length ? createValue(options, [...value]) : undefined;

        return (
            <Select 
                style={style}
                value={selectValue}
                onBlur={this.handleBlur}
                onFocus={this.handleFocus}
                placeholder={placeholder}
                getPopupContainer={triggerNode => triggerNode.parentElement}
                dropdownMatchSelectWidth={false}
                dropdownRender={() =>
                    {
                        return options && options.length ?
                        (
                            <div className="select-span">
                                <div className="select-span-title">
                                    {
                                        options ? options.map((item, i) => (
                                            <span className={`select-span-title-option ${i === index ? "active" : ""}`} key={item.value} 
                                                onMouseDown={this.handleClick.bind(this, i)}>{item.label}</span>
                                        )) : null
                                    }
                                </div>
                                <div className="select-span-content">
                                    {
                                        options && options[index] ? options[index].children.map((item) => (
                                            <div className="select-span-group" key={item.value}>
                                                <div className="select-span-group-option select-span-group-title">
                                                    <span className="group-name-label">{item.label}</span>
                                                </div>
                                                <div className="select-span-group-option select-span-group-item">
                                                    {
                                                        item.children.map((inner) => (
                                                            <span className={value && value.join('-') === `${options[index].value}-${item.value}-${inner.value}` ? "active" : ""} key={inner.value}
                                                                            onMouseDown={this.handleValue.bind(this, [options[index].value, item.value, inner.value], [options[index], item, inner])}>
                                                                {inner.label}
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )) : null
                                    }
                                </div>
                            </div>
                        )
                        : <div  className="select-span">
                            <Empty />
                        </div>
                    }
                }
            >
            </Select>
        );
    }
}

export default SelectSpan;
