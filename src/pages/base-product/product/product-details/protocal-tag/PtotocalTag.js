import React, { Component } from 'react';
import { Input,Select, Button, Table, Modal} from 'antd';
import { Link } from 'react-router-dom';
import { get,Paths } from '../../../../../api';
import moment from 'moment';
import './PtotocalTag.scss';
const { Search } = Input;
const { Option } = Select;

export default class PtotocalTag  extends Component {
    constructor(props){
        super(props);
        this.state = {
            tagList:[],
            pager:{
                pageIndex:1,
                totalRows:1,
            },
            typeList:[
                {id:0,name:'基础标签'},
                {id:1,name:'复合标签'},
                {id:2,name:'设备事件标签'},
                {id:3,name:'设备属性标签'},
            ],
            labelType:0,
            labelName:'',
        }
       
        this.columns = [
            { title: 'ID',dataIndex: 'labelId',key: 'labelId',},
            { title: '标签名称', dataIndex: 'labelName', key: 'labelName',},
            { title: '英文名', dataIndex: 'labelNameEn', key: 'labelNameEn', },
            { title: '类型', dataIndex: 'labelType', key: 'labelType', 
                render: val => ({'0':'基础标签','1':'复合标签','2':'设备事件标签','3':'设备属性标签'}[val])
            },
            { title: '操作', dataIndex: 'action', key: 'action',
                render: (text, record) => (
                    <span>
                        {/* <Link to={`/open/base/device/groupDetails/${record.id}`}>数据分析</Link> */}
                        <Link to={'#'}>数据分析</Link>
                    </span>
                ),
            
            }
           
        ];
    }
    componentDidMount() {
        this.getList();
    }
    getList=(pageIndex=1)=>{
        let {labelName,labelType} = this.state;
        let params = {
            productId:this.props.productId,
            pageIndex,
            pageRows:10,
            labelType
        }
        if(labelName){
            params.labelName = labelName
        }
        get(Paths.getThingLabelList,params).then((model) => {
            let data = model.data;
            console.log('--data--',data);
            this.setState({
                tagList:data.list,
                pager:data.pager
            });
        });

    }
  
    cngSearchType =(labelType)=>{
        this.setState({labelType});
    }
    resetList = ()=>{
        this.setState({
            labelName:'',
            labelType:0
        },()=>{this.getList(1)});
    }
    cngSearchName =(e)=>{
        this.setState({labelName:e.target.value});
    }
    render() {
        let {tagList,pager,typeList,labelType,labelName} = this.state;
        return (
            <div className="firmware_management protocal-tag-page">
                <div className='commonContentBox'>
                    <div className="centent">

                        <div className='search-box'>
                            <span>标签类型：</span>
                            <Select className='select' placeholder="选择标签类型" onChange= {this.cngSearchType} value={labelType} > 
                                {typeList.map((item)=>{
                                        return <Option key={item.id} value={item.id}>{item.name}</Option>
                                    })}
                            </Select>
                            <span>标签名：</span>
                            <div className='searchBox'>
                                <Search placeholder="请输入物标签名" value={labelName} onChange= {this.cngSearchName}
                                    enterButton
                                    maxLength={20}
                                    onSearch={() => this.getList(1)} 
                                />
                            </div>
                            <Button className='btnreset' onClick={this.resetList} >重置</Button>
                        </div>
                        
                        <Table
                            rowKey="labelId"
                            columns={this.columns} 
                            dataSource={tagList} 
                            pagination={{
                                defaultCurrent:pager.pageIndex, 
                                total:pager.totalRows, 
                                hideOnSinglePage:false,
                                onChange:this.getList
                            }} 
                        />
                    </div>
                </div>
            </div>
        )
    }
}