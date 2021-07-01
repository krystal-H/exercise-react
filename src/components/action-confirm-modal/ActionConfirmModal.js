// 通用的 操作确认弹框组件，主要是为了统一提示样式
// 除了通用的操作描述和提示外，还可以传入自定义的元素
// 相关样式在 css-in-modals.scss 文件中

import React from 'react';
import {Modal,Icon} from 'antd';

const MODAL_WIDTH = 480;

export default function ActionConfirmModal({
        visible,
        modalOKHandle,
        modalCancelHandle,
        confirmLoading = false,
        title,
        targetName = '',
        descText = '',
        descGray = false,
        tipText = '',
        newlineShowText = '',
        needWarnIcon = false,
        children = null // 可以传递额外的元素
    }) {
    let descClassName = "modal-content-p single p-l-0 " + (descGray ? 'grayBg' : '');
    return (
        <Modal
            visible={visible}
            className="self-modal"
            width={MODAL_WIDTH}
            title={title}
            okText="确定"
            confirmLoading={confirmLoading}
            onOk={modalOKHandle}
            cancelText="取消"
            onCancel={modalCancelHandle}
            centered={true}
            closable={true}
            maskClosable={false}
            destroyOnClose
        >
            <div className="tips-wrapper flex-row">
                {
                    needWarnIcon && 
                    <div style={{width:60,fontSize:34}} className="child-center">
                        <Icon type="warning" theme="twoTone" twoToneColor="#ff9900"/>
                    </div>
                }
                <div className="tops-content flex1">
                    {
                        descText && 
                        <p className={descClassName}><span>{`${descText}: `}</span> <span className="mark">{targetName}</span></p>
                    }
                    {
                        tipText && 
                        <p className={`modal-content-p ${descGray ? '' : ' p-l-0'}`}>{tipText}</p>
                    }
                </div>
            </div>
            {
                newlineShowText && 
                <div className={descClassName}><span>{`${newlineShowText}: `}</span> <div className="newline">{targetName}</div></div>
            }
            {
                children
            }
        </Modal>
    )
}
