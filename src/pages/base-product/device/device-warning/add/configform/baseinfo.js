import React, { Component } from 'react';
import { Form ,Input} from 'antd';
import TextAreaCounter from '../../../../../../components/textAreaCounter/TextAreaCounter';

class BaseInfo extends Component {

    componentDidMount() {
        this.props.onRef(this);
        let { baseFormData, form } = this.props;
        if(baseFormData.name){
            let { setFieldsValue } = form;
            setFieldsValue({...baseFormData}); 
        } 

    }
    componentWillReceiveProps(newprops){
        let {baseFormData} = newprops;
        if(!this.props.baseFormData.name && !!baseFormData.name){
            console.log(11111,baseFormData);
            this.props.form.setFieldsValue({...baseFormData});

        }

    }

    handleSubmit = e => {
        const { validateFieldsAndScroll } = this.props.form;
        const { saveBaseInfo} = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let baseFormData = {...values};
                saveBaseInfo({baseFormData,current:1});
            }
        });
    };

    render() {
        let formlayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 15 },
        };
        let { getFieldDecorator,getFieldValue } = this.props.form;
        return ( 
            <Form  {...formlayout} >
                <Form.Item label="告警规则名称">
                    {getFieldDecorator('name', {
                        rules: [{ required: true, message: '请输入告警规则名称'},
                                { max: 50, message: '最大输入长度为50' }],
                    })(<Input placeholder="请输入告警规则名称" />)
                    }
                </Form.Item>
                <TextAreaCounter
                    label="描述"
                    formId='remark'
                    astrictNub='100'
                    rows='3'
                    placeholder='告警规则描述' 
                    getFieldDecorator={getFieldDecorator}
                    getFieldValue={getFieldValue}
                />
            </Form>
        )
    }
}

export const BaseInfoForm = Form.create({
    name: 'baseInfoForm',
})(BaseInfo);
