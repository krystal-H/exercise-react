import React, { Component } from 'react'
import {Form,Input,Button,Select, notification} from 'antd';
import {get,Paths,post} from '../../../api';

const { Option } = Select;

const formItemLayout = {
    labelCol: {
        span: 4
    },
    wrapperCol: {
        span: 20
    },
};


class ContactInformation extends Component {
    constructor (props) {
        super(props);

        let {developerInfo = {}} = this.props,
            {province,city} = developerInfo;
        
        this.state = {
            provinceList:[],
            cityListObj:{
            },
            province: province || '',
            city: city || ''
        }
    }
    componentDidMount () {
        this.getProvinceList()
    }
    componentDidUpdate (prevProps,prevState) {
        let prevDeveloper = JSON.stringify(prevProps.developerInfo),
            nowDeveloper = JSON.stringify(this.props.developerInfo)
        if (prevDeveloper=== "{}" && prevDeveloper !== nowDeveloper) {
            let {developerInfo} = this.props,
                {province,city} = developerInfo;

            this.setState({
                province: province || '',
                city: city || ''
            },() => {
                this.getProvinceList()
            })
        }
    }
    getProvinceList () {
        let {province,provinceList} = this.state;

        if (provinceList.length === 0) {
            get(Paths.getProvince).then(data => {
                this.setState({
                    provinceList:data.data
                })
            })
        }
        
        if (province) {
            this.getCityList(province)
        }
    }
    getCityList = (provinceId) => {
        get(Paths.getCityByProvinceId,{
            provinceId
        }).then(data => {
            this.setState((state) => {
                return {
                    cityListObj: Object.assign({},state.cityListObj,{
                        [provinceId]: data.data
                    })
                }
            })
        })
    }
    handleSubmit = e => {
        e.preventDefault();
        
        let {province,city} = this.state,
            {form} = this.props;

        form.validateFields((err, values) => {
            if (!err) {
                let _values = {
                    ...values,
                    province,
                    city,
                    countryId: 0
                }
    
                post(Paths.upDeveloperInfo,{
                    ..._values
                },{
                    loading:true
                }).then(data => {
                    notification.success({
                        message:'更新成功',
                        description:'用户信息更新成功！'
                    })
                    this.props.getDeveloperInfo()
                })
            }
        });
    }
    getOptions = (type = 'province',city) => {
        let {provinceList,province,cityListObj} = this.state,
            optionFirstDom = <Option key={-999} value=''>请选择</Option>,
            temp = [],
            cityList = cityListObj[province] || [];

        if (type === 'province') {
            temp = provinceList.map(item => {
                let {provinceId,provinceName} = item;
                if (provinceId === -1) {
                    return null;
                }
                return <Option key={provinceId} value={ provinceId}>{provinceName}</Option>
            })
        } else{
            temp = cityList.map(item => {
                let {cityId,cityName} = item;

                return <Option key={cityId} value={'' + cityId}>{cityName}</Option>
            })
        }

        temp.unshift(optionFirstDom)

        return temp;
    }
    changeHandle = (type,value) => {
        if (type === 'province') {
            let newId =  value;

            if (newId) {
                this.getCityList(newId)
            }
            this.setState({
                city: ''
            })
        }

        this.setState({
            [type]: value
        })
    }
    render() {
        let {form,loading,developerInfo} = this.props,
            {province,city} = this.state,
            {mobilePhone,contactPerson,contactAddr} = developerInfo,
            { getFieldDecorator } = form;

            if (+province === -1) {
                province = ''
            } 

        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label="国家">
                    <Input value="中国" disabled placeholder="请选择国家" />
                </Form.Item>
                <Form.Item label="所在地区" style={{ marginBottom: 0 }}>
                    <Form.Item style={{ display: 'inline-block', width: '30%' }}>
                        <Select style={{ width: "90%" }} value={province} onChange={value => this.changeHandle('province',value)}>
                            {this.getOptions('province')}
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ display: 'inline-block', width: '30%' }}>
                        <Select style={{ width: "90%" }} value={city} onChange={value => this.changeHandle('city',value)}>
                            {this.getOptions('city',city)}
                        </Select>
                    </Form.Item>
                </Form.Item>
                <Form.Item label="联系地址">
                    {getFieldDecorator('contactAddr', {
                        rules: [{ max: 100, message: '最大输入长度为100' }],
                        initialValue: contactAddr
                    })(<Input placeholder="请输入联系地址" />)}
                </Form.Item>
                <Form.Item label="联系人">
                    {getFieldDecorator('contactPerson', {
                        rules: [{pattern : /^[a-zA-Z0-9\u4e00-\u9fa5]{2,20}$/,message:'请输入2到20长度的汉字、字母和数字'}],
                        initialValue: contactPerson
                    })(<Input placeholder="请输入联系人" />)}
                </Form.Item>
                <Form.Item label="联系电话">
                    {getFieldDecorator('mobilePhone', {
                        rules: [{ pattern: /^(((\d{3,4}-)?\d{7,8})|(1\d{10}))$/, message: '请输入固话号码或者手机号码' }],
                        initialValue: mobilePhone
                    })(<Input placeholder="请输入联系电话" />)}
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24 }}>
                    <div className="ant-col ant-col-4 ant-form-item-label"></div>
                    <div>
                        <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
                    </div>
                </Form.Item>
            </Form>
        )
    }
}


const ContactInformationForm = Form.create({ name: 'contact-information' })(ContactInformation);


export default ContactInformationForm;