// eye-tracking.js - 眼睛追踪鼠标的简单实现
document.addEventListener('DOMContentLoaded', function() {
    // 当文档加载完成后初始化眼睛追踪
    setTimeout(initEyeTracking, 1000); // 延迟1秒初始化，确保眼睛元素已加载
});

function initEyeTracking() {
    console.log("初始化眼睛追踪功能");
    
    // 获取瞳孔元素
    const leftPupil = document.getElementById('pupil-left');
    const rightPupil = document.getElementById('pupil-right');
    
    // 检查瞳孔元素是否存在
    if (!leftPupil || !rightPupil) {
        console.warn("找不到瞳孔元素，眼睛追踪功能无法初始化");
        // 在失败后定期尝试再次初始化
        setTimeout(initEyeTracking, 2000);
        return;
    }
    
    console.log("找到瞳孔元素，开始眼睛追踪");
    
    // 获取眼睛容器，用于计算相对位置
    const eyesContainer = document.querySelector('.eyes');
    if (!eyesContainer) {
        console.warn("找不到眼睛容器，眼睛追踪功能无法初始化");
        return;
    }
    
    // 追踪鼠标移动
    document.addEventListener('mousemove', function(e) {
        // 计算鼠标相对于眼睛容器的位置
        const eyesRect = eyesContainer.getBoundingClientRect();
        const eyesCenterX = eyesRect.left + eyesRect.width / 2;
        const eyesCenterY = eyesRect.top + eyesRect.height / 2;
        
        // 计算鼠标与眼睛中心的距离
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 计算角度（弧度）
        const angle = Math.atan2(mouseY - eyesCenterY, mouseX - eyesCenterX);
        
        // 计算瞳孔移动的最大距离（像素）
        const maxDistance = 5;
        
        // 根据视线方向计算瞳孔移动，应用平滑过渡
        const pupilX = Math.cos(angle) * maxDistance;
        const pupilY = Math.sin(angle) * maxDistance;
        
        // 应用位移到瞳孔元素
        if (leftPupil) {
            leftPupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        }
        
        if (rightPupil) {
            rightPupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        }
    });
    
    // 添加鼠标离开页面的处理
    document.addEventListener('mouseleave', function() {
        // 鼠标离开页面时，将瞳孔恢复到中心位置
        if (leftPupil) {
            leftPupil.style.transform = 'translate(0px, 0px)';
        }
        
        if (rightPupil) {
            rightPupil.style.transform = 'translate(0px, 0px)';
        }
    });
    
    console.log("眼睛追踪功能初始化完成");
}