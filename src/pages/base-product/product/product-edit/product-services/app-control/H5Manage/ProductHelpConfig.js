import React, { Component } from 'react';
import { Button, Icon, Tabs, Select, Upload } from 'antd';
import appHelperGuide from '../../../../../../../assets/images/product/app-helper-guide.png';
import appBindDeviceFail from '../../../../../../../assets/images/product/bind-device-fail.png';
import UploadFile from '../../../../../../../components/upFile/UploadFile';
import { get,post,Paths } from '../../../../../../../api';
import {Notification} from '../../../../../../../components/Notification';
import DescWrapper from '../../../../../../../components/desc-wrapper/DescWrapper';

import './ProductHelpConfig.scss';

const { TabPane } = Tabs;
const { Option } = Select;


export default class ProductHelpConfig  extends Component {

    constructor(props){
        super(props);
        this.state = {
            configguide:"",//"1" 配置联网指引，"2" 不配置
            configguidepage:"",
            configfail:"",//"1" 配置联网失败指引，"2" 不配置
            configfailpage:"",
            displayMode:0,//帮助方式 图片轮播：0,暂固定为0
            helpId:null,
        }
        this.saveconfigguide = this.saveconfigguide.bind(this);
        this.saveconfigfail = this.saveconfigfail.bind(this);
        this.selectConfigGuid = this.selectConfigGuid.bind(this);
        this.saveHelpImg = this.saveHelpImg.bind(this);
        this.changeTab = this.changeTab.bind(this);         
        
    }
    componentDidMount() {
        this.getLinkConfiguration(1);
    }

    //更新 联网配置或失败指引type 1 联网配置， 2 失败指引
    getLinkConfiguration(type){
        let productId = this.props.productId;
        get(Paths.getLinkConfiguration,{productId,helpType:type}).then((model) => {
            if(model.code==0){
                let guidePage = model.data&&model.data.guidePage;
                if(guidePage){
                    let fileList = [
                        {
                            file:null,
                            filename:guidePage,
                            filesrc:guidePage
                        }
                    ];
                    if(type==1){
                        this.setState({configguide:'1',configguidepage:guidePage});
                        this.addFirmwareInput.setState({fileList});
                    }else if(type==2){
                        this.setState({configfail:'1',configfailpage:guidePage});
                        this.visitConfigFailState.setState({fileList});
                    }
                }else{
                    if(type==1){
                        this.setState({configguide:'2',configguidepage:""});
                    }else if(type==2){
                        this.setState({configfail:'2',configfailpage:""});
                    }
                    
                }
            }
        });
    }
    //更新 使用帮组
    getLinkHelpImg(){
        let productId = this.props.productId;
        post(Paths.getLinkHelpImg,{productId,version:1.1}).then((model) => {
            let datalist = [];
            if(model.code==0){
                datalist = JSON.parse(model.data.imageUrlList);
                if(datalist[0]==""){
                    datalist = [];
                }
                this.setState({
                    helpId:model.data.helpId||null
                });
                let fileList = [];
                datalist.map((item)=>{
                    if(item!=""){
                        fileList.push({
                            file:null,
                            filename:item,
                            filesrc:item
                        })
                    }
                });
                this.visitHelpImg.setState({fileList});
            }
            
            
        });

    }

    //是否配置下拉选择 v:1 配置 、2 不配置;  type: configguide、configfail 
    selectConfigGuid(v,type){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        let obj = {};
        obj[type] = v;
        this.setState(obj,()=>{
            if(v==1){
                let { configguidepage, configfailpage } = this.state;
                let fileList = [
                    {
                        file:null,
                        filename:configguidepage,
                        filesrc:configguidepage
                    }
                ]
                if(type=="configguide"&&configguidepage){
                    this.addFirmwareInput.setState({fileList});
                }else if(type == "configfail"&&configfailpage){
                    fileList.filename = configfailpage;
                    fileList.filesrc = configfailpage;
                    this.visitConfigFailState.setState({fileList});
    
                }
            }

        });
        
    }
    saveconfigguide(){
        let {productId} = this.props;
        let {configguide} = this.state;
        let data = {
            productId:productId,
            helpType:1
        }

        if(configguide == "2"){
            get(Paths.netWorkDelete,data).then((model) => {
                if(model.code==0){
                    Notification({
                        type:'success',
                        description:'保存成功',
                        duration:2
                        
                    });
                    this.getLinkConfiguration(1);
                }
            });
        }else if(configguide == "1"){
            let fileList = this.addFirmwareInput.state.fileList;
            if(fileList.length==0){
                Notification({
                    description:'请添加图片',
                    duration:2
                });
            }else{
                let file = fileList[0].file;
                if(!file){ //没有更新文件
                    Notification({
                        type:'success',
                        description:'保存成功',
                        duration:2
                    });
                }else{
                    data.guideType = 1;
                    data.guideFiles = file;
                    post(Paths.netWorkAddAndUpdate,data,{needFormData:true}).then((model) => {
                        if(model.code==0){
                            Notification({
                                type:'success',
                                description:'保存成功',
                                duration:2
                            });
                            this.getLinkConfiguration(1);
                        }
                    });

                }
            }
        }

    }
    saveconfigfail(){
        let {productId} = this.props;
        let {configfail} = this.state;
        let data = {
            productId:productId,
            helpType:2
        }
        if(configfail == "2"){
            get(Paths.netWorkDelete,data).then((model) => {
                if(model.code==0){
                    Notification({
                        type:'success',
                        description:'保存成功',
                        duration:2
                    });
                    this.getLinkConfiguration(2);
                }
            });
        }else if(configfail == "1"){
            let fileList = this.visitConfigFailState.state.fileList;
            if(fileList.length==0){
                Notification({
                    description:'请添加图片',
                    duration:2
                });
            }else{
                let file = fileList[0].file;
                if(!file){ //没有更新文件
                    Notification({
                        type:'success',
                        description:'保存成功',
                        duration:2
                    });
                }else{
                    data.guideType = 1;
                    data.guideFiles = file;
                    post(Paths.netWorkAddAndUpdate,data,{needFormData:true}).then((model) => {
                        if(model.code==0){
                            Notification({
                                type:'success',
                                description:'保存成功',
                                duration:2
                            });
                            this.getLinkConfiguration(2);
                        }
                    });
               }
            }
        }
        
    }
    saveHelpImg(){
        this.visitHelpImg.upToTencentCloud((srclist)=>{
            if(srclist.length > 0){
                post(Paths.saveLinkHelpImg,{
                    productId:this.props.productId,
                    helpId:this.state.helpId,
                    displayMode:0,
                    imageUrlList:JSON.stringify(srclist),
                    version:1.1
                }).then((model) => {
                    if(model.code==0){
                        Notification({
                            type:'success',
                            description:'保存成功',
                            duration:2
                        });
                        this.getLinkHelpImg();
                    }
                });
            }else{
                Notification({
                    description:'请先上传文件',
                    duration:2
                });
            }
        });
        
    }
    changeTab(key){
        if(key=="0"){
            this.getLinkConfiguration(1);
        }else if(key=="1"){
            this.getLinkConfiguration(2);
        }else if(key=="2"){
            this.getLinkHelpImg();
        }  
    }

    render(){
        let { configguide,configfail } = this.state;
        return (
            <section className="app-help-wrapper section-bg">
                <h3>产品帮助配置</h3>
                <div className="app-help-tab">
                    <Tabs defaultActiveKey="0" onChange={this.changeTab}>
                        <TabPane tab="联网配置" key="0">
                            <DescWrapper desc={['若您的产品支持Wi-Fi或蓝牙配置能力，建议您设置配置时的用户指引图片，方便用户正确绑定设备。若不配置联网指引，APP将使用默认的联网指引图片。']}></DescWrapper>
                            <Select value={configguide} style={{ width: 200, marginTop: 12 }} onChange={value => this.selectConfigGuid(value,"configguide")}>
                                <Option value="1">配置联网指引</Option>
                                <Option value="2">不配置联网指引</Option>
                            </Select>
                            <div className="img-wrapper guide">
                                <img src={appHelperGuide} alt="指引图片" />
                            </div>
                            <div className="bind-explain">
                                <div className="title"><span></span>绑定指引：</div>
                                <span>1.长按开关键几秒；</span>
                                <span>2.Wi-Fi指示灯开始闪烁，设备进入绑定状态，如果没有，请重复步骤1；</span>
                                <span>3.点击绑定设备按钮</span>
                            </div>
                            {configguide=="1"&&
                            <UploadFile onRef={ref => this.addFirmwareInput = ref} maxsize='500' format='gif,jpeg,jpg,png' explainTxt="上传自定义配置文件，页面中部加载该图片，支持gif,jpeg,jpg,png格式，大小不超过500k" />
                            }
                            <Button style={{float:"right"}} type="" onClick={this.saveconfigguide}>保存</Button>
                        </TabPane>
                        <TabPane tab="联网失败指引" key="1">
                            <DescWrapper desc={['可配置联网失败指引信息，在产品联网失败时，用户可以根据指引解决问题顺利联网。若不配置联网失败指引，APP将显示空白。']}></DescWrapper>
                            <Select value={configfail} style={{ width: 200, marginTop: 12 }} onChange={value => this.selectConfigGuid(value,"configfail")}>
                                <Option value="1">配置联网失败指引</Option>
                                <Option value="2">不配置联网失败指引</Option>
                            </Select>
                            <div className="img-wrapper fail">
                                <img src={appBindDeviceFail} alt="联网失败" />
                            </div>
                            <div className="bind-explain">
                                <span>1.检查Wi-Fi网络是否正常；</span>
                                <span>2.检查设备是否正常进入绑定状态；</span>
                            </div>
                            {configfail=="1"&&
                            <UploadFile onRef={ref => this.visitConfigFailState = ref} maxsize='500' format='gif,jpeg,jpg,png' explainTxt="上传自定义配置文件，页面中部加载该图片，支持gif,jpeg,jpg,png格式，大小不超过500k"  />
                            }
                            <Button style={{float:"right"}} type="" onClick={this.saveconfigfail}>保存</Button>
                        </TabPane>
                        <TabPane tab="使用帮助" key="2">
                            <DescWrapper desc={['若您在APP添加了设备的“使用帮助”菜单,在这里可以维护管理“使用帮助”的素材。']}></DescWrapper>
                            帮助信息显示样式：
                            <Select defaultValue="1" style={{ width: 200, marginTop: 12, marginLeft: 10 }} >
                                <Option value="1">图片轮播</Option>
                            </Select>
                            <p style={{padding:"10px 0 20px 133px",color:"#8C8C8C",fontSize:'14px'}}>最多可添加5张图片素材，客户端左右滑动切换素材;</p>
                            图片素材：<br/><br/>
                            <UploadFile onRef={ref => this.visitHelpImg = ref} maxcount={5} maxsize='500' format='gif,jpeg,jpg,png' explainTxt="支持gif,jpeg,jpg,png格式，大小不超过500k，建议素材宽度为375px" />

                            <Button style={{float:"right"}} type="" onClick={this.saveHelpImg}>保存</Button>

                        </TabPane>
                    </Tabs>
                </div>
            </section>
        )
    }
}
