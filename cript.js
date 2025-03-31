[33mcommit 27a24530830a02b72d90429a351bb3aa0cd66953[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: WALL-E AI <your-email@example.com>
Date:   Mon Mar 31 10:52:36 2025 +0800

    修复：解决天气获取失败时无法手动设置城市的问题

[1mdiff --git a/script.js b/script.js[m
[1mindex 64564a8..86e71b9 100644[m
[1m--- a/script.js[m
[1m+++ b/script.js[m
[36m@@ -495,7 +495,7 @@[m [mfunction autoDetectCity() {[m
     // 由于无法可靠地获取用户IP所在城市，直接使用默认城市[m
     if (cityInput) {[m
         cityInput.value = DEFAULT_CITY;[m
[31m-        cityInput.disabled = false;[m
[32m+[m[32m        cityInput.disabled = false; // 确保输入框始终可用[m
         [m
         // 获取天气数据[m
         fetchWeatherData();[m
[36m@@ -737,8 +737,29 @@[m [mfunction showWeatherError() {[m
         descElement.classList.remove('hidden');[m
     }[m
     [m
[32m+[m[32m    // 确保城市输入框可用，不被禁用[m
[32m+[m[32m    const cityInput = document.getElementById('city');[m
[32m+[m[32m    if (cityInput) {[m
[32m+[m[32m        cityInput.disabled = false;[m
[32m+[m[32m        // 如果输入框为空，则填入默认城市[m
[32m+[m[32m        if (!cityInput.value.trim()) {[m
[32m+[m[32m            cityInput.value = DEFAULT_CITY;[m
[32m+[m[32m        }[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    // 隐藏穿搭建议的加载状态，显示错误信息[m
[32m+[m[32m    const outfitLoading = document.getElementById('outfit-loading');[m
[32m+[m[32m    const outfitContent = document.getElementById('outfit-content');[m
[32m+[m[32m    if (outfitLoading) {[m
[32m+[m[32m        outfitLoading.textContent = '无法获取天气数据，请检查城市名称后重试';[m
[32m+[m[32m        outfitLoading.classList.remove('hidden');[m
[32m+[m[32m    }[m
[32m+[m[32m    if (outfitContent) {[m
[32m+[m[32m        outfitContent.classList.add('hidden');[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
     // 显示提示消息[m
[31m-    showToast('获取天气数据失败，请稍后重试', 'error');[m
[32m+[m[32m    showToast('获取天气数据失败，请检查城市名称后重试', 'error');[m
 }[m
 [m
 // 根据天气数据生成穿搭建议[m
