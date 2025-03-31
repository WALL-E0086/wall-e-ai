// 此文件仅用于强制GitHub Pages重新构建
// 版本号: 1.0.0
// 创建时间: 2023-05-26

console.log('强制GitHub Pages更新');

// 确保页面加载时会刷新CSS
window.addEventListener('load', function() {
    // 添加时间戳到所有CSS链接
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        if (!link.href.includes('cdn')) {
            link.href = link.href.split('?')[0] + '?v=' + new Date().getTime();
        }
    });
    
    console.log('CSS已强制刷新');
}); 