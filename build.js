const ejs = require('ejs');
const fs = require('fs');

const data = {
  monitors: [
    {
      type: 'HTTPS',
      title: 'EYHN\'s Blog',
      subtitle: '网站',
      style: 'statuspage-card-style-2',
      bg: './wp.jpg',
      bgblur: './wp-blur.jpg',
      description: `
      <p>
        这是 <a href='https://eyhn.in/' target='_blank'>eyhn.in</a> 博客，由 Wordpress 驱动。
      </p>
      `,
      apikey: 'm782549967-cd936917abf3022dc35319f3',
      monitorid: '782549967'
    },
    // {
    //   type: 'Ping',
    //   title: '台湾 - Google Cloud Platform',
    //   subtitle: '服务器',
    //   style: 'statuspage-card-style-2',
    //   bg: './taiwan.jpg',
    //   bgblur: './taiwan-blur.jpg',
    //   description: `
    //   <p>
    //     坐标位于台湾。Google Cloud Platform 拥有功能强大的面板，
    //     运行 <a href='https://eyhn.in/' target='_blank'>eyhn.in</a> 博客。
    //   </p>
    //   `,
    //   apikey: 'm782546630-53d450d0185542bc3b81aa28',
    //   monitorid: '782546630'
    // },
    {
      type: 'Ping',
      title: '新加坡 - Microsoft Azure',
      subtitle: '服务器',
      style: 'statuspage-card-style-1',
      bg: './singapore.jpg',
      bgblur: './singapore-blur.jpg',
      description: `
      <p>
        坐标位于新加坡。由 Microsoft Azure 驱动，
        运行 Shadowsocks 服务和老的 <a href='https://huaji8.top' target='_blank'>huaji8.top</a> 博客。
      </p>
      `,
      apikey: 'm782546644-6d4ceafd15c3613cbb075a2d',
      monitorid: '782546644'
    }
  ]
}

const options = {

};

ejs.renderFile('./index.ejs', data, options, function(err, str){
  fs.writeFileSync('index.html', str);
});