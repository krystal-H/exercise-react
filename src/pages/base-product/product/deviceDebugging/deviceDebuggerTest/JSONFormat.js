import React, { Component } from 'react';
import {assignIn,cloneDeep} from 'lodash';
/**
 * JSON  节点
 */
class JSONNode extends React.Component{
    render () {
        var iClassName = "";
        var vClassName = "";
        var jsonValue="";
        var jsonKey = this.props.jsonKey;
        var type = typeof this.props.jsonValue;
        var nodeStart = false; //标记是不是一对括号的前括号，主要用来判断，是不是末尾不需要逗号
        if(this.props.jsonValue instanceof Array){
            type="array";
        }
        if(this.props.jsonValue === null){
            type="null";
        }

        if(type=="object"){
            var fixBefore ="{";
            var fixAfter ="}";
            if(this.props.isClose){
                iClassName = "icon-chevron-thin-right"
                jsonValue=type+fixBefore+"..."+fixAfter;
                vClassName="tag";
            }else{
                iClassName = "icon-chevron-thin-down"
                jsonValue=fixBefore;
                vClassName="tag";
                nodeStart=true;
            }
        }else if(type=="array"){
            var fixBefore ="[";
            var fixAfter ="]";
            if(this.props.isClose){
                iClassName = "icon-chevron-thin-right"
                jsonValue=type+fixBefore+"..."+fixAfter;
                vClassName="tag";
            }else{
                iClassName = "icon-chevron-thin-down"
                jsonValue=fixBefore;
                vClassName="tag";
                nodeStart=true;
            }
        }else if(type=="string"&&this.props.type!="tag"){
            jsonValue="\""+this.props.jsonValue+"\"";
            vClassName="string";
        }else if(type=="number"){
            jsonValue=this.props.jsonValue;
            vClassName="number";
        }else if(type=="string"&&this.props.type=="tag"){
            jsonValue=this.props.jsonValue;
            vClassName="tag";
        }else if(type=="null"){
            jsonValue="null";
            vClassName="null";
        }else if(type=="boolean"){
            jsonValue=this.props.jsonValue.toString();
            vClassName="boolean";
        }
        return (
            <p className="json-format-node" style={{"margin-left":this.props.isEndTag?"-25px":""}}>
                <i className={iClassName} onClick={this.props.onCloseOrOpen}> </i>
                <span className="json-format-key">{jsonKey?"\""+jsonKey+"\"":""}</span>
                {jsonKey?":":""}
                <span className={"json-format-value "+vClassName}>{jsonValue}</span>
                {nodeStart||this.props.isLast?"":","}
            </p>
        )
    }
}
/**
 * JSON格式化查看组件
 */
export default class JsonFormatCompentent  extends Component{
    // getInitialState () {
    //     console.log('---获取到的上行数据-----',this.props.json);
    //     return {json: tools.copyObj(this.props.json),jsonCode:this.props.jsonCode}
    // }
    constructor(props){
        super(props);
        this.state = {json: cloneDeep(this.props.json),jsonCode:this.props.jsonCode};
        // console.log('---获取到的上行数据-----',this.props.json);
        // return {json: tools.copyObj(this.props.json),jsonCode:this.props.jsonCode}
        // return {json: cloneDeep(this.props.json),jsonCode:this.props.jsonCode}
        // this.selectRow = this.selectRow.bind(this);
    }
    componentWillReceiveProps(props){
        // console.log('---获取到的上行数据-----',props);
        // let json  = tools.copyObj(props.json);
        let json  = cloneDeep(props.json);
        if(props.jsonCode==this.state.jsonCode&&typeof props.json =="object"){
            if(props.json!==null&&props.json!==undefined){
                // json  = $.extend(true,this.state.json,json);
                json  = assignIn(true,this.state.json,json);
            }
        }
            this.setState({
                json: json,jsonCode:props.jsonCode
            })
    }
    componentWillUpdate(){
        // console.log('---1111111111111-----');
    }
    onCloseOrOpen(keys){
        var jsonObj = this.state.json;
        var updateObject = jsonObj;
        for(var index in keys){
            var key = keys[index];
                updateObject=updateObject[key]
        }
        updateObject._isClose=!updateObject._isClose;
        this.setState(jsonObj);
    }
    render () {
        var _this = this;
        // console.log('---获取到的上行数据-----',this.props);
        /**
         * 获取json dom节点
         * @param json              json数据
         * @param level    int     当前是递归到第几层，用来缩进，从1起
         * @param keys     array   当前递归到的位置，键的路径
         * @param isLast   boolean 是否是当前对象|数组 中最后一个元素，主要用来判断如果是最后一个元素，不用在末尾加逗号
         * @returns {Array}
         */
        function getJSONDom(json,level,keys,isLast){
            // console.log('---获取到的上行数据-----',json);
            var dom = [];

            if(typeof json != "object" || json===null){
                dom.push(<JSONNode  jsonValue = {json} level = {level} isLast={isLast}></JSONNode>);
                return dom;
            }
            var preKey = null;   //保存循环中上一次的i值，每次循环都是处理上一次的i值，首次循环跳过，循环结束后补一次执行逻辑，这么做是为了能够判断出是否是最后一次循环
            for(var i in json){
                setDom(i,json,false);
            }
            setDom(null,json,true);

            function setDom(i,json,isLast){
                if(i == "_isClose") return;
                if(preKey===null||preKey===undefined) {
                    preKey = i;
                    return;
                };
                var key = preKey;
                preKey= i;

                var thisJson = json[key];
                var tmpkeys = keys.concat();
                tmpkeys.push(key);
                var thisLevel = level+1;
                var keyName = key;
                if(json instanceof Array) keyName=null;
                if(typeof thisJson == "object" && thisJson !== null){
                    dom.push(<JSONNode jsonKey = {keyName?keyName:null}  jsonValue = {thisJson} level = {thisLevel} isClose={thisJson._isClose} onCloseOrOpen={_this.onCloseOrOpen.bind(_this,tmpkeys)} isLast={isLast}></JSONNode>);
                    if(!thisJson._isClose){
                        var childrenJsonNode = getJSONDom(thisJson,thisLevel,tmpkeys,i==null);
                        dom.push(<div style={{"padding-left":"25px"}}>{childrenJsonNode}</div>)
                    }
                }else{
                    dom.push(<JSONNode jsonKey = {keyName?keyName:null}  jsonValue = {thisJson} level = {thisLevel} isLast={isLast}></JSONNode>);
                }
            }
            if(typeof json == "object" && !json._isClose) {
                var fixAfter = "}";
                if(json instanceof Array){
                    fixAfter = "]"
                }
                    dom.push(<JSONNode jsonValue={fixAfter} level={level + 1} type="tag" isEndTag={true} isLast={isLast}></JSONNode>);
            }

            var firstNodeDom = [];
            if(typeof json == "object"  && level==1) {
                firstNodeDom.push(<JSONNode jsonValue={json} level={level + 1} type="tag" isClose={json._isClose} onCloseOrOpen={_this.onCloseOrOpen.bind(_this,[])} isLast={isLast}></JSONNode>);
                if(!json._isClose){
                    firstNodeDom.push(<div style={{"padding-left":"25px"}}>{dom}</div>);
                }
                return firstNodeDom;
            }else{
                return dom;
            }
        }

        var dom =getJSONDom(this.state.json,1,[],true);
        return (
            <div>
                {dom}
            </div>
        )
    }
}
