// 用户档案控制器
const ProfileController = {
    // 初始化
    init() {
        this.loadUserProfile();
        this.bindEvents();
        this.updateUI();
    },
    
    // 绑定事件
    bindEvents() {
        // 保存按钮点击事件
        const saveBtn = document.querySelector('#save-profile');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveUserProfile();
            });
        }
        
        // 上传自拍按钮点击事件
        const uploadBtn = document.querySelector('#upload-selfie');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.uploadSelfie();
            });
        }
        
        // 自拍文件输入变化事件
        const selfieInput = document.querySelector('#selfie-input');
        if (selfieInput) {
            selfieInput.addEventListener('change', (e) => {
                this.handleSelfieUpload(e);
            });
        }
    },
    
    // 加载用户档案
    loadUserProfile() {
        // 从本地存储加载用户数据
        const userData = app.utils.storage.load('user');
        
        if (userData) {
            app.state.user = { ...userData };
        } else {
            // 初始化空用户数据
            app.state.user = {
                name: '',
                gender: '',
                age: '',
                height: '',
                weight: '',
                healthConditions: [],
                preferences: {
                    colors: [],
                    styles: []
                },
                createdAt: new Date()
            };
        }
    },
    
    // 更新用户界面
    updateUI() {
        const user = app.state.user || {};
        
        // 更新表单字段
        this.updateFormField('name', user.name || '');
        this.updateFormField('gender', user.gender || '');
        this.updateFormField('age', user.age || '');
        this.updateFormField('height', user.height || '');
        this.updateFormField('weight', user.weight || '');
        
        // 更新健康状况复选框
        const healthCheckboxes = document.querySelectorAll('input[name="health"]');
        if (healthCheckboxes.length > 0 && user.healthConditions) {
            healthCheckboxes.forEach(checkbox => {
                checkbox.checked = user.healthConditions.includes(checkbox.value);
            });
        }
        
        // 更新喜好颜色复选框
        const colorCheckboxes = document.querySelectorAll('input[name="color"]');
        if (colorCheckboxes.length > 0 && user.preferences?.colors) {
            colorCheckboxes.forEach(checkbox => {
                checkbox.checked = user.preferences.colors.includes(checkbox.value);
            });
        }
        
        // 更新喜好风格复选框
        const styleCheckboxes = document.querySelectorAll('input[name="style"]');
        if (styleCheckboxes.length > 0 && user.preferences?.styles) {
            styleCheckboxes.forEach(checkbox => {
                checkbox.checked = user.preferences.styles.includes(checkbox.value);
            });
        }
        
        // 更新自拍预览
        this.updateSelfiePreview();
        
        // 更新档案完成度
        this.updateProfileCompleteness();
    },
    
    // 更新表单字段值
    updateFormField(fieldName, value) {
        const field = document.querySelector(`#profile-${fieldName}`);
        if (field) {
            field.value = value;
        }
    },
    
    // 更新自拍预览
    updateSelfiePreview() {
        const selfiePreview = document.querySelector('#selfie-preview');
        if (selfiePreview && app.state.user.selfieUrl) {
            selfiePreview.src = app.state.user.selfieUrl;
            selfiePreview.classList.remove('hidden');
            
            // 隐藏上传按钮，显示更改按钮
            const uploadBtn = document.querySelector('#upload-selfie');
            const changeBtn = document.querySelector('#change-selfie');
            
            if (uploadBtn && changeBtn) {
                uploadBtn.classList.add('hidden');
                changeBtn.classList.remove('hidden');
            }
        }
    },
    
    // 保存用户档案
    saveUserProfile() {
        // 获取表单数据
        const name = document.querySelector('#profile-name')?.value || '';
        const gender = document.querySelector('#profile-gender')?.value || '';
        const age = document.querySelector('#profile-age')?.value || '';
        const height = document.querySelector('#profile-height')?.value || '';
        const weight = document.querySelector('#profile-weight')?.value || '';
        
        // 获取健康状况复选框值
        const healthConditions = [];
        const healthCheckboxes = document.querySelectorAll('input[name="health"]:checked');
        healthCheckboxes.forEach(checkbox => {
            healthConditions.push(checkbox.value);
        });
        
        // 获取喜好颜色
        const colors = [];
        const colorCheckboxes = document.querySelectorAll('input[name="color"]:checked');
        colorCheckboxes.forEach(checkbox => {
            colors.push(checkbox.value);
        });
        
        // 获取喜好风格
        const styles = [];
        const styleCheckboxes = document.querySelectorAll('input[name="style"]:checked');
        styleCheckboxes.forEach(checkbox => {
            styles.push(checkbox.value);
        });
        
        // 验证必填字段
        if (!gender || !height || !weight) {
            this.showNotification('请填写必填字段', 'error');
            return;
        }
        
        // 更新用户数据
        const userData = {
            ...app.state.user,
            name,
            gender,
            age: parseInt(age) || '',
            height: parseInt(height) || '',
            weight: parseInt(weight) || '',
            healthConditions,
            preferences: {
                colors,
                styles
            },
            updatedAt: new Date()
        };
        
        // 更新全局状态
        app.state.user = userData;
        
        // 保存到本地存储
        app.utils.storage.save('user', userData);
        
        // 触发用户信息更新事件
        window.dispatchEvent(new CustomEvent('userprofileupdate', { 
            detail: app.state.user 
        }));
        
        // 显示成功消息
        this.showNotification('个人资料已保存');
        
        // 更新档案完成度
        this.updateProfileCompleteness();
    },
    
    // 上传自拍
    uploadSelfie() {
        const selfieInput = document.querySelector('#selfie-input');
        if (selfieInput) {
            selfieInput.click();
        }
    },
    
    // 处理自拍上传
    handleSelfieUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (!file.type.match('image.*')) {
            this.showNotification('请上传图片文件', 'error');
            return;
        }
        
        // 限制文件大小（2MB）
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('图片大小不能超过2MB', 'error');
            return;
        }
        
        // 读取文件并转为Data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            // 更新用户自拍URL
            app.state.user.selfieUrl = e.target.result;
            
            // 保存到本地存储
            app.utils.storage.save('user', app.state.user);
            
            // 更新自拍预览
            this.updateSelfiePreview();
            
            // 显示成功消息
            this.showNotification('自拍已上传');
            
            // 触发用户信息更新事件
            window.dispatchEvent(new CustomEvent('userprofileupdate', { 
                detail: app.state.user 
            }));
        };
        
        reader.onerror = () => {
            this.showNotification('图片上传失败，请重试', 'error');
        };
        
        reader.readAsDataURL(file);
    },
    
    // 更新档案完成度
    updateProfileCompleteness() {
        const user = app.state.user || {};
        
        // 必填字段
        const requiredFields = ['gender', 'height', 'weight'];
        const missingFields = requiredFields.filter(field => !user[field]);
        
        // 可选字段
        const optionalFields = ['name', 'age', 'healthConditions', 'selfieUrl'];
        const filledOptionalFields = optionalFields.filter(field => {
            if (field === 'healthConditions') {
                return user[field] && user[field].length > 0;
            }
            return user[field];
        });
        
        // 计算完成度
        const requiredFieldsWeight = 0.7; // 必填字段权重70%
        const optionalFieldsWeight = 0.3; // 可选字段权重30%
        
        const requiredCompletion = missingFields.length === 0 ? 1 : (requiredFields.length - missingFields.length) / requiredFields.length;
        const optionalCompletion = filledOptionalFields.length / optionalFields.length;
        
        const totalCompletion = requiredCompletion * requiredFieldsWeight + optionalCompletion * optionalFieldsWeight;
        const completionPercentage = Math.round(totalCompletion * 100);
        
        // 更新完成度显示
        const completionElement = document.querySelector('#profile-completion');
        if (completionElement) {
            completionElement.textContent = `${completionPercentage}%`;
            
            // 更新完成度条
            const progressBar = document.querySelector('#profile-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${completionPercentage}%`;
                
                // 根据完成度设置颜色
                if (completionPercentage < 30) {
                    progressBar.classList.remove('bg-yellow-500', 'bg-green-500');
                    progressBar.classList.add('bg-red-500');
                } else if (completionPercentage < 70) {
                    progressBar.classList.remove('bg-red-500', 'bg-green-500');
                    progressBar.classList.add('bg-yellow-500');
                } else {
                    progressBar.classList.remove('bg-red-500', 'bg-yellow-500');
                    progressBar.classList.add('bg-green-500');
                }
            }
        }
        
        // 如果所有必填字段都已填写，显示完成提示
        const incompleteWarning = document.querySelector('#incomplete-profile-warning');
        if (incompleteWarning) {
            if (missingFields.length === 0) {
                incompleteWarning.classList.add('hidden');
            } else {
                incompleteWarning.classList.remove('hidden');
                
                // 更新缺失字段列表
                const missingFieldsList = document.querySelector('#missing-fields-list');
                if (missingFieldsList) {
                    missingFieldsList.innerHTML = '';
                    
                    const fieldNameMap = {
                        gender: '性别',
                        height: '身高',
                        weight: '体重'
                    };
                    
                    missingFields.forEach(field => {
                        const listItem = document.createElement('li');
                        listItem.textContent = fieldNameMap[field] || field;
                        listItem.className = 'text-sm text-red-500';
                        missingFieldsList.appendChild(listItem);
                    });
                }
            }
        }
    },
    
    // 显示通知
    showNotification(message, type = 'success') {
        const notification = document.querySelector('#notification');
        
        if (notification) {
            notification.textContent = message;
            
            // 设置通知类型样式
            notification.classList.remove('bg-green-500', 'bg-red-500');
            notification.classList.add(type === 'error' ? 'bg-red-500' : 'bg-green-500');
            
            // 显示通知
            notification.classList.replace('scale-0', 'scale-100');
            
            // 3秒后隐藏
            setTimeout(() => {
                notification.classList.replace('scale-100', 'scale-0');
            }, 3000);
        }
    }
};

// 当页面加载完成后初始化个人资料控制器
document.addEventListener('DOMContentLoaded', () => {
    ProfileController.init();
}); 