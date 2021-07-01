import React, { Component } from 'react';
import { Input,Form} from 'antd';
import TextAreaCounter from '../../../../components/textAreaCounter/TextAreaCounter';

class CaseAddForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            
            
        };
    }
    componentDidMount() {
        this.props.onRef(this);
    }
    render() {
        let formlayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        let { getFieldDecorator,getFieldValue } = this.props.form;
        return ( 
                <Form  {...formlayout} >
                    <Form.Item label="分组名称">
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入分组名称'},
                                    { max: 50, message: '最大输入长度为50' }],
                        })(<Input placeholder="请输入分组名称" />)
                        }
                    </Form.Item>
                    <TextAreaCounter
                        label="分组描述"
                        formId='remark'
                        astrictNub='50'
                        rows='4'
                        placeholder='分组描述' 
                        getFieldDecorator={getFieldDecorator}
                        getFieldValue={getFieldValue}
                    />
                </Form>
               
          
        )
    }
}
export const AddForm = Form.create({
    name: 'caseAdd',
})(CaseAddForm);
