import React from 'react';
import moment from 'moment';
import {cloneDeep} from 'lodash';

import { DatePicker, Select, Form, Button } from 'antd';
const { Option } = Select;

/**
 * 设备调试/导出数据对话框
 * @type {[type]}
 */

const TODAY = moment();

export const ExportStagerDataDialog = Form.create({
        name: 'exportStagerDataDialog',
        onFieldsChange(props, changedFields) {
            if (JSON.stringify(changedFields) === '{}') {
                return ;
            }
            props.changeFormData( changedFields);
        },
        mapPropsToFields(props) {//处理父组件传值
            return {
                selectedMac:Form.createFormField({
                    ...props.selectedMac,
                    value: props.selectedMac.value,
                }),
                date:Form.createFormField({
                    ...props.date,
                    value: props.date.value,
                })
            };
        },
    })(
    class extends React.Component{
        constructor(props){
            super(props);
            let macList = cloneDeep(this.props.macList) || [];
            this.state = {
                macList: macList || [],
                showWarn: false,
                productId:this.props.productId,
                debugMacId:''
            }
            this.handleSubmit = this.handleSubmit.bind(this);
        }
        componentDidMount() {
            
        }
        //导出数据
        handleSubmit (e) {
            e.preventDefault();
            const { validateFieldsAndScroll } = this.props.form;
            validateFieldsAndScroll((err, values) => {
                if (!err) {
                    let { selectedMac, date } = values,
                        url =window.location.origin+'/v1/web/open/protoManage/exportRunDataToExcel?mac=' +
                            selectedMac +
                            '&searchDate=' +
                            date.format('YYYYMMDD') +
                            '&productId=' +
                            this.props.productId;
                        window.location.href = url;
                        this.props.onCancel();
                }
            });
        }
        render() {
            let { macList } = this.state;
            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: {
                  xs: { span: 24 },
                  sm: { span: 8 },
                },
                wrapperCol: {
                  xs: { span: 24 },
                  sm: { span: 16 },
                },
              };
            return (
                <div className='exportData'>
                    <Form {...formItemLayout} onSubmit={this.handleSubmit} className="">
                        <Form.Item label="选择Mac：" hasFeedback>
                            {getFieldDecorator('selectedMac', {
                                rules: [{ required: true, message: '请选择Mac!' }]
                            })(
                            <Select style={{ width: 174 }} placeholder="请选择产品" >
                                {macList.map((item,index)=>{
                                    return <Option key={'mac'+index} value={item.mac || item.id}>{item.mac || item.id}</Option>
                                })}
                            </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="选择日期：" hasFeedback>
                            {getFieldDecorator('date', {rules: [{ type: 'object', required: true, message: '请选择时间!' }]})(
                                <DatePicker format='YYYY/MM/DD' />
                            )}
                        </Form.Item>
                        <Button type="primary" htmlType="submit" icon="download" block>
                            下载
                        </Button>
                    </Form>
                </div>
            );
        }
    }    
);

