import React, { Component } from 'react';
import {get,post, Paths} from '../../../api';
import { Checkbox} from 'antd';
import { Notification } from '../../../components/Notification';
import './authorize.scss'

export default class CancelMod extends Component {
    constructor(props){
        super(props);
        this.state = {
            checkedValues:[]
            
            
        };
    }
    componentDidMount() {
        this.props.onRef(this);   
    }

    onChange = checkedValues=>{
        this.setState({checkedValues});

    }
    cancelCommit =()=>{
        let {id,instanceIds} = this.props.cancelData;
        if(instanceIds.indexOf(',')>-1){
            let idvals = this.state.checkedValues;
            if(idvals.length==0){
                Notification({type:'warn',description:'请至少选中一项'});
                return
            }
            instanceIds = idvals.join(',');
        }
        post(Paths.deleAuthorize,{id,instanceId:instanceIds}).then((res) => {
            if(res.code==0){
               this.props.cancelSucess();
            }
        });
    }


    getOptions = ()=>{
        
        let { instanceIds = '',instanceName = ''} = this.props.cancelData;
        let idlist = instanceIds.split(','),
            nameList = instanceName.split(',');
        return nameList.map((item,index)=>{
            return { label: item, value: idlist[index] }
        }); 
    }

    render() {
        let options = this.getOptions();
        if(options.length>1){
            return <Checkbox.Group options={options} onChange={this.onChange} />
        }else{
            return <span>{options[0].label || "确定取消该条授权？"}</span>
        }
    }
}
