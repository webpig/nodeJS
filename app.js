//  引入http模块，发出http请求，系统级别模块
var http = require('http'),
//  加密的http请求
    https = require('https'),
//  文件系统模块，用于打开读取硬盘上的文件，前端无法实现的，node.js具有操作系统的能力。
    fs = require('fs'),
//  路径模块，读取文件，需要给出路径
    path = require('path'),
//  第三方模块，在服务器端模仿出前端DOM树
    cheerio = require('cheerio');
//要抓取的页面对象字面量
var opt = {
  hostname: 'movie.douban.com',
  path: '/top250',
  port: 80
}
//释放我们的小蜘蛛
function spiderMovie(index) {
  //console.log(index);
  //使用https库向网址发送请求
  https.get('https://' + opt.hostname + opt.path + '?start=' + index, function(res) {
    var pageSize =25;
    var html = '';//保存抓取到的html源码
    var movies = [];//保存解析html后的数据，即我们需要的电影信息
    //设置编码，返回的是流
    res.setEncoding('utf-8');
    //文件可能比较大，一次发送一个数据包
    //每次有数据到达，触发data事件
    res.on('data', function(chunk) {
      html += chunk;
    });
    //传输完成
    res.on('end', function() {
      //使用第三方cheerio库，加载我们得到的html字符串
      //在内存里创建并模拟一个DOM
      //console.log(html);
      var $ = cheerio.load(html);
      //选中所有类名为item的元素，电影内容组合
      //查找元素 document.querySelectorAll('.item')
  //    console.log($('.item'));
    //  var i = 0;
      $('.item').each(function() {
        //找到item下的img元素，并且获得它的src属性
        var picUrl = $('.pic img', this).attr('src');
        var movie = {
          title: $('.title', this).text(),//获取电影名称
          star: $('.info .star .rating_num', this).text(),//获取电影评分
          link: $('a', this).attr('href'),//获取电影详情页链接
          picUrl: picUrl
        };
      //  if(i < 1) {
    //      downloadImg('./img/', picUrl);
      //    i++;
    //    }
      //  console.log(picUrl);
      //把所有电影放在一个数组
        if(movie) {
          movies.push(movie);
        }
        //调用下载图片方法
        downloadImg('./img/', movie.picUrl);
      });
      //保存抓取到的电影数据
      saveData('./data' + (index / pageSize) + '.json', movies);
    });
  })
}
//下载图片 图片放哪，图片远程网址
function downloadImg(imgDir, url) {
  //https请求图片
  https.get(url, function(res) {
    var data = '';
    //二进制组成
    res.setEncoding('binary');
    res.on('data', function(chunk) {
      data += chunk;
    })
    res.on('end', function() {
      //图片下载完成，保存。
      fs.writeFile(imgDir + path.basename(url), data, 'binary', function(err) {
        if(err) {
          console.log('保存图片失败');
        } else {
          console.log('图片已保存到服务器');
        }
      })
    })
  })
}

function saveData(path, movies) {
  console.log(movies);
  fs.writeFile(path, JSON.stringify(movies, null, ' '), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log('Data saved');
  });
}
spiderMovie(0);
//function *doSpider(x) {
//  var start = 0;
//  while(start < x) {
//    yield start;
//    spiderMovie(start);
//    start += 25;
//  }
//}
//for(var x of doSpider(250)) {
//  console.log(x);
//}
