import React, { Component } from 'react';
import { withRouter } from "react-router"
import { post,Paths } from '../../../../../api';
import NoSourceWarn from '../../../../../components/no-source-warn/NoSourceWarn';
import {UpDataCommercialInfo} from './UpDataCommercialInfo';
import moment from 'moment';
import { Icon } from 'antd';

import './info.scss';

class CommercailInfo extends Component {
    constructor(props){
        super(props);
        this.state = {
            publishProductInfo:{
                commerceInfo:{},
                moduleInfo:{},
                productBaseInfo:{},
            },
            upDataShow:false,
        }
        this.clickFile = this.clickFile.bind(this);
        this.upData = this.upData.bind(this);
        this.getPublishProductInfoFun = this.getPublishProductInfoFun.bind(this);
    }
    getPublishProductInfoFun(){
        post(Paths.getPublishProductInfo,{productId:this.props.productId},{loading:true}).then((model) => {
            if(model.code==0){
                this.setState({publishProductInfo:model.data});
            }
        });
    }
    componentDidMount() {
        if(this.props.productId){
            this.getPublishProductInfoFun();
        }
    }
    componentDidUpdate(prevProps){
        if(this.props.productId&&(prevProps.productId!= this.props.productId)){
            this.getPublishProductInfoFun();
        }
    }
    clickFile(url){
        window.open(url);
    }
    upData(type,e){//mode   审核状态（0-审核中，1-通过 ，2-驳回）
        if(type){
            this.getPublishProductInfoFun();
        }
        this.setState({upDataShow:!this.state.upDataShow});
    }
    render() {
        let {publishProductInfo,upDataShow} = this.state;
        let html = null;

        let {
            createTime,
            modifyTime,
        } = publishProductInfo.moduleInfo;

        let mode = publishProductInfo.commerceInfo?publishProductInfo.commerceInfo.mode:null;

        if(publishProductInfo.commerceInfo){//commerceInfo对象，会返回为null的情况，
            let {
                supplier,
                contact,
                tel,
                size,
                weight,
                introduction,
                productParam,
                instruction,
                productPic,
            } = publishProductInfo.commerceInfo;
            html = (
                <div>
                    <div className='commonContentBox'>
                        <div className='title'>商业化信息
                            {
                                    mode==0?<div className='update_box'>
                                            <span className='update under_review'>审核中</span>
                                        </div>
                                        :<div className='update_box'>
                                            <span className='createTime'>{moment(modifyTime?modifyTime:createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                                            <span className='update' onClick={this.upData.bind(this,false)}>
                                                <Icon type="undo" style={{marginRight:'10px'}} />
                                                更新
                                            </span>
                                        </div>
                                }
                        </div>
                        <div className='centent'>
                            <div className='introductionBar'>
                                <div className='common_title_input'>
                                    <span className='common_title'>成品图片：</span>
                                    <div className='common_content'>
                                        {productPic?JSON.parse(productPic).map((item,index)=>{
                                            return <img className='productPic' key={'成品图片'+index} src={item.filesrc} />
                                        }):'--'}
                                    </div>
                                </div>
                                <div className='common_title_input'>
                                    <span className='common_title'>尺寸：</span>
                                    <div className='common_content'>
                                        <span>{size||'--'}&nbsp;mm</span>
                                    </div>
                                </div>
                                <div className='common_title_input'>
                                    <span className='common_title'>重量：</span>
                                    <div className='common_content'>
                                        <span>{weight||'--'}&nbsp;Kg</span>
                                    </div>
                                </div>
                                <div className='common_title_input'>
                                    <div className='common_title'>产品参数：</div>
                                    <div className='common_content'>
                                        {productParam}
                                    </div>
                                </div>
                                <div className='common_title_input'>
                                    <span className='common_title'>产品介绍：</span>
                                    <div className='common_content'>
                                        <span>{introduction||'--'}</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <div className='commonContentBox'>
                        <div className='title'>产品附件</div>
                        <div className='centent'>
                            <div className='common_title_input'>
                                <span className='common_title'>产品附件：</span>
                                <div className='common_content'>
                                    {
                                        instruction?JSON.parse(instruction).map((item,index)=>{
                                            return <div className='links' key={'产品附件'+index} onClick={this.clickFile.bind(this,item.filesrc)} >{item.filename}</div>
                                        }):null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='commonContentBox'>
                        <div className='title'>供应链信息</div>
                        <div className='centent'>
                            <div className='common_title_input'>
                                <span className='common_title'>供应商公司：</span>
                                <div className='common_content'>
                                    <span>{supplier||'--'}</span>
                                </div>
                            </div>
                            <div className='common_title_input'>
                                <span className='common_title'>联系人：</span>
                                <div className='common_content'>
                                    <span>{contact||'--'}</span>
                                </div>
                            </div>
                            <div className='common_title_input'>
                                <span className='common_title'>联系方式：</span>
                                <div className='common_content'>
                                    <span>{tel||'--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {upDataShow?
                    <UpDataCommercialInfo upData={this.upData} productId={this.props.productId} isEdit={true}/>
                    :
                    <div className="product_info">
                    {
                            publishProductInfo.commerceInfo?
                            html:<div>
                                    <div className='commonContentBox'>
                                        <div className='title'>商业化信息</div>
                                        <div className='centent'>
                                            <NoSourceWarn/>
                                        </div>
                                    </div>
                                    <div className='commonContentBox'>
                                        <div className='title'>产品附件</div>
                                        <div className='centent'>
                                            <NoSourceWarn/>
                                        </div>
                                    </div>
                                    <div className='commonContentBox'>
                                        <div className='title'>供应链信息</div>
                                        <div className='centent'>
                                            <NoSourceWarn/>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                }
            
            </div>
        )
    }
}

export default withRouter(CommercailInfo)