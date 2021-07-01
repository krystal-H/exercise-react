import React, { Component } from 'react';
import { post,Paths } from '../../../../../api';
import { connect } from 'react-redux';
import { Form, Input} from 'antd';
import DoubleBtns from '../../../../../components/double-btns/DoubleBtns';
import TextAreaCounter from '../../../../../components/textAreaCounter/TextAreaCounter';
import { UploadFileClass } from '../../../../../components/upload-file';
import { UploadFileDataBackfill } from '../../../../../util/util';
import RouterPrompt from '../../../../../components/router-prompt/router-prompt'

import './CommercialInfo.scss';

let EDIT_STATUS = false;

const mapStateToProps = state => {
    return {
        productConfigSteps: state.getIn(['product','productConfigSteps']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        // getCatalogList: () => dispatch(getCatalogListAction()),
    }
}

@connect(mapStateToProps, mapDispatchToProps)
class CommercialInfoForm extends Component {
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
            firstTimeState:null,
        }
        this.imgBack = false;
        this.fileBack = false;
        this.click_1 = this.click_1.bind(this);
        this.click_2 = this.click_2.bind(this);
    }
    componentWillUnmount () {
        EDIT_STATUS = false;
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
                        firstTimeState:!!data.createTime,
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
    click_1(){
        this.props.history.push({
            pathname: `/open/base/product/edit/${this.props.productId}/service/serviceselect`
        });
    }
    //发布产品
    click_2(e){
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let data = values,
                productId = this.props.productId,
                obj = {
                    productId:productId,
                },
                tag = false;
                data.productId = productId;
                
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
                        tag = true;
                    }else{
                        obj[key] = '';
                    }
                }

                EDIT_STATUS = false;
                this.forceUpdate( () => {
                    if(this.state.firstTimeState||tag){//firstTimeState 是否是第一次编辑保存商业发布，true为不是，false为是。
                        post(Paths.saveCommerceInfo,obj,{needFormData:true,loading:true}).then((model) => {
                            if(model.code==0){
                                this.props.history.push({
                                    pathname: `/open/base/product/edit/${productId}/applyRelease`
                                });
                            }
                        });
                    }else{
                        this.props.history.push({
                            pathname: `/open/base/product/edit/${productId}/applyRelease`
                        });
                    }
                })
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
        const {canOperate} = this.props;
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
                <RouterPrompt promptBoolean={EDIT_STATUS}></RouterPrompt>
                <div className="commercialInfo">
                    <div className='commonContentBox marginFR'>
                        <div className='title'>
                            商业化信息
                            <span className='explain'>填写商业化信息，以便于确保您的产品真实合法有效</span>
                        </div>
                        <div className='centent'>
                            <div className='common_title_input'>
                                <Form.Item label='成品照片：'>
                                    <UploadFileClass disabled={!canOperate} onRef={el => this.imgForm = el} maxCount='9' format='.jpg,.png' maxSize={10} />
                                </Form.Item>
                            </div>
                            <Form.Item label='尺寸：'>
                                {getFieldDecorator('size', {
                                    rules: [{ max: 20, message: '最大输入长度为20' }],
                                    initialValue:size
                                })(
                                    <Input disabled={!canOperate} style={{width:'350px'}} placeholder="请输入您的尺寸 例:50*30*20" suffix="mm" />
                                )}
                            </Form.Item>
                            <Form.Item label='重量：'>
                                {getFieldDecorator('weight', {
                                    rules: [{ validator:this.weightCheck, message: '重量的输入值应为数字且小于2147483647'}],
                                    initialValue:weight&&weight+''
                                })(
                                    <Input disabled={!canOperate} style={{width:'350px'}} placeholder="请输入您的重量 例:10" suffix="Kg" />
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
                                disabled={!canOperate}
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
                                disabled={!canOperate}
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
                                    <UploadFileClass disabled={!canOperate} onRef={el => this.fileForm = el} maxCount='5' isNotImg={true} format='.doc,.docx,.pdf,.jpg,.png' maxSize={20} />
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
                                    <Input disabled={!canOperate} style={{width:'350px'}} placeholder="请输入您的供应商公司名称" />
                                )}
                            </Form.Item>
                            <Form.Item label='联系人：'>
                                {getFieldDecorator('contact', {
                                    rules: [{ max: 20, message: '最大输入长度为20' }],
                                        initialValue:contact
                                })(
                                    <Input disabled={!canOperate} style={{width:'350px'}} placeholder="请输入您的联系人姓名" />
                                )}
                            </Form.Item>
                            <Form.Item label='联系方式：'>
                                {getFieldDecorator('tel', {
                                    rules: [{ max: 20, message: '最大输入长度为20' }],
                                        initialValue:tel
                                })(
                                    <Input disabled={!canOperate} style={{width:'350px'}} placeholder="请输入您的联系人方式" />
                                )}
                            </Form.Item>
                        </div>
                    </div>
                    <div className="com-footer">
                        <DoubleBtns
                            preHandle={this.click_1}
							nextBtn={canOperate}
                            nextText='发布产品'
                            nextHandle={this.click_2}
                        />
                    </div>
                </div>
            </Form>
        )
    }
}
export const CommercialInfo = Form.create({
    name: 'CommercialInfo',
    onValuesChange:  () => {
        EDIT_STATUS = true;
    }
})(CommercialInfoForm);