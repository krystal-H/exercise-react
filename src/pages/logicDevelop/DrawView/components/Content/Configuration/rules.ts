const isRequire = (name: string) => ({
  required: true,
  message: name + "不能为空",
});
const checkLength = (min = 1, max: any = 50) => ({
  pattern: new RegExp("^.{" + min + "," + max + "}$"),
  message: "长度为" + (max ? min + "~" + max : "最少" + min) + "个字符",
});
const checkRules = (pattern: RegExp, explain: string) => ({
  pattern: pattern,
  message: explain,
});

const nameStr = "节点名称";
const nameMore = "如何使用该节点？";
const nameExplain = "支持中英文、数字、特殊字符_-()，长度不超过30个字符";
const nameTest = /^[a-zA-Z0-9\-()_\u4e00-\u9fa5]{1,30}$/;

const paramExplain =
  "仅支持字母大小写、数字、下划线，必须以字母开头，长度不超过50个字符";
const paramTest = /^[a-zA-Z][\w_]{0,49}$/;

const actionInstruction =
  "使用SDK调用时作为API的参数“action”进行调用。使用Web或移动工作台调用的时候无需在相关工作台输入该参数。请求path长度为2~50个字符，";
const actionExplain = "只支持字母数字下划线斜线，不能以斜线结尾";
const actionTest = /^(\/?[\w_]+)*$/;

const urlExplain = "请输入URL地址，如：https://www.example.com";
const urlTest = /https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const intTest = /^[0-9]{1,30}$/;

const rules = {
  nameStr,
  nameMore,
  nameExplain,
  nameTest,
  isRequire,
  checkRules,
  name: () => [isRequire(nameStr), checkRules(nameTest, nameExplain)],

  paramExplain,
  param: (paramStr: string) => [
    isRequire(paramStr),
    checkRules(paramTest, paramExplain),
  ],

  actionExplain: actionInstruction + actionExplain,
  action: (actionStr: string) => [
    isRequire(actionStr),
    checkLength(2, 50),
    checkRules(actionTest, actionExplain),
  ],

  urlExplain,
  urlTest,
  url: [isRequire("后端请求地址"), checkRules(urlTest, "请输入正确的URL格式")],

  isInt:(paramnam:string)=>[isRequire(paramnam), checkRules(intTest, "请输入非负整数")],
  isIntNotRequire:()=>[checkRules(intTest, "请输入非负整数")]
};
export default rules;
