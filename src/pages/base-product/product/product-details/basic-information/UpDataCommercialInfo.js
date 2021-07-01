import React, { Component } from 'react';
import { post,Paths } from '../../../../../api';
import { Form, Input } from 'antd';
import DoubleBtns from '../../../../../components/double-btns/DoubleBtns';
import TextAreaCounter from '../../../../../components/textAreaCounter/TextAreaCounter';
import { UploadFileClass } from '../../../../../components/upload-file';
import { UploadFileDataBackfill } from '../../../../../util/util';

import './UpDataCommercialInfo.scss';
class UpDataCommercialInfoForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            size:'',//尺寸
            weight:'',//重量
            productParam:'',//产品参数
            introduction:'',//产品介绍
            supplier:'',//供应商公司名称
            contact:'',//供应商联系人
            tel:'',//供应商联系电话
            productPic:[],//产品成品图片链接数组【数组中修改文件的原始位置传空串】
            instruction:[],//说明书链接数组【数组中修改文件的原始位置传空串】
        }
        this.imgBack = false;
        this.fileBack = false;
    }
    componentDidMount() {
        let productId = this.props.productId;
        if(productId){
            post(Paths.getCommerceInfo,{productId},{loading:true}).then((model) => {//获取详情
                if(model.code==0){
                    let data = model.data;
                    this.setState({
                        size:data.size,//尺寸
                        weight:data.weight,//重量
                        productParam:data.productParam,//产品参数
                        introduction:data.introduction,//产品介绍
                        supplier:data.supplier,//供应商公司名称
                        contact:data.contact,//供应商联系人
                        tel:data.tel,//供应商联系电话
                    });
                    let productPic = model.data.productPic?JSON.parse(model.data.productPic):[],
                        productPicList = UploadFileDataBackfill(productPic);//将数接口返回得文件列表，传入处理成满足回填得格式。
                    if(productPic&&productPic.length>0){
                        if(productPic[0]==""){
                            productPicList = [];
                        }
                        this.imgForm.setState({
                            fileList:productPicList
                        });
                    }
                    let instruction = model.data.instruction?JSON.parse(model.data.instruction):[],
                        instructionList = UploadFileDataBackfill(instruction);//将数接口返回得文件列表，传入处理成满足回填得格式。
                        if(instruction&&instruction.length>0){
                            if(instruction[0]==""){
                                instructionList = [];
                            }
                            this.fileForm.setState({
                                fileList:instructionList//说明书链接数组【数组中修改文件的原始位置传空串】
                            }); 
                        }
                    }
            });
        }
    }
    click_1 = ()=> {
        this.props.upData();
    }
    //发布产品
    click_2 = (e)=> {
        e.preventDefault();
        const { validateFieldsAndScroll,resetFields } = this.props.form;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let data = values,
                    productId = this.props.productId,
                    obj = {
                        productId,
                    };
                data.productPic = this.imgForm.getFileList();
                if(data.productPic.length>0){//多文件提交需要按这种格式来
                    data.productPic = JSON.stringify(data.productPic.map((item,index)=>{
                        return {
                            file:null,
                            filename:item.name,
                            filesrc:item.url
                        }
                    }));
                }else{
                    data.productPic = '';
                }
                data.instruction = this.fileForm.getFileList();
                if(data.instruction.length>0){//多文件提交需要按这种格式来
                    data.instruction = JSON.stringify(data.instruction.map((item,index)=>{
                        return {
                            file:null,
                            filename:item.name,
                            filesrc:item.url
                        }
                    }));
                }else{
                    data.instruction = '';
                }

                for (var key in data) {//将null得参数转为''，
                    if (!!data[key]) {
                        obj[key] = data[key];
                    }else{
                            obj[key] = '';
                    }
                }

                post(Paths.saveCommerceInfo,obj,{needFormData:true,loading:true}).then((model) => {
                    if(model.code==0){
                        this.props.upData(true);
                    }
                });
            }
        });
    }
    weightCheck = (rule, value, callback)=> {
        if((+value!=0&&!+value)||+value>2147483647){
            callback('重量的输入值应为数字且小于2147483647');
        }else{
            callback();
        }
    }
    render() {
        let {
            size,//尺寸
            weight,//重量
            productParam,//产品参数
            introduction,//产品介绍
            supplier,//供应商公司名称
            contact,//供应商联系人
            tel,//供应商联系电话
        } = this.state;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 2 },
                sm: { span: 2 },
            },
            wrapperCol: {
                xs: { span: 18 },
                sm: { span: 18 },
            },
        };

        return (
            <Form {...formItemLayout} onSubmit={this.click_2}  className='commercialInfo'>
                <div className="commercialInfo">
                    <div className='commonContentBox marginFR'>
                        <div className='title'>
                            商业化信息
                            <span className='explain'>填写商业化信息，以便于确保您的产品真实合法有效</span>
                        </div>
                        <div className='centent'>
                            <div className='common_title_input'>
                                <Form.Item label='成品照片：'>
                                    {/* <UploadFile onRef={ref => this.imgForm = ref} maxcount='9' format='jpg,png' maxsize={10*1024} /> */}
                                    <UploadFileClass onRef={el => this.imgForm = el} maxCount='9' format='.jpg,.png' maxSize={10} />
                                </Form.Item>
                            </div>
                            <Form.Item label='尺寸：'>
                                {getFieldDecorator('size', {
                                    rules: [{ max: 20, message: '最大输入长度为20' }],
                                    initialValue:size
                                })(
                                    <Input style={{width:'350px'}} placeholder="请输入您的尺寸 例:50*30*20" suffix="mm" />
                                )}
                            </Form.Item>
                            <Form.Item label='重量：'>
                                {getFieldDecorator('weight', {
                                    rules: [{ validator:this.weightCheck, message: '重量的输入值应为数字且小于2147483647'}],
                                    initialValue:weight&&weight+''
                                })(
                                    <Input style={{width:'350px'}} placeholder="请输入您的重量 例:10" suffix="Kg" />
                                )}
                            </Form.Item>
                            <TextAreaCounter
                                label="产品参数："
                                formId='productParam'
                                astrictNub='1000'
                                rows='5' 
                                placeholder='产品参数,1000字符以内' 
                                getFieldDecorator={getFieldDecorator}
                                initialVal={productParam}
                                getFieldValue={getFieldValue}
                            />
                            <TextAreaCounter
                                label="产品介绍："
                                formId='introduction'
                                astrictNub='1000'
                                rows='5' 
                                placeholder='产品介绍,1000字符以内' 
                                getFieldDecorator={getFieldDecorator}
                                initialVal={introduction}
                                getFieldValue={getFieldValue}
                            />
                        </div>
                    </div>
                    <div className='commonContentBox marginFR'>
                        <div className='title'>
                            产品附件
                        </div>
                        <div className='centent'>
                            <div className='common_title_input'>
                                <span className='common_title'>产品说明书：</span>
                                <div className='common_content'>
                                    {/* <UploadFile onRef={ref => this.fileForm = ref} maxcount='5' isNotImg={true} format='doc,docx,pdf,jpg,png' maxsize={20*1024} upFileShowType={true} /> */}
                                    <UploadFileClass onRef={el => this.fileForm = el} maxCount='5' isNotImg={true} format='.doc,.docx,.pdf,.jpg,.png' maxSize={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='commonContentBox marginFR'>
                        <div className='title'>
                            供应链信息
                            <span className='explain'>填写商业化信息，以便于确保您的产品真实合法有效</span>
                        </div>
                        <div className='centent'>
                            <Form.Item label='供应商公司：'>
                                {getFieldDecorator('supplier', {
                                    rules: [{ max: 40, message: '最大输入长度为40' }],
                                        initialValue:supplier
                                })(
                                    <Input style={{width:'350px'}} placeholder="请输入您的供应商公司名称" />
                                )}
                            </Form.Item>
                            <Form.Item label='联系人：'>
                                {getFieldDecorator('contact', {
                                    rules: [{ max: 20, message: '最大输入长度为20' }],
                                        initialValue:contact
                                })(
                                    <Input style={{width:'350px'}} placeholder="请输入您的联系人姓名" />
                                )}
                            </Form.Item>
                            <Form.Item label='联系方式：'>
                                {getFieldDecorator('tel', {
                                    rules: [{ max: 20, message: '最大输入长度为20' }],
                                        initialValue:tel
                                })(
                                    <Input style={{width:'350px'}} placeholder="请输入您的联系人方式" />
                                )}
                            </Form.Item>
                        </div>
                    </div>
                    <DoubleBtns
                        preHandle={this.click_1}
                        nextText={this.props.isEdit ? '更新' :'发布产品'}
                        nextHandle={this.click_2}
                    />
                </div>
            </Form>
        )
    }
}
export const UpDataCommercialInfo = Form.create({
    name: 'UpDataCommercialInfo',
})(UpDataCommercialInfoForm);