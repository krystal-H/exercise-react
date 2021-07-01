import React, { Component } from 'react';
import { AutoComplete, Pagination, Divider } from 'antd';
import DescWrapper from '../../../../../components/desc-wrapper/DescWrapper';
import { get,post,Paths } from '../../../../../api';
import { Notification} from '../../../../../components/Notification';
import ActionConfirmModal from '../../../../../components/action-confirm-modal/ActionConfirmModal';
import './LabelManage.scss';

const desc = [
    '温馨提示：',
    '产品标签是您给产品自定义的标识，标签的结构为：Key：value，您可以使用标签功能实现产品的分类统一管理。',
];
const labelType = 1;
const pageRows = 10;

export default class LabelManage  extends Component {
    constructor(props){
        super(props);
        this.state = {
            pageIndex:1,
            productLabelList:[],
            pager:{},
            labelBaseList:[],


            editid:-1,//正在编辑的标签id
            editkey:'',
            editval:'',
            addkey:'',
            addval:'',
           
            delLabelId:'',//标记将要删除的标签id，为空时，关闭删除确认框
            deleteLoading:false,
            dellabelKey:'',
            dellabelValue:'',
        }

    }
    componentDidMount() {
        this.getProductLabelList();
        this.getLabelBaseList();
    } 
    
    // 获取产品标签列表
    getProductLabelList() {
        let pageIndex = this.state.pageIndex,
            productId = this.props.productId;
        get(Paths.getProductLabelList,{productId,labelType,pageIndex,pageRows}).then((model) => {
            if(model.code==0){
                this.setState({
                    productLabelList:model.data.list||[],
                    pager:model.data.pager||{}
                });
                console.log(111,model.data);
            }
        });
    }
    // 获取标签库列表
    getLabelBaseList() {
        get(Paths.getProductLabelBaseList,{labelType,pageIndex:1,pageRows:9999}).then((model) => {
            if(model.code==0){
                console.log(222,model.data);
                this.setState({
                    labelBaseList:model.data||[]
                });
            }
        });
    }
    // 删除设备标签
    deleteOkHandle(){
        let labelId = this.state.delLabelId;
        this.setState({
            deleteLoading:true
        },() => {
            post(Paths.delProductLabel,{ id:labelId }).then((model) => {
                this.setState({
                    delLabelId:''
                })
                if(model.code==0){
                    this.getProductLabelList();
                }
            }).finally( () => {
                this.setState({
                    deleteLoading:false
                })
            })
        })

    }
    openDelMod(id,key,val){
        this.setState({ delLabelId:id, dellabelKey:key , dellabelValue:val});
    }
    closeDelLabelMod(){
        this.setState({ delLabelId:'' });
    }

    addConfirm(){
        let {addkey,addval} =this.state;
        if(addkey==''||addval==''){
            Notification({
                description:'请将添加输入框补充完整',
                type:'warn'
            });
            
            return false;
        }
        let productId = this.props.productId;
        post(Paths.addProductLabel,{
            productId,
            labelKey:addkey,
            labelValue:addval,
            labelType

        }).then((model) => {
            if(model.code==0){
                this.setState({addkey:'',addval:''});
                this.getProductLabelList();
                this.getLabelBaseList();
            }
        });

    }

    editLabel(id,key,val){
        this.setState({
            editid:id,
            editkey:key,
            editval:val
        });
    }

    onChangeInput(type,value){
        if(value&&value.length>50){
            return false;
        }
        let _state = {};
        _state[type] = value;
        this.setState(_state);
    }

    editConfirm(key,val){//点击编辑并没修改又保存的时候 保存原key value
        let {editid,editkey,editval } =this.state;
        if(editkey==''&&editval==''){
            Notification({
                description:'请将编辑输入框补充完整',
                type:'warn'
            });
            
        }
        post(Paths.updateProductLabel,{
            id:editid,
            labelKey:editkey||key,
            labelValue:editval||val,
            labelType
        }).then((model) => {
            if(model.code==0){
                this.setState({editid:-1,editkey:'',editval:''});
                this.getProductLabelList();
                this.getLabelBaseList();
            }
        });

    }

    getDataSource(key){
        let labelBaseList = this.state.labelBaseList,
            keysource = [],valuesource=[]; //valuesource是一个动态的存储当前正在编辑的key对应的value列表
        labelBaseList.forEach(item => {
            keysource.push(item.label||'无法识别的Key');
            if(key && key == item.label){
                item.labelDatas.forEach(labelval=>{
                    valuesource.push(labelval.label||'无法识别的Value');
                });
            }
        })
        if(key == undefined){ return keysource; }
        return valuesource;

    }

    getListHtml(){
        let {productLabelList,editid,editkey,editval} = this.state;
        let html = productLabelList.map((item,i) => {
            let {id,labelKey,labelValue} = item;
            if(id == editid){
                return  <tr key={'tr_'+i} >
                            <td>
                                <AutoComplete
                                    value={editkey}
                                    dataSource={this.getDataSource()}
                                    style={{ width: "80%" }}
                                    onChange={this.onChangeInput.bind(this,'editkey')}
                                    placeholder="Key"
                                    filterOption={true}
                                />
                            </td>
                            <td>
                                <AutoComplete
                                    value={editval}
                                    dataSource={this.getDataSource(editkey)}
                                    style={{ width: "80%" }}
                                    onChange={this.onChangeInput.bind(this,'editval')}
                                    placeholder="Value"
                                    filterOption={true}
                                />
                            </td>
                            <td>
                                <a href="javascript:" onClick={this.editConfirm.bind(this,labelKey,labelValue)}>确认</a><Divider type="vertical" />
                                <a href="javascript:" onClick={this.editLabel.bind(this,-1,'','')}>取消</a>
                            </td>
                        </tr>;

            }else{
                return <tr key={'tr_'+i} >
                            <td>{labelKey}</td><td>{labelValue}</td>
                            <td>
                                <a href="javascript:" onClick={this.editLabel.bind(this,id,labelKey,labelValue)}>编辑</a><Divider type="vertical" />
                                <a href="javascript:" onClick={()=>this.openDelMod(id,labelKey,labelValue)}>删除</a>
                            </td>
                        </tr>;
            }
        });
        return html;
    }

    changePage(pageIndex) {
        this.setState({pageIndex}, this.getProductLabelList)
    }

    render() {
        let {pageIndex,pager,addkey,addval,delLabelId,dellabelKey,dellabelValue,deleteLoading} = this.state;
        return (
            <div className="productlabelpage">
                <div className='contbox'>
                    <div className="centent">
                        < DescWrapper desc={desc} />
                    </div>
                    <table className="labeltable" >
                        <thead >
                            <tr><th style={{width:"38%"}}>标签Key</th><th style={{width:"38%"}}>标签Value</th><th style={{width:"24%"}}>管理</th></tr>
                        </thead>
                        <tbody>
                            {this.getListHtml()}
                            <tr>
                                <td>
                                    <AutoComplete
                                        value ={addkey}
                                        dataSource={this.getDataSource()}
                                        style={{ width: "80%" }}
                                        onChange={this.onChangeInput.bind(this,'addkey')}
                                        placeholder="Key"
                                        maxLength='100'
                                        filterOption={true}
                                    />
                                </td>
                                <td>
                                    <AutoComplete
                                        value={addval}
                                        dataSource={this.getDataSource(addkey)}
                                        style={{ width: "80%" }}
                                        onChange={this.onChangeInput.bind(this,'addval')}
                                        placeholder="Value"
                                        maxLength='100'
                                        filterOption={true}
                                    />
                                </td>
                                <td>
                                    <a href="javascript:" onClick={this.addConfirm.bind(this)}>确认</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <footer className="list-pagination">
                        {
                            pager && pager.totalRows>0 ?
                            <Pagination className="self-pa"
                                total={pager.totalRows}
                                current={pageIndex}
                                defaultCurrent={1}
                                defaultPageSize={10}
                                onChange={(page) => this.changePage(page)}
                                showTotal={total => <span>共 <a>{total}</a> 条</span>}
                                showQuickJumper
                                hideOnSinglePage
                            ></Pagination> : null
                        }
                    </footer>


                </div>
                
                <ActionConfirmModal
                        visible={!!delLabelId}
                        modalOKHandle={this.deleteOkHandle.bind(this)}
                        modalCancelHandle={this.closeDelLabelMod.bind(this)}
                        targetName={`key: ${dellabelKey}, value: ${dellabelValue}`}
                        confirmLoading={deleteLoading}
                        title={'删除标签'}
                        needWarnIcon={true}
                        descText={'即将删除的标签'}
                ></ActionConfirmModal>
            </div>
        )
    }
}