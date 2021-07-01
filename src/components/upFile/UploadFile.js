import React, { Component } from 'react';
import MyIcon from '../../components/my-icon/MyIcon';
import {CheckUpFile} from '../CheckUpFile';
import uploadFile from '../../assets/images/uploadFile.png';
import {cloneDeep} from 'lodash';
import {UpFileToCloud} from '../UpFileToCloud';

import './file.scss';

function getLocalSrc(target,backfunc){//获取上传图片本地预览地址
    if (window.FileReader) {
        // html5方案
        let fr = new FileReader(),
            fire = target.files[0];
        fr.onload = function (e) {//异步回调
            backfunc(e.target.result);
        };
        fr.readAsDataURL(fire);
    } else {
        // 降级处理
        backfunc(target.value);
    }
}

export default class UploadFile extends Component {
    constructor(props){
        super(props);
        this.state = {
            fileList:[]
        }
        // fileList.push(fileobj); //fileList的state更新来源可以是本地上传预览的时候也可以是拉取服务器上保存过的文件显示的时候
        //
        // let fileobj =
        //{
        //     filename:filename,//可能是本地上传预览时的文件名，也可能是读取服务器已存在的文件名
        //     filesrc:"图片本地预览地址",//可能是本地预览地址，也可能是读取服务器已存在的文件地址
        //     file:target.files[0],//只有本地上传预览时更新的state会有该属性
        // }

        this.imgChang = this.imgChang.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
    }
    componentDidMount() {
        this.props.onRef(this);
    }

    upToTencentCloud(backfunc,timeout){//对外接口 ，文件上传到腾讯云，并将拿到的url以数组（适用单文件或多文件上传）从backfunc返回 // timeout超时时间 默认30s
        let upfilecount = 0, urllist = [], _fileList=[];
        this.state.fileList.map((item,index)=>{
            let file = item.file;
            if(file){ //本地预备上传到腾讯云的文件，并累计数量upfilecount，以用于之后判断所有UpFileToCloud的异步回调是否执行完成
                ++upfilecount;
                UpFileToCloud(file,(src,i)=>{
                    if(src){
                        urllist[i] = src;
                        _fileList[i] ={
                            file:null,
                            filename:item.filename,
                            filesrc:src
                        };
                    }else{
                        // alert("第"+i+"个文件上传失败");
                        urllist[i] = "";
                        _fileList[i] ={
                            file:null,
                            filename:"上传失败",
                            filesrc:item.filesrc
                        };
                    }
                    if(--upfilecount == 0){ // 最后一个上传到腾讯云的异步回调执行完成时，准备执行 upToTencentCloud 的回调来返回从腾讯云返回来的url加上原有url组成的数组
                        let filterlist = urllist.filter(item => item!="");
                        this.setState({
                            fileList:_fileList
                        });
                        backfunc(filterlist);
                    }
                },index,timeout);
            }else{
                urllist[index] = item.filesrc;
                _fileList[index] = item;
            }
        });
        if(upfilecount==0){//如果没有要上传的新文件，返回原有url数组
            backfunc(urllist);
        }
    }

    _setState(obj){
        let maxcount = this.props.maxcount || 1,
            _fileList = cloneDeep(this.state.fileList);
        if(maxcount==1){
            _fileList[0] = obj;
        }else{
            _fileList.push(obj);
        }
        this.setState({fileList:_fileList});
    }
    imgChang(e){
        e = e || window.event;
        let target = e.target,
            file = target.files[0];
        if(!file) return false;
        if(!CheckUpFile(target)) return false;
        let filename = file.name;
        let fileobj = {
            file,
            filename,
            filesrc:""
        };
        let isNotImg = this.props.isNotImg;
        if(isNotImg){
            this._setState(fileobj);
        }else{
            getLocalSrc(target,(src)=>{
                fileobj.filesrc = src;
                this._setState(fileobj);
            })
        }
        target.value = '';
    }
    deleteFile(index){
        let _fileList = cloneDeep(this.state.fileList);
        _fileList.splice(index,1);
        this.setState({fileList:_fileList});
    }
    render() {
        /**
         * maxsize: 文件大小
         * format: 文件格式
         * isNotImg: 是否为图片文件 true 不是， false 是图片
         * maxcount: 默认1即为单选上传，支持上传多选
         * disedit: 整个组件不可编辑 不能增删改文件（input设置为disabled，文件删除按钮不显示），默认false 可编辑 ，true 不可编辑
         */
        let { fileList } = this.state;
        let {maxsize,format,isNotImg,maxcount=1,explainTxt="",disedit=false} = this.props;
        let maxlimit = maxcount>1&&fileList.length==maxcount;
        let inputdisabled = disedit || maxlimit, //file-input不可用
            delabled = maxcount>1 && !disedit; //显示删除按钮（单文件上传没有删除操作，直接覆盖操作）
        let inputtxt = maxlimit?("数量已达上限"+maxcount):(isNotImg?'上传文件':'上传图片');
        return (
            <div className='uploadFile'>
                <span className='common_fileBox'>
                    {!maxlimit&&<MyIcon className='icon' type="icon-add_white"></MyIcon>}
                    <span className='file_explain'>{inputtxt}</span>
                    <input className='file' type='file' data-format={format} data-maxsize={maxsize} onChange={this.imgChang} disabled={!!inputdisabled}/>
                </span>
                <span className="img-explain">{explainTxt||""}</span>
                <div className='list'>
                    {
                        fileList.map((item,index)=>{
                            let filename = item.filename,
                                iconsrc = isNotImg?uploadFile:item.filesrc;
                            return <div className='box' key={'imgSrc'+index}>
                                        <img className='imgSrc' src={iconsrc}/>
                                        <span className='name single-text'>{filename}</span>
                                        {delabled&&<MyIcon className='icon_shanchu' type="icon-shanchu" onClick={this.deleteFile.bind(this,index)} ></MyIcon>}
                                    </div>
                        })
                    }
                </div>
            </div>
        );
    }
}
