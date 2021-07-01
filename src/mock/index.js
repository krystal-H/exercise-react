const fs = require('fs');
const path = require('path');

function fromJSONFile(filename) {
    return (req, res) => {
        const data = fs.readFileSync(path.resolve(__dirname,`./data/${filename}.json`)).toString();
        const json = JSON.parse(data);
        return res.json(json);
    };
}

// 文档 ： https://github.com/jaywcjlove/mocker-api
const proxy = {
    'GET /app/product/example': fromJSONFile('example'),
    'GET /app/product/productList': fromJSONFile('productList'),
    'POST /app/login/account': (req, res) => {
        const { password, username } = req.body;
        if (password === '888888' && username === 'admin') {
          return res.json({
            status: 'ok',
            code: 0,
            token: "sdfsdfsdfdsf",
            data: {
              id: 1,
              username: 'kenny',
              sex: 6
            }
          });
        } else {
          return res.status(403).json({
            status: 'error',
            code: 403
          });
        }
    },
    'GET /v1/web/open/dimension/getDimensionList': fromJSONFile('device-data-api/getDimensionList'),
    'GET /v1/web/open/apiInfo/getOpenApiList': fromJSONFile('device-data-api/getOpenApiList'),

    /* All */
    'POST /v1/web/open/common/admin/loginCheck': (req,res) => {
      return res.json({"data":{"systemUrl":"./user_manage.html","userName":"330474859@qq.com"},"code":0})
    },
    'GET /v1/web/open/product/listAllProductAndAccreditInfo':fromJSONFile('product/productList'),
    'GET /v1/web/open/product/getProduct':fromJSONFile('product/productInfo'),
    'GET /v1/web/open/protoManage/getProtocolListByProductId':fromJSONFile('product/productProtocols'),
    'GET /v1/web/open/product/getConfigSteps':fromJSONFile('product/productSteps'),
    'GET /v1/web/open/projectManage/getProjectPage':fromJSONFile('product/productPages'),
    'GET /v1/web/open/projectManage/getAppsByProductId':fromJSONFile('product/apps'),
    'GET /v1/web/open/timerService/getList':fromJSONFile('product/cloudList'),
    'GET /v1/web/open/product/getPublishProductInfo':fromJSONFile('product/publishInfo'),
    'GET /v1/web/open/developer/getDeveloperInfo':fromJSONFile('developerInfo'),
    'GET /v1/web/open/device/netWorkLogo/getDetail':(req,res) => {
      return res.json({"code":0,"data":null})
    },

};

module.exports = proxy;
