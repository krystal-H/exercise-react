import React, { Component } from 'react';
import { withRouter } from "react-router"
import { get,post,Paths } from '../../../../../api';
import defaultIocn from '../../../../../assets/images/defaultIocn.png';
import {Notification} from '../../../../../components/Notification';
import NoSourceWarn from '../../../../../components/no-source-warn/NoSourceWarn';
import {UpDataCommercialInfo} from './UpDataCommercialInfo';
import moment from 'moment';
import { Icon, Tooltip } from 'antd';

import './info.scss';

class Info extends Component {
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
        this.moduleDetails = this.moduleDetails.bind(this);
        this.download = this.download.bind(this);
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
    moduleDetails(url){
        window.open(url);
    }
    download(url){
        if(!url){
            Notification({
                description:'下载地址为空！',
            });
            return false;
        }
        window.location = url;
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
                        <div className='title'>商业化信息</div>
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
        let {
            burnFileName,
            libraryFileName,
            burnFileVersion,
            libraryFileVersion,
            hetModuleTypeName,
            bindTypeName,
            netTypeName,
            supportFileTransfer,
            communicateSpeed,
            applyScope,
            originalModuleTypeName,
            readmePdf,
            modulePicture,
            burnFile,
            libraryFile,
            createTime,
            modifyTime,
            sourceCodeName,
            sourceCodeVersion,
            sourceCode
        } = publishProductInfo.moduleInfo;
        let moduleInfo = publishProductInfo.moduleInfo;
        let sizes = (moduleInfo.sizeHeight||'-'+' * ')+(moduleInfo.sizeThickness||'-'+' * ')+(moduleInfo.sizeWidth||'-');
        let {hardwareType,commFreq} = publishProductInfo.productBaseInfo,
        mode = publishProductInfo.commerceInfo?publishProductInfo.commerceInfo.mode:null;
        return (
            <div>
                {upDataShow?
                    <UpDataCommercialInfo upData={this.upData} productId={this.props.productId} />
                    :
                    <div className="product_info">
                        <div className='commonContentBox'>
                            <div className='title'>
                                硬件实现方案
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
                                <h4>独立MCU方案</h4>
                                <p>通信模组负责与云端信息的交互，通过串口与主控板（即MCU）进行通信，需要在MCU上进行协议解析与外设控制的开发。独立MCU方案能提供更丰富的系统资源，适合复杂的智能硬件设备。</p>
                            </div>
                        </div>
                        <div className='commonContentBox'>
                            <div className='title'>通信模组</div>
                            <div className='centent'>
                                <div className='strategy'>
                                    <div className="strategy-content"  >
                                        <img className="strategy-img" src={modulePicture?modulePicture:defaultIocn}></img>
                                        <div className='moduleTypeName'>{hetModuleTypeName}</div>
                                        <div className='moduleDetails'>
                                            <span>芯片：&nbsp;</span>
                                            <span>{originalModuleTypeName?originalModuleTypeName:'--'}</span>
                                        </div>
                                        <div className='moduleDetails'>
                                            <span>尺寸：&nbsp;</span>
                                            {/* 长*宽*厚 */}
                                            <span>{sizes?sizes:'--'}</span>
                                        </div>
                                        <div className='moduleDetails single-text'>
                                            <span>适用：&nbsp;</span>
                                            <Tooltip placement="topLeft" title={applyScope?applyScope:'--'}>
                                                <span>{applyScope?applyScope:'--'}</span>
                                            </Tooltip>
                                        </div>
                                        <div className='moduleLink' onClick={this.moduleDetails.bind(this,readmePdf)}>模组详情</div>
                                    </div>
                                </div>
                                <div className='table'>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td>支持通信技术</td>
                                                    <td>{bindTypeName?bindTypeName:'--'}</td>   
                                                </tr>
                                                <tr>
                                                    <td>支持配网方式</td>
                                                    <td>{netTypeName?netTypeName:'--'}</td>
                                                </tr>
                                                <tr>
                                                    <td>文件传输能力</td>
                                                    <td>{supportFileTransfer==null?'--':supportFileTransfer==0?'否':'是'}</td>
                                                </tr>
                                                <tr>
                                                    <td>通信通讯速率</td>
                                                    <td>{communicateSpeed?communicateSpeed:'--'}</td>
                                                </tr>
                                                <tr>
                                                    <td>数据上报频率</td>
                                                    <td>{commFreq?commFreq:'--'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='download'>
                                        <p>您选择的模组有通用固件程序，您可以下载固件程序自行烧录。</p>
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td width='25%'>已选模组：</td>
                                                    <td width='75%'>{hetModuleTypeName}</td>
                                                </tr>
                                                <tr>
                                                    <td width='25%'>固件程序：</td>
                                                    <td width='75%'>{hardwareType==0?burnFileName:sourceCodeName}</td>
                                                    
                                                </tr>
                                                <tr>
                                                    <td width='25%'>固件版本：</td>
                                                    <td width='75%'>{hardwareType==0?burnFileVersion:sourceCodeVersion}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className='commonButBox'>
                                            <div className='commonButs' onClick={this.download.bind(this,hardwareType==0?burnFile:sourceCode)} >
                                                {hardwareType==0?'下载固件程序':'下载模组源码'}
                                            </div>
                                        </div>
                                        {/* <div className='explain'><a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank'>模组烧录指南</a></div> */}
                                    </div>
                            </div>
                        </div>
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

export default withRouter(Info)