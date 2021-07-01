const path = require('path');

module.exports = {
    outPath: path.resolve(__dirname, '../dist'),
    staticPath: 'static',
    imgInCssPuclicPath: '../../',  // PS:图片打包后的路径为 /dist/static/images ; css提取打包后的路径为 /dist/static/images; 所以需要配置PuclicPath，否则无法取到打包后的图片
    dllSrc: path.resolve(__dirname, '../dll')
}
