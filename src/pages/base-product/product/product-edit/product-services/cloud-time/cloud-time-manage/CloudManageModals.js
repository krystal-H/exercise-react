import React from 'react';
import { Button, Modal, Form, Input, Select } from 'antd';
import { Notification} from '../../../../../../../components/Notification';
import { cloneDeep,uniq,difference } from 'lodash'
import { setFuncDataType } from '../../../../../../../util/util';
import ActionConfirmModal from '../../../../../../../components/action-confirm-modal/ActionConfirmModal';

const { Option } = Select;


export const CloudAddForm = Form.create({ name: 'form_in_modal-h5-add' })(
    class extends React.Component {
        state = {
            isShowAddItem: false,
            protocolItemIndex: '', // 会用this.protocolLists记录当前所有下拉框，此参数代表选中的哪一个 
            selectedProtocolList: [], // 记录当前弹框中所有被选中的协议
            ownUsedPropertys:[], // 记录所有被用过的协议字段，由父组件传入进行初始化，然后再编辑过程中自己维护
        }
        componentDidMount(){
            let {usedPropertys,type,operateService} = this.props,
                ownUsedPropertys = cloneDeep(usedPropertys),
                _state = {ownUsedPropertys};
            
            if (type === 'edit') {
                _state.selectedProtocolList = cloneDeep(operateService.timerServiceDetails)
            }
            this.setState(_state)
        }
        handleSubmit = e => {
            let {onAddOkHandle,type} = this.props,
                {selectedProtocolList} = this.state;

            e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    if (selectedProtocolList.length == 0) {
                        Notification({
                            type:'error',
                            message: '参数缺失',
                            description: '请先添加数据点'
                        })

                        return false;
                    }

                    let _selectedProtocolList = selectedProtocolList.map(item => {
                        let {property,propertyName,functionDataType,_functionDataType} = item;
                        return {
                            property,
                            propertyName,
                            functionDataType:_functionDataType ? _functionDataType : functionDataType
                        }
                    })

                    onAddOkHandle({
                        ...values,
                        protocolList:JSON.stringify(_selectedProtocolList)
                    },type)
                }
            });
        }
        showAddItem = () => {
            this.setState({
                isShowAddItem: true
            })
        }
        hideAddItem = () => {
            this.setState({
                isShowAddItem: false,
                protocolItemIndex: ''
            })
        }
        deleteProtocol = (index) => {
            let { selectedProtocolList,ownUsedPropertys } = this.state,
                _deletePropertyName = selectedProtocolList[index].propertyName,
                _deleteProperty = [],
                _selectedProtocolList = selectedProtocolList.filter((item) =>  {
                    
                    if (item.propertyName == _deletePropertyName) { // 同名称的协议一起删除掉
                        _deleteProperty.push(item.property);
                        return false;
                    }

                    return true;
                }),
                _ownUsedPropertys = difference(ownUsedPropertys,_deleteProperty);

            this.setState({
                selectedProtocolList:_selectedProtocolList,
                ownUsedPropertys:_ownUsedPropertys
            })
        }
        addProtocol = () => {
            let { selectedProtocolList, protocolItemIndex,ownUsedPropertys } = this.state;

            if (protocolItemIndex === '') {
                Notification({
                    type:'error',
                    message: '参数缺失',
                    description: '请先选择一个控制协议字段'
                })

                return false;
            }

            // 同名称的协议一起添加
            let  protocols = this.protocolLists.filter(item => item.propertyName == this.protocolNames[protocolItemIndex]),
                 _newProperty = [],
                 _newAdds = protocols.map(item => {
                    let { property, propertyName, functionDataType, propertyValueDesc ,byteDefVOList,byteDefVO,length,_functionDataType} = item;
                    _newProperty.push(property);
                    return {
                        property,
                        propertyName,
                        functionDataType,
                        propertyValueDesc,
                        byteDefVOList,
                        byteDefVO,
                        length,
                        _functionDataType
                    }
                 });

            this.setState({
                selectedProtocolList: [...selectedProtocolList, ..._newAdds],
                isShowAddItem: false,
                protocolItemIndex: '',
                ownUsedPropertys:[...ownUsedPropertys,..._newProperty]
            })
        }
        dealProtocols = () => {
            let { productProtocolLists = [] } = this.props,
                {list,structDefVOList,arrayDefVOList} = productProtocolLists[0],
                {ownUsedPropertys} = this.state,
                _productProtocolLists = (list || []);

            if(structDefVOList) {
                _productProtocolLists = _productProtocolLists.concat(structDefVOList.map(item => {
                    item._functionDataType = item.functionDataType
                    item.functionDataType = 11
                    return item
                }))
            }

            if(arrayDefVOList) {
                _productProtocolLists = _productProtocolLists.concat(arrayDefVOList.map(item => {
                    item._functionDataType = item.functionDataType
                    item.functionDataType = 10
                    return item
                }))
            }


            _productProtocolLists = _productProtocolLists.filter(item => {
                // 已存在的字段不展示
                // 保留字和updateFlag不展示
                // 时间类型协议不展示
                return !(ownUsedPropertys.includes(item.property) || 
                        ['Base_Null_Reserved_Null','updateFlag'].includes(item.property) ||
                        ['5','6','7'].includes('' + item.functionDataType))
            })

            this.protocolLists = _productProtocolLists;
            // 按名称给下拉框，是为了同时操作同名称的协议（RGB,二进制）
            this.protocolNames = uniq(_productProtocolLists.map(item => item.propertyName))

            return this.protocolNames;
        }
        getProtocolOptions = () => {
            const protocolNames = this.dealProtocols();

            return protocolNames.map((item, index) => {
                return <Option key={index} value={index}>{item}</Option>
            })
        }
        changeProtocolItem = (index) => {
            this.setState({
                protocolItemIndex: index
            })
        }
        showSelectedProtocolList = (selectedProtocolList) => {
            let _selectedProtocolList = cloneDeep(selectedProtocolList),
                temp = [],
                obj = {}

                _selectedProtocolList.forEach((item,index) => {
                    let {propertyName} = item;
                    item._index = index;
                    if (obj[propertyName] !== undefined) {
                        temp[obj[propertyName]].push(item);
                    } else {
                        obj[propertyName] = index;
                        temp[index] = [item]
                    }
                })


                return temp;
        }
        getProtocolDes = (protocol) => {
            let {propertyValueDesc,functionDataType,byteDefVO = {},byteDefVOList={},length} = protocol;

            if (functionDataType === 10) {
                return `${length}个${setFuncDataType(byteDefVO)}子元素`
            }

            if (functionDataType === 11 && byteDefVOList) {
                return byteDefVOList.map(item => item.propertyValueDesc).join(';')
            }

            return propertyValueDesc

        }
        render() {
            const { visible, form, onCancel , type,operateService,addLoading} = this.props,
                  { isShowAddItem, protocolItemIndex, selectedProtocolList } = this.state,
                  { getFieldDecorator } = form,
                  showSelectedProtocolList = this.showSelectedProtocolList(selectedProtocolList);

            let _name = ''
            if (type === 'edit') {
                _name = operateService.serviceName
            }

            return (
                <Modal
                    visible={visible}
                    className="self-modal"
                    width={800}
                    title="添加云端定时功能"
                    centered={true}
                    closable={false}
                    footer={null}
                    onCancel={onCancel}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <Form {...{ labelCol: { span: 3 }, wrapperCol: { span: 21 } }}
                        labelAlign="left"
                        onSubmit={this.handleSubmit}>
                        <Form.Item label="功能名称">
                            {getFieldDecorator('serviceName', {
                                rules: [{ required: true, message: '请输入功能名称' },{ max: 20, message: '最大输入长度为20' }],
                                initialValue: _name
                            })(<Input placeholder="不超过20个字符" />)
                            }
                        </Form.Item>
                        <div className="ant-row ant-form-item">
                            <div className="ant-col ant-col-3 ant-form-item-label">
                                <label className=" text-right ant-form-item-required">关联协议</label>
                            </div>
                            <div className="ant-col ant-col-21 ">
                                {
                                    showSelectedProtocolList.length > 0 &&
                                    <div className="protocol-item-area">
                                        {
                                            showSelectedProtocolList.map((item, index) => {
                                                return (
                                                    <div className="time-protocol-item" key={index}>
                                                        <p className="item-name">{item[0].propertyName}</p>
                                                        <div className="item-p-l">
                                                            {
                                                                item.map((_item,_index) => {
                                                                    return <p key={_index}> 
                                                                                <span>{_item.property}</span>
                                                                                <span className="margin-l-16">{setFuncDataType(_item)}</span>
                                                                                <span className="margin-l-16">{this.getProtocolDes(_item)}</span>
                                                                            </p>  
                                                                })
                                                            }
                                                        </div>
                                                        <span style={{top:'12px'}}
                                                              onClick={() => this.deleteProtocol(item[0]._index)} 
                                                              className="re-select-property">删除</span>
                                                    </div>)
                                            })
                                        }
                                    </div>
                                }
                                {
                                    isShowAddItem &&
                                    <div className="add-time-service-wrapper">
                                        <div className="protocol-select-area">
                                            <Select value={protocolItemIndex}
                                                onChange={value => this.changeProtocolItem(value)}
                                                style={{ width: 300 }}>
                                                <Option key="" value="">请选择需要关联的协议</Option>
                                                {
                                                    this.getProtocolOptions()
                                                }
                                            </Select>
                                        </div>
                                        <div className="control-btns">
                                            <Button size="small"
                                                onClick={this.addProtocol}
                                                type="primary" >确认</Button>
                                            <Button className="margin-l-16"
                                                size="small"
                                                onClick={this.hideAddItem}
                                                type="default">删除</Button>
                                        </div>
                                    </div>
                                }
                                <a className="select-a" onClick={this.showAddItem}>添加数据点</a>
                            </div>
                        </div>

                        <Form.Item wrapperCol={{ span: 24 }}>
                            <div className="form-in-modal-ok-cancel-btn">
                                <Button type="primary" loading={addLoading} htmlType="submit">确认</Button>
                                <Button type="default" onClick={onCancel}>取消</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);

export function CloudUpdate({ visible, updateOkHandle, updateCancelHandle,operate,serviceName,updateLoading }) {
    let texts = null;
    switch (operate) {
        case 1:
            texts = {
                title:'发布云端定时功能',
                desc:'即将发布的功能',
                tip:'功能发布后，APP上可以看到并启用，是否确认发布？',
                needWarnIcon:false
            }
            break;
        case 2:
            texts = {
                title:'删除云端定时功能',
                desc:'即将删除的功能',
                tip:'功能删除后将无法找回，是否确认删除？',
                needWarnIcon:true
            }
            break;
        case 3:
            texts = {
                title:'下线云端定时功能',
                desc:'即将下线的功能',
                tip:'功能下线后将无法看到，是否确认下线？',
                needWarnIcon:true
            }
            break;
        default:
            break;
    }
    return (
        <ActionConfirmModal
            visible={visible}
            modalOKHandle={() => updateOkHandle(operate)}
            modalCancelHandle={updateCancelHandle}
            targetName={serviceName}
            title={texts.title}
            descGray={true}
            needWarnIcon={texts.needWarnIcon}
            descText={texts.desc}
            tipText={texts.tip}
            confirmLoading={updateLoading}
        ></ActionConfirmModal>
    )
}