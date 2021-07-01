import React, { Component } from 'react'
import { Button, Icon, Input, Divider,Table } from 'antd'
import { Notification} from '../../../../../../../components/Notification'
import {cloneDeep} from 'lodash'
import { addKeyToTableData} from '../../../../../../../util/util';
import {Paths,post,axios} from '../../../../../../../api';
import ActionConfirmModal from '../../../../../../../components/action-confirm-modal/ActionConfirmModal';
import AloneSection from '../../../../../../../components/alone-section/AloneSection';
import FlowChart from '../../../../../../../components/flow-chart/FlowChart';
import './H5Manage.scss';

import {H5Status,projectType} from '../../../../../../../configs/text-map';
import {H5AddForm,H5PagePublish,H5TemplateManage} from './H5ManageModals';

import ProductHelpConfig from "./ProductHelpConfig";
const { Search } = Input;

const flowLists = [
    {
        title:'创建H5页面'
    },
    {
        title:'配置产品帮助'
    },
    {
        title:'调试H5页面'
    },
    {
        title:'发布H5页面'
    }
]

export default class H5Manage extends Component {
    state = {
        h5AddVisible:false, // 创建框展示状态
        h5AddLoading:false, // 创建按钮的loading状态
        sdkEdit:null,  // sdk模式的页面，编辑时复用创建弹框重新上传压缩包，此字段用于标记是否为sdk编辑，并且传递编辑数据
        h5CopyVisible:false, // 页面复制框状态
        copyLoading:false, // 复制按钮loading状态
        h5DeleteVisible:false, // 页面删除框状态
        deleteLoading:false, // 页面删除按钮loading状态
        h5PublishVisible:false, // 发布框状态
        publishType:null, // 发布类型；发布正式时，选中APP需要获取是否已经在该APP存在发布过的页面，并进行提示 3：灰度，4：正式
        publishLoading:false, // 发布按钮loading状态
        h5OffLineVisible:false, // 下线框状态
        offLineLoading:false, // 下线按钮loading状态
        currentOperateItem:null, // 当前正在操作的页面数据 （复制，删除，下线，发布）
        projectType:'2', // 创建页面的类型（1-sdk开发，2-在线编辑）
        listPager: {  // 页面列表的分页管理
            pageRows:20,
            pageIndex:1
        },
        projectName:'', // 页面搜索的输入框字段
        h5TemplateVisible:false, // 模板市场弹框状态
        h5TemplatesLists: null, // 模板数据存放 --- 目前时只会请求一次；TODO:这里可以考虑改成每次请求
        firstTemplateDetail:null, // 打开弹框时，默认展示第一个模板的详情
        firstTemplateAnalysis:null, // 打开弹框时，默认展示第一个模板的分析
        isKeepEvent:true, // 模板是否保留事件
        templateDetail:null // 模板详情 -- 选中模板后保存，传给创建框
    }
    constructor(props) {
        super(props);
        this.h5PageColumns = [
            {
                title: 'ID',
                dataIndex: 'projectId',
                key: 'projectId',
            },
            {
                title: '页面名称',
                dataIndex: 'projectNameVersion',
                key: 'projectNameVersion',
            },
            {
                title: '模式',
                dataIndex: 'projectType',
                key: 'projectType',
                render: (text, record) => (
                    <span>
                        {projectType[record.projectType]}
                    </span>
                )
            },
            {
                title: '发布应用',
                dataIndex: 'appName',
                key: 'appName',
            },
            {
                title: '状态',
                dataIndex: 'judgeStatu',
                key: 'judgeStatu',
                render: (text, record) => (
                    <span className={`h5-statu-${record.judgeStatu}`}>
                        {H5Status[record.judgeStatu]}
                    </span>
                )
            },
            {
                title: '操作',
                key: 'action',
                width:260,
                render: (text, record) => {
                    let {judgeStatu,projectType} = record;

                    return (
                        <span>
                        {
                            // 正式版本，审核中 不可以编辑
                            [1,3].includes(judgeStatu) &&
                            <React.Fragment>
                                {
                                    this.getH5EditDOM(record)
                                }
                                <Divider type="vertical" />
                            </React.Fragment>
                        }
                        {
                            // 灰度版本可以更新
                            [3].includes(judgeStatu) && 
                            <React.Fragment>
                            <a onClick={ e => this.openModal('h5PublishVisible',record,true)}>更新</a>
                                <Divider type="vertical" />
                            </React.Fragment>
                        }
                        {
                            // 草稿，和灰度版本可以发布
                            [1,3].includes(judgeStatu) && 
                            <React.Fragment>
                            <a onClick={ e => this.openModal('h5PublishVisible',record)}>{judgeStatu === 1 ? '灰度' : '发布'}</a>
                                <Divider type="vertical" />
                            </React.Fragment>
                        }
                        {
                            // SDK模式不能复制
                            (projectType == '2') && 
                            <React.Fragment>
                                <a onClick={ e => this.openModal('h5CopyVisible',record)}>复制</a>
                                <Divider type="vertical" />
                            </React.Fragment>
                        }
                        {
                            // 草稿状态才可以删除
                            [1].includes(judgeStatu) && 
                            <React.Fragment>
                                <a onClick={ e => this.openModal('h5DeleteVisible',record)}>删除</a>
                            </React.Fragment>
                        }
                        {
                            // 灰度版本或者正式版本才会有下线操作
                            [3,4].includes(judgeStatu) && 
                            <React.Fragment>
                                <a onClick={ e => this.openModal('h5OffLineVisible',record)}>下线</a>
                            </React.Fragment>
                        }
                    </span>
                    )
                },
            }
        ]
    }
    componentDidMount(){
        // 此处是为了页面从H5编辑器返回时，能及时更新数据
        this.getPages()
    }
    getH5EditDOM (record) {

        let {projectId,projectType} = record;

        if(projectType == '1') { // SDK开发模式时，编辑是重新上传一个文件包
            return <a onClick={() => this.openModal('h5AddVisible',record)}>编辑</a>
        }



        return <a onClick={() => this.goToH5ToolPage(projectId)}>编辑</a>
    }
    addNewPage = () => {
        let {maxProjectNum,projectNum} =  this.props.productH5Pages;

        if(projectNum >=maxProjectNum) {
            Notification({
                message: '无法新建',
                description: '已超出页面支持上限！' 
            })
            return;
        }

        this.openModal('h5AddVisible')
    }
    openModal = (type,record,isGrayUpdate) => {
        let _state = {
            [type]:true 
        }
        
        if (type == 'h5PublishVisible') {
            let {judgeStatu,projectStatus,projectType} = record,
                // 草稿状态时需要发布灰度，灰度状态时需要发布正式 , 灰度状态可以更新
                publishType = (judgeStatu == 1) ? 3 : (isGrayUpdate ? 3 : 4);
            
            if (projectStatus == '0' && projectType == '2') {
                Notification({
                    type:'warn',
                    message: '无法发布',
                    description: '此条HTML数据没有保存，请先保存！'
                })
                return false;
            }

            _state.publishType = publishType;
        }

        if (record && type !== 'h5AddVisible') {
            _state.currentOperateItem = record
        }

        if (type == 'h5AddVisible') {
            
            if (record) { // 编辑 SDK模式的H5页面
                _state.projectType = '1';
                _state.sdkEdit = record;
            }
        }

        this.setState(_state)  
    }
    close (type) {        
        this.setState({
            [type]:false
        })

        if (type == 'h5AddVisible') {
            this.setState({ // 恢复默认状态
                projectType:'2',
                sdkEdit:null,
                templateDetail:null
            })
        }
    }
    deleteOkHandle = () => {
        let {currentOperateItem} = this.state,
            {projectId} = currentOperateItem;
        
        this.setState({
            deleteLoading:true
        },() => {
            post(Paths.delProject,{
                projectId
            }).then(res => {
                this.setState({
                    h5DeleteVisible:false
                })
                this.getPages()
            }).finally( () => {
                this.setState({
                    deleteLoading:false
                })
            })
        })
    }
    copyOKHandle = () => {
        let {currentOperateItem} = this.state,
            {productId} = this.props,
            {projectId} = currentOperateItem;
        
        this.setState({
            copyLoading:true
        })

        post(Paths.copyProject,{
            projectId,
            productId
        }).then( res => {
            this.getPages()
            this.setState({
                h5CopyVisible:false
            })
        }).finally( () => {
            this.setState({
                copyLoading:false
            })
        })
    }
    offLineOkHandle = () => {
        let {currentOperateItem} = this.state,
            {productId} = this.props,
            {projectId,judgeStatu} = currentOperateItem,
            path = Paths.cancelGrayUpdate,
            _data = {projectId};
        
        this.setState({
            offLineLoading:true
        })

        if (judgeStatu == '4') { //灰度时，撤销灰度；正式时，下线
            path = Paths.offlineUiDesign;
            _data.productId = productId;
        }

        post(path,_data,{
            needVersion: '1.1'
        }).then( res => {
            this.getPages()
            this.setState({
                h5OffLineVisible:false
            })
        }).finally( () => {
            this.setState({
                offLineLoading:false
            })
        })
    }
    publishOkHandle = data => {
        let {currentOperateItem,publishType} = this.state,
            {productId} = this.props,
            {projectId} = currentOperateItem,
            path = Paths.garyUpdate;
            
        if (publishType == '4') {
            path = Paths.formalUpdate;
            data.appId = data.newAppIds;
            delete data.newAppIds
        }

        this.setState({
            publishLoading:true
        })

        post(path,{
            ...data,
            projectId,
            productId
         },{
             needVersion:'1.1'
        }).then(res => {
            this.setState({
                h5PublishVisible:false
            })
            this.getPages()
        }).finally(() => {
            this.setState({
                publishLoading:false
            })
        })
    }
    changeProjectTypeInAddForm = type => {
        this.setState({
            projectType: type
        })
    }
    h5AddOkHandle = (data,projectType) => {
        let {productId} = this.props;
        
        this.setState({
            h5AddLoading:true
        })
        post(Paths.saveProject,{
            ...data,
            productId
        },{
            needFormData:true,
            needVersion:1.1
        }).then(res => {
            let {templateDetail,isKeepEvent} = this.state,
                {projectId} = res.data,
                keepEventParam = templateDetail ? (isKeepEvent ? 2 : 1) : 0;

            this.setState({
                h5AddVisible:false,
                templateDetail:null,
                isKeepEvent:true
            },() => {
                if (projectType == 2) {
                    this.goToH5ToolPage(projectId,keepEventParam)
                } else {
                    this.getPages()
                }
            })
        }).finally( () => {
            this.setState({
                h5AddLoading:false
            })
        })
    }
    // 跳转到H5自助平台；keepEventParam 标记是否需要保存模板事件，需要传递给H5自助工具
    goToH5ToolPage = (projectId,keepEventParam) => {
        let hostname = window.location.hostname,
        wcloud = '/wCloud_v2';

        if (hostname == 'open.clife.net' || hostname == 'open.clife.cn' || hostname == 'cms.clife.cn') {
            wcloud = '';
        } else if (hostname == 'test.cms.clife.cn' || hostname == 'pre.cms.clife.cn' || hostname == 'itest.clife.net') {
            wcloud = '/pre-wCloud-v2';
        } else if (hostname == 'localhost' || hostname == '127.0.0.1') {
            wcloud = 'https://200.200.200.50' + wcloud;
        }

        let newUrl = `${wcloud}/app-developer/page/playground.html#/develop/edit/${projectId}` + (keepEventParam ? `?keepEvent=${keepEventParam}` : '');

        window.location = newUrl;
    }
    getPages = () => {
        let {listPager,projectName} = this.state,
            {productId,getH5Manages} = this.props;
        
        getH5Manages({
            ...listPager,
            projectName,
            productId
        })
    }
    openTemplateMarket = () => {
        let {h5TemplatesLists} = this.state;

        if (!h5TemplatesLists) {
            this.getTemplateLists().then(data => {
                let lists = data.data;

                if (lists.length > 0) {
                    let firstTemplateId = lists[0].templateId;

                    this.getTemplateDetailAndAnalysis(firstTemplateId).then(axios.spread((detail,analysis) => {
                        this.setState({
                            h5TemplatesLists:lists,
                            firstTemplateDetail:detail.data,
                            firstTemplateAnalysis:analysis.data
                        },() => {
                            this.setState({
                                h5TemplateVisible:true
                            })
                        }) 
                    }))
                } else {
                    this.setState({
                        h5TemplatesLists:lists
                    },() => {
                        this.setState({
                            h5TemplateVisible:true
                        })
                    })
                }
            })
        } else {
            this.setState({
                h5TemplateVisible:true,
            })
        }
    }
    getTemplateLists = () => {
        let {productId} = this.props;

        return post(Paths.getTemplateMarket,{
            productId
        },{
            loading:true,
            needVersion:1.1
        })
    }
    getTemplateDetailAndAnalysis = (templateId) => {
        let {productId} = this.props;

        return axios.all([
            post(Paths.getTemplateBaseInfo,{
                templateId
            },{
                loading:true
            }),
            post(Paths.getTemplateAnalysis,{
                productId,
                templateId
            },{
                loading:true,
                needVersion:1.1
            })
        ])
    }
    selectTemplate = (templateDetail,isKeepEvent) => {
        this.setState({
            templateDetail,
            isKeepEvent,
            h5TemplateVisible:false
        })
    }
    changePageIndex = (page) => {
        this.setState({
            listPager: {
                pageIndex:page,
                pageRows:20
            } 
        },this.getPages)
    }
    SearchInputHandle = value => {
        this.setState({
            projectName:value
        })
    }
    // 1:草稿 2:审核中 3:灰度版本 4:正式版本
    judgeH5Status = (listItem) => { //计算H5页面的状态 -- 原有的参数太杂乱了，内部使用此字段标记
        let {isGray,status,verifyStatus} = listItem,
            _statu = null;

        if (isGray == '1') {
            _statu = 3;
        } else {
            if (status == '0') {
                _statu = 1;
            } else {
                if (verifyStatus == '3') {
                    _statu = 2;
                } else if (verifyStatus == '1'){
                    _statu = 4;
                } else {
                    _statu = 1;
                }
            }
        }
        return _statu;
    }
    dealList (list = []) {
        let {productName} = this.props;

        let _list = cloneDeep(list);
        _list = addKeyToTableData(_list);
        _list = _list.map(item => {
            let {projectName,externalVersion} = item;
            // 旧逻辑是项目名称是自动生成的，由产品名称和一个扩展号组成；新逻辑中，项目名称可以自定义输入
            item.projectNameVersion = (productName == projectName) ?  `${projectName} - V${externalVersion}` : projectName;
            // 项目的状态由太多字段一起标记，这里计算出一个统一字段进行管理
            item.judgeStatu = this.judgeH5Status(item);
            return item;
        })
        return _list;
    }
    render() {
        let {h5AddVisible,sdkEdit,h5AddLoading,projectType,h5DeleteVisible,h5TemplateVisible,h5CopyVisible,h5PublishVisible,h5OffLineVisible,listPager,projectName,currentOperateItem,deleteLoading,copyLoading,offLineLoading,publishType,publishLoading,h5TemplatesLists,firstTemplateDetail,firstTemplateAnalysis,templateDetail} = this.state,
            {productH5Pages,appsByProductId,productId,deviceTypeName,canOperate} = this.props,
            {pageIndex,pageRows} = listPager,
            {list,pager} = productH5Pages,        
            _list = this.dealList(list);

        let _columns = cloneDeep(this.h5PageColumns);

        if(!canOperate) {
            _columns.pop()
        }
        
        return (
            <div className="app-control-wrapper">
                <AloneSection style={{margin:'0 0 24px'}} title="使用流程">
                    <div className="use-service-flow-wrapper">
                        <FlowChart type={3} flowLists={flowLists}></FlowChart>
                        <div className="extra-descs">
                            <div className="descs-item">
                                <div>使用
                                   {/* <a> */}
                                   H5开发工具 
                                    {/* </a> */}
                                    拖拽生成页面;</div>
                                <div>基于
                                    {/* <a> */}
                                    H5 SDK
                                    {/* </a> */}
                                    开发页面并上传;</div>
                                {/* <div>下载 <a>H5开发文档</a>;</div> */}
                            </div>
                            <div className="descs-item">
                                <p>配置产品在APP上的联网指引、使用帮助等信息。</p>
                            </div>
                            <div className="descs-item">
                                <p>通过 
                                    {/* <a> */}
                                        调试工具
                                        {/* </a>  */}
                                    验证H5页面面的控制功能和状态显示是否正常。
                                {/* <a>使用指南</a> */}
                                </p>
                            </div>
                            <div className="descs-item">
                                <p>调试完成后，可以将页面发布到C家或您创建的APP上。</p>
                            </div>
                        </div>
                    </div>
                </AloneSection>
                <section className="h5-manage-wrapper section-bg">
                    <h3>H5页面</h3>
                    {/* <div className="h5-desc-wrapper">
                        <p className="h5-desc-title">平台采用Native App+HTML5页面的技术架构，解决通过APP控制多个产品设备的需求。您可以使用调试白名单内的账户登录C家APP或您创建的独有APP，扫码H5页面的二维码进行功能验证。</p>
                        <p className="h5-tip">您可以通过两种方法创建H5页面：</p>
                        <div className="two-way-wrapper">
                            <div className="way-item">
                                <p>方法一：</p>
                                <div>基于C-Life H5 SDK自行开发H5页面，打包后上传H5页面。需要具备一定的HTML+CSS+JS基础。请查看 <a href="https://opendoc.clife.cn/book/content?documentId=84&identify=product_manage" target='_blank'>H5开发文档</a>，下载 <a href="https://opendoc.clife.cn/download" target='_blank'>H5 SDK</a>。</div>
                            </div>
                            <div className="way-item">
                                <p>方法二：</p>
                                <div>使用C-Life平台自主打造的H5开发工具自助开发H5页面，实时拖拉拽生成H5页面。无需代码基础。请查看   <a href="https://opendoc.clife.cn/book/content?documentId=84&identify=product_manage" target='_blank'>H5开发工具指导</a>。</div>
                            </div>
                        </div>
                    </div> */}
                    <div className="page-manage">
                        <div className="tool-area">
                            <div className="searchBox">
                                <Search enterButton
                                    value={projectName}
                                    onChange={e => this.SearchInputHandle(e.target.value)}
                                    onSearch={this.getPages}
                                    maxLength={20}
                                    placeholder="请输入页面名称查找">
                                </Search>
                            </div>
                            {
                                canOperate && 
		                            <Button type="primary" 
		                                style={{ float: 'right',marginRight:'12px'}} 
		                                onClick={this.addNewPage}>
		                                <Icon type="plus"/>
		                                 新建H5页面
		                            </Button>
                            }

                        </div>
                        <div className="h5-manage-tab">
                            <Table columns={_columns} 
                                   dataSource={_list}
                                   pagination = {
                                    pager ? 
                                    {
                                        total:pager.totalRows,
                                        current:pageIndex,
                                        defaultCurrent:1,
                                        pageSize:pageRows,
                                        defaultPageSize:20,
                                        onChange:(page) => this.changePageIndex(page),
                                        showTotal: total => <span>共 <a>{total}</a> 条</span>,
                                        showQuickJumper:true,
                                        hideOnSinglePage:true,
                                    }:
                                    false
                                   }
                                   />
                        </div>
                    </div>
                </section>

                <ProductHelpConfig productId={productId}></ProductHelpConfig>
                {/* 页面创建弹框 */}
                {
                    h5AddVisible && 
                    <H5AddForm visible={h5AddVisible}
                        h5AddLoading={h5AddLoading}
                        h5AddOkHandle={this.h5AddOkHandle}
                        projectType={projectType}
                        sdkEdit={sdkEdit}
                        templateDetail={templateDetail}
                        openTemplateMarket={this.openTemplateMarket}
                        changeProjectTypeInAddForm={this.changeProjectTypeInAddForm}
                        onCancel={this.close.bind(this,'h5AddVisible')}>
                    </H5AddForm>
                }
                {/* 页面发布弹框 */}
                {
                    h5PublishVisible &&
                    <H5PagePublish visible={h5PublishVisible} 
                        appsByProductId={appsByProductId}
                        projectName={currentOperateItem.projectNameVersion}
                        productId={productId}
                        publishType={publishType}
                        publishOkHandle={this.publishOkHandle}
                        publishLoading={publishLoading}
                        onCancel={this.close.bind(this,'h5PublishVisible')}>
                        </H5PagePublish>
                }

                {/* 页面删除弹框 */}
                {   h5DeleteVisible && 
                    <ActionConfirmModal
                        visible={h5DeleteVisible}
                        modalOKHandle={this.deleteOkHandle}
                        modalCancelHandle={this.close.bind(this,'h5DeleteVisible')}
                        targetName={currentOperateItem.projectNameVersion}
                        confirmLoading={deleteLoading}
                        title={'删除页面'}
                        descGray={true}
                        descText={'即将删除的页面'}
                        needWarnIcon={true}
                        tipText={'页面删除后将无法找回，是否确认删除？'}
                    ></ActionConfirmModal>
                }
                {/* 页面复制弹框 */}
                {
                    h5CopyVisible && 
                    <ActionConfirmModal
                        visible={h5CopyVisible}
                        modalOKHandle={this.copyOKHandle}
                        modalCancelHandle={this.close.bind(this,'h5CopyVisible')}
                        targetName={currentOperateItem.projectNameVersion}
                        confirmLoading={copyLoading}
                        title={'复制页面'}
                        descGray={true}
                        descText={'即将复制的页面'}
                        tipText={'将创建与原页面功能一样的新页面，是否确认创建？'}
                    ></ActionConfirmModal>
                }
                {/* 页面下线弹框 */}
                {
                    h5OffLineVisible && 
                    <ActionConfirmModal
                        visible={h5OffLineVisible}
                        modalOKHandle={this.offLineOkHandle}
                        modalCancelHandle={this.close.bind(this,'h5OffLineVisible')}
                        targetName={currentOperateItem.projectNameVersion}
                        confirmLoading={offLineLoading}
                        title={'下线页面'}
                        descGray={true}
                        descText={'即将下线的页面'}
                        needWarnIcon={true}
                        tipText={'页面下线后，已发布的APP将无法拉取到该页面，是否确认下线？'}
                    ></ActionConfirmModal>
                }
                {
                    h5TemplateVisible && 
                    <H5TemplateManage
                        visible={h5TemplateVisible}
                        h5TemplatesLists={h5TemplatesLists}
                        firstTemplateDetail={firstTemplateDetail}
                        firstTemplateAnalysis={firstTemplateAnalysis}
                        getTemplateDetailAndAnalysis={this.getTemplateDetailAndAnalysis}
                        deviceTypeName={deviceTypeName}
                        onOk={this.selectTemplate}
                        onCancel={this.close.bind(this,'h5TemplateVisible')}
                    ></H5TemplateManage>
                }
            </div>
        )
    }
}
