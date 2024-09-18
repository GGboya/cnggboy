module.exports = {
  book: {
    assets: './assets',
    css: [
      'footer.css'
    ],
  },
  hooks: {
    'page:before': function(page) {
        var label = '&copy 版权所有 ICP证： ';
        var icp = "";
        if(this.options.pluginsConfig['icp']) {
            label = this.options.pluginsConfig['icp']['label'];
            number = this.options.pluginsConfig['icp']['number'];
            if(number && number.trim().length > 0){
                icp = "<a href='"+(this.options.pluginsConfig['icp']['link'])+"' target='_blank'>"+(number)+"</a>";
            }
        }
        var str = ' \n\n<footer class="page-footer">\n' + label +
        icp +
        '\n</footer>'
        page.content = page.content + str;
        return page;
    }
  }
};
