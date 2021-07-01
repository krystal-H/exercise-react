import React, { Component } from 'react';
import { Form ,Input,Radio} from 'antd';

class Publictype extends Component {

    constructor(props) {
        super(props);
        this.state = {
            warningWay:'0'
        }
    }
    componentDidMount() {
        this.props.onRef(this);
        let { piublicFormData, form } = this.props;
        if(piublicFormData.warningTitle){
            let { setFieldsValue } = form;
            this.setState({warningWay:piublicFormData.warningWay},()=>{
                setFieldsValue({...piublicFormData});
            })
        }
    }

    handleSubmit = e => {
        // e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { savPublicWay} = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let piublicFormData = {...values};
                savPublicWay({piublicFormData});
            }
        });
    };
    warningWayChanged=(e)=>{
        this.setState({warningWay:e.target.value});
    }

    render() {
        let formlayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 15 },
        };
        let { getFieldDecorator } = this.props.form;
        let { warningWay } = this.state;
        return ( 
            <Form  {...formlayout} >
               
                <Form.Item label="触发告警" >
                    {getFieldDecorator('warningWay', {
                        rules: [{ required: true, message: '请选择告警方式'}],
                        initialValue:"0"
                    })(<Radio.Group onChange={this.warningWayChanged}>
                        <Radio value="0">站内消息</Radio>
                        <Radio value="1">站内消息+邮件</Radio>
                    </Radio.Group>
                    )
                    }
                </Form.Item>
                <Form.Item label="消息标题">
                    {getFieldDecorator('warningTitle', {
                        rules: [{ required: true, message: '请输入消息标题'},
                                { max: 50, message: '最大输入长度为50' }],
                    })(<Input placeholder="请输入消息标题" />)
                    }
                </Form.Item>
                {warningWay=="1" &&
                    <Form.Item label="邮件地址">
                        {getFieldDecorator('emailAddress', {
                            rules: [{ required: true, message: '请输入邮件地址'},
                                    { max: 100, message: '最大输入长度为100' }],
                        })(<Input placeholder="请输入邮件地址" />)
                        }
                    </Form.Item>
                }
                <Form.Item label="告警内容">
                    {getFieldDecorator('warningDetails', {
                        rules: [{ required: true, message: '请输入告警内容'},
                                { max: 100, message: '最大输入长度为100' }],
                        initialValue:'您好，{pruductname}，{time}出现配置规则下的异常，请在站内消息查看详情！'
                    })(<Input.TextArea placeholder="请输入告警内容" rows='3' disabled={true}/>)
                    }
                </Form.Item>
                <Form.Item label="发送频率" >
                    {getFieldDecorator('waringFreq', {
                        rules: [{ required: true}],
                        initialValue:"0"
                    })(<Radio.Group >
                        <Radio value="0">首次发送后，相同故障间隔6小时发送一次，最高单日发送4次&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Radio>
                        <Radio value="1">首次发送后，相同故障间隔24小时发送一次</Radio>
                    </Radio.Group>
                    )
                    }
                </Form.Item>
            </Form>
        )
    }
}

export const PublictypeForm = Form.create({
    name: 'publictypeForm',
})(Publictype);
