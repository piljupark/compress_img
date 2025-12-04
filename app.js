const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const snowflakes = [];
const snowflakeCount = 150;
const accumulatedSnow = []; // 쌓인 눈 입자들

// 충돌 감지할 요소들
let collisionElements = [];

// 요소의 경계 박스 계산
function getElementBounds(element) {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
    };
}

// 충돌 감지할 요소들 업데이트
function updateCollisionElements() {
    collisionElements = [];
    
    // 업로드 박스만 추가
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea && uploadArea.style.display !== 'none') {
        collisionElements.push({
            element: uploadArea,
            bounds: getElementBounds(uploadArea),
            type: 'box'
        });
    }
}

class Snowflake {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -100 - 10;
        this.radius = Math.random() * 2.5 + 1.5;
        this.speed = Math.random() * 1 + 0.5;
        this.wind = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.4;
    }

    checkCollision() {
        // 박스 충돌 체크 - 박스 위쪽에만 쌓이도록
        for (let elem of collisionElements) {
            if (!elem.bounds) continue;
            
            if (this.x >= elem.bounds.left && 
                this.x <= elem.bounds.right &&
                this.y + this.radius >= elem.bounds.top - 5 && 
                this.y <= elem.bounds.top + 10) {
                return { y: elem.bounds.top, isBox: true };
            }
        }
        
        return null;
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;

        const collision = this.checkCollision();
        if (collision !== null && collision.isBox) {
            // 박스 위에만 쌓이고, 위로는 쌓이지 않음
            // 약간의 랜덤 오프셋으로 자연스럽게
            const randomOffsetX = (Math.random() - 0.5) * this.radius * 2;
            const randomOffsetY = (Math.random() - 0.5) * this.radius * 1.5;
            
            accumulatedSnow.push({
                x: this.x + randomOffsetX,
                y: collision.y - this.radius + randomOffsetY,
                radius: this.radius,
                opacity: this.opacity
            });
            
            // 너무 많이 쌓이면 오래된 것 제거
            if (accumulatedSnow.length > 1000) {
                accumulatedSnow.shift();
            }
            
            this.reset();
            return;
        }

        if (this.y > canvas.height) {
            this.reset();
        }

        if (this.x > canvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = canvas.width;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

// 눈송이 생성
for (let i = 0; i < snowflakeCount; i++) {
    const flake = new Snowflake();
    flake.y = Math.random() * canvas.height;
    snowflakes.push(flake);
}

// 초기 요소 위치 업데이트
setTimeout(() => {
    updateCollisionElements();
}, 100);

// 애니메이션
function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 쌓인 눈 그리기
    accumulatedSnow.forEach(snow => {
        ctx.beginPath();
        ctx.arc(snow.x, snow.y, snow.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity})`;
        ctx.fill();
    });
    
    // 떨어지는 눈 그리기
    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
    });

    requestAnimationFrame(animateSnow);
}

animateSnow();

// 리사이즈 이벤트
let resizeTimeout;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        accumulatedSnow.length = 0;
        updateCollisionElements();
    }, 100);
    
    updateCollisionElements();
});

window.addEventListener('scroll', () => {
    updateCollisionElements();
});

// 주기적으로 요소 위치 업데이트
setInterval(() => {
    updateCollisionElements();
}, 1000);


// ============================================
// 기존 이미지 압축 기능 (변경 없음)
// ============================================

// DOM 요소
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressionArea = document.getElementById('compressionArea');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const resetBtn = document.getElementById('resetBtn');
const imageGrid = document.getElementById('imageGrid');
const imageCount = document.getElementById('imageCount');
const imagePlural = document.getElementById('imagePlural');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const totalOriginalSize = document.getElementById('totalOriginalSize');
const totalCompressedSize = document.getElementById('totalCompressedSize');
const totalSaved = document.getElementById('totalSaved');

// 단일 이미지 비교 요소
const singleView = document.getElementById('singleView');
const singleDownload = document.getElementById('singleDownload');
const batchActions = document.getElementById('batchActions');
const comparisonOriginal = document.getElementById('comparisonOriginal');
const comparisonCompressed = document.getElementById('comparisonCompressed');
const comparisonSlider = document.getElementById('comparisonSlider');
const downloadSingleBtn = document.getElementById('downloadSingleBtn');
const singleOriginalSize = document.getElementById('singleOriginalSize');
const singleCompressedSize = document.getElementById('singleCompressedSize');
const singleSaved = document.getElementById('singleSaved');

// 모달 요소
const renameModal = document.getElementById('renameModal');
const closeModal = document.getElementById('closeModal');
const cancelRename = document.getElementById('cancelRename');
const confirmDownload = document.getElementById('confirmDownload');
const customPrefix = document.getElementById('customPrefix');
const numberFormat = document.getElementById('numberFormat');
const sequentialFormat = document.getElementById('sequentialFormat');
const renamePreview = document.getElementById('renamePreview');
const sequentialPreview = document.getElementById('sequentialPreview');

// 전역 변수
let selectedFormat = 'original';
let imageFiles = []; // 배치 처리용 이미지 배열

// Premium 관련 상태
let isPremium = true; // 내부 사용이므로 항상 Premium
const FREE_BATCH_LIMIT = 999; // 사실상 무제한
const PREMIUM_BATCH_LIMIT = 999; // 사실상 무제한

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 압축률 계산
function calculateCompressionRate(originalSize, compressedSize) {
    const rate = ((originalSize - compressedSize) / originalSize) * 100;
    return Math.max(0, Math.round(rate));
}

// 이미지 압축 함수
function compressImage(file, quality, outputFormat = 'original') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                let mimeType = outputFormat === 'original' ? file.type : outputFormat;
                
                canvas.toBlob(
                    (blob) => resolve(blob),
                    mimeType,
                    quality / 100
                );
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 포맷 이름 가져오기
function getFormatName(mimeType) {
    const formatMap = {
        'image/jpeg': 'JPG',
        'image/png': 'PNG',
        'image/webp': 'WEBP'
    };
    return formatMap[mimeType] || 'Unknown';
}

// 파일 확장자 가져오기
function getExtension(mimeType) {
    const extensionMap = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
    };
    return extensionMap[mimeType] || '.jpg';
}

// 숫자 포맷팅 함수
function formatNumber(num, format) {
    const numStr = String(num);
    const padLength = format.length;
    return numStr.padStart(padLength, '0');
}

// 파일명 생성 함수
function generateFileName(index, originalName, renameType, prefix, format) {
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    
    if (renameType === 'none') {
        return originalName;
    } else if (renameType === 'custom') {
        return `${prefix}_${formatNumber(index + 1, format)}${ext}`;
    } else if (renameType === 'sequential') {
        return `${formatNumber(index + 1, format)}${ext}`;
    }
    
    return originalName;
}

// 이미지 카드 생성
function createImageCard(file, index) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.index = index;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        card.innerHTML = `
            <div class="image-card-header">
                <div class="image-name" title="${file.name}">${file.name}</div>
                <button class="remove-btn" onclick="removeImage(${index})">×</button>
            </div>
            <div class="image-preview">
                <img src="${e.target.result}" alt="${file.name}">
            </div>
            <div class="image-stats">
                <div class="image-stat">
                    <span class="label">Original:</span>
                    <span class="value">${formatFileSize(file.size)}</span>
                </div>
                <div class="image-stat">
                    <span class="label">Compressed:</span>
                    <span class="value" id="compressed-${index}">Processing...</span>
                </div>
                <div class="image-stat">
                    <span class="label">Saved:</span>
                    <span class="saved" id="saved-${index}">-</span>
                </div>
            </div>
        `;
        
        imageGrid.appendChild(card);
        compressImageAtIndex(index);
    };
    
    reader.readAsDataURL(file);
}

// 특정 인덱스의 이미지 압축
async function compressImageAtIndex(index) {
    const imageFile = imageFiles[index];
    if (!imageFile) return;
    
    const card = document.querySelector(`[data-index="${index}"]`);
    if (!card) return;
    
    card.classList.add('processing');
    
    try {
        const quality = parseInt(qualitySlider.value);
        const compressedBlob = await compressImage(imageFile.file, quality, selectedFormat);
        
        imageFile.compressed = compressedBlob;
        
        // 미리보기를 압축된 이미지로 업데이트
        const compressedUrl = URL.createObjectURL(compressedBlob);
        const previewImg = card.querySelector('.image-preview img');
        if (previewImg) {
            // 기존 URL 해제
            if (previewImg.dataset.compressedUrl) {
                URL.revokeObjectURL(previewImg.dataset.compressedUrl);
            }
            previewImg.src = compressedUrl;
            previewImg.dataset.compressedUrl = compressedUrl;
        }
        
        const compressedSizeEl = document.getElementById(`compressed-${index}`);
        const savedEl = document.getElementById(`saved-${index}`);
        
        const savedRate = calculateCompressionRate(imageFile.file.size, compressedBlob.size);
        
        compressedSizeEl.textContent = formatFileSize(compressedBlob.size);
        savedEl.textContent = `${savedRate}%`;
        
        card.classList.remove('processing');
        updateTotalStats();
    } catch (error) {
        console.error('Compression error:', error);
        card.classList.remove('processing');
    }
}

// 모든 이미지 재압축
async function recompressAll() {
    for (let i = 0; i < imageFiles.length; i++) {
        await compressImageAtIndex(i);
    }
}

// 이미지 제거
function removeImage(index) {
    imageFiles.splice(index, 1);
    updateUI();
}

// UI 업데이트
function updateUI() {
    imageCount.textContent = imageFiles.length;
    imagePlural.style.display = imageFiles.length === 1 ? 'none' : 'inline';
    
    if (imageFiles.length === 0) {
        compressionArea.style.display = 'none';
        uploadArea.style.display = 'block';
        return;
    }
    
    // 1장: 단일 비교 뷰
    if (imageFiles.length === 1) {
        singleView.style.display = 'block';
        imageGrid.style.display = 'none';
        singleDownload.style.display = 'flex';
        batchActions.style.display = 'none';
        
        setupSingleView();
    }
    // 2장 이상: 그리드 뷰
    else {
        singleView.style.display = 'none';
        imageGrid.style.display = 'grid';
        singleDownload.style.display = 'none';
        batchActions.style.display = 'flex';
        
        imageGrid.innerHTML = '';
        imageFiles.forEach((imgFile, index) => {
            imgFile.index = index;
            createImageCard(imgFile.file, index);
        });
    }
}

// 단일 이미지 비교 뷰 설정
async function setupSingleView() {
    const imgFile = imageFiles[0];
    
    // 원본 이미지 표시
    const reader = new FileReader();
    reader.onload = function(e) {
        comparisonOriginal.src = e.target.result;
        comparisonCompressed.src = e.target.result; // 초기에는 같은 이미지
    };
    reader.readAsDataURL(imgFile.file);
    
    // 사이즈 표시
    singleOriginalSize.textContent = formatFileSize(imgFile.file.size);
    singleCompressedSize.textContent = 'Processing...';
    singleSaved.textContent = '-';
    
    // 압축 시작
    const quality = parseInt(qualitySlider.value);
    const compressedBlob = await compressImage(imgFile.file, quality, selectedFormat);
    imgFile.compressed = compressedBlob;
    
    // 압축된 이미지 표시
    const compressedUrl = URL.createObjectURL(compressedBlob);
    comparisonCompressed.src = compressedUrl;
    
    // 통계 업데이트
    const savedRate = calculateCompressionRate(imgFile.file.size, compressedBlob.size);
    singleCompressedSize.textContent = formatFileSize(compressedBlob.size);
    singleSaved.textContent = `${savedRate}%`;
    
    // 슬라이더 초기화
    initComparisonSlider();
}

// 비교 슬라이더 초기화
function initComparisonSlider() {
    let isDragging = false;
    
    function updateSliderPosition(e) {
        const rect = comparisonOriginal.getBoundingClientRect();
        let x = e.clientX || (e.touches && e.touches[0].clientX);
        
        if (!x) return;
        
        let position = ((x - rect.left) / rect.width) * 100;
        position = Math.max(0, Math.min(100, position));
        
        comparisonSlider.style.left = position + '%';
        comparisonCompressed.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
    }
    
    comparisonSlider.addEventListener('mousedown', () => {
        isDragging = true;
    });
    
    comparisonSlider.addEventListener('touchstart', () => {
        isDragging = true;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSliderPosition(e);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updateSliderPosition(e);
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // 클릭으로도 이동 가능
    comparisonOriginal.addEventListener('click', updateSliderPosition);
}

// 재압축 (단일 뷰)
async function recompressSingle() {
    if (imageFiles.length !== 1) return;
    
    const imgFile = imageFiles[0];
    const quality = parseInt(qualitySlider.value);
    
    singleCompressedSize.textContent = 'Processing...';
    
    const compressedBlob = await compressImage(imgFile.file, quality, selectedFormat);
    imgFile.compressed = compressedBlob;
    
    const compressedUrl = URL.createObjectURL(compressedBlob);
    comparisonCompressed.src = compressedUrl;
    
    const savedRate = calculateCompressionRate(imgFile.file.size, compressedBlob.size);
    singleCompressedSize.textContent = formatFileSize(compressedBlob.size);
    singleSaved.textContent = `${savedRate}%`;
}

// 전체 통계 업데이트
function updateTotalStats() {
    let totalOriginal = 0;
    let totalCompressed = 0;
    
    imageFiles.forEach(imgFile => {
        totalOriginal += imgFile.file.size;
        if (imgFile.compressed) {
            totalCompressed += imgFile.compressed.size;
        }
    });
    
    totalOriginalSize.textContent = formatFileSize(totalOriginal);
    totalCompressedSize.textContent = formatFileSize(totalCompressed);
    
    if (totalCompressed > 0) {
        const savedRate = calculateCompressionRate(totalOriginal, totalCompressed);
        totalSaved.textContent = `${savedRate}%`;
    }
}

// 파일 선택 처리
function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    
    // 배치 제한 체크
    const limit = isPremium ? PREMIUM_BATCH_LIMIT : FREE_BATCH_LIMIT;
    
    if (files.length > limit) {
        alert(`${isPremium ? 'Premium' : 'Free'} users can process up to ${limit} images at once.`);
        return;
    }
    
    // 파일 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const validFiles = [];
    for (let file of files) {
        // MIME 타입 체크
        const fileType = file.type.toLowerCase();
        if (!allowedTypes.includes(fileType)) {
            alert(`${file.name} 확장자는 지원하지 않습니다. JPG, PNG, WEBP 파일만 가능합니다.`);
            continue;
        }
        
        // 확장자 체크 (추가 보안)
        const fileName = file.name.toLowerCase();
        const ext = fileName.slice(fileName.lastIndexOf('.'));
        if (!allowedExtensions.includes(ext)) {
            alert(`${file.name}: JPG, PNG, WEBP 파일만 가능합니다.`);
            continue;
        }
        
        validFiles.push({ file: file, compressed: null, index: validFiles.length });
    }
    
    if (validFiles.length === 0) return;
    
    imageFiles = validFiles;
    
    uploadArea.style.display = 'none';
    compressionArea.style.display = 'block';
    
    updateUI();
}

// 이벤트 리스너
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files);
});

// 드래그 앤 드롭
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFileSelect(e.dataTransfer.files);
});

// 품질 슬라이더
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

qualitySlider.addEventListener('change', () => {
    if (imageFiles.length === 1) {
        recompressSingle();
    } else if (imageFiles.length > 1) {
        recompressAll();
    }
});

// 리셋 버튼
resetBtn.addEventListener('click', () => {
    imageFiles = [];
    fileInput.value = '';
    qualitySlider.value = 80;
    qualityValue.textContent = '80';
    selectedFormat = 'original';
    
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.format === 'original') {
            btn.classList.add('active');
        }
    });
    updateFormatHint('original');
    
    compressionArea.style.display = 'none';
    uploadArea.style.display = 'block';
});

// 단일 이미지 다운로드
downloadSingleBtn.addEventListener('click', () => {
    if (imageFiles.length !== 1 || !imageFiles[0].compressed) return;
    
    const imgFile = imageFiles[0];
    const url = URL.createObjectURL(imgFile.compressed);
    const a = document.createElement('a');
    a.href = url;
    
    const nameWithoutExt = imgFile.file.name.substring(0, imgFile.file.name.lastIndexOf('.'));
    const ext = getExtension(imgFile.compressed.type);
    a.download = `${nameWithoutExt}_compressed${ext}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 모달 열기
function openRenameModal() {
    renameModal.classList.add('active');
    renameModal.style.display = 'flex';
    updatePreview();
}

// 모달 닫기
function closeRenameModal() {
    renameModal.classList.remove('active');
    setTimeout(() => {
        renameModal.style.display = 'none';
    }, 200);
}

// 프리뷰 업데이트
function updatePreview() {
    const renameType = document.querySelector('input[name="renameType"]:checked').value;
    
    if (renameType === 'custom') {
        const prefix = customPrefix.value || 'image';
        const format = numberFormat.value;
        const sampleExt = imageFiles[0] ? imageFiles[0].file.name.substring(imageFiles[0].file.name.lastIndexOf('.')) : '.jpg';
        renamePreview.textContent = `${prefix}_${formatNumber(1, format)}${sampleExt}`;
    } else if (renameType === 'sequential') {
        const format = sequentialFormat.value;
        const sampleExt = imageFiles[0] ? imageFiles[0].file.name.substring(imageFiles[0].file.name.lastIndexOf('.')) : '.jpg';
        sequentialPreview.textContent = `${formatNumber(1, format)}${sampleExt}`;
    }
}

// 라디오 버튼 변경 이벤트
document.querySelectorAll('input[name="renameType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.getElementById('renameCustom').style.display = 
            e.target.value === 'custom' ? 'block' : 'none';
        document.getElementById('sequentialCustom').style.display = 
            e.target.value === 'sequential' ? 'block' : 'none';
        updatePreview();
    });
});

// 입력 필드 변경 이벤트
customPrefix.addEventListener('input', updatePreview);
numberFormat.addEventListener('change', updatePreview);
sequentialFormat.addEventListener('change', updatePreview);

// 모달 닫기 버튼들
closeModal.addEventListener('click', closeRenameModal);
cancelRename.addEventListener('click', closeRenameModal);
renameModal.querySelector('.modal-overlay')?.addEventListener('click', closeRenameModal);

// 다운로드 확인
confirmDownload.addEventListener('click', () => {
    const renameType = document.querySelector('input[name="renameType"]:checked').value;
    
    let config = {
        type: renameType,
        prefix: customPrefix.value || 'image',
        format: renameType === 'custom' ? numberFormat.value : sequentialFormat.value
    };
    
    closeRenameModal();
    performDownload(config);
});

// ZIP 다운로드 버튼 - 모달 열기로 변경
downloadAllBtn.addEventListener('click', () => {
    if (imageFiles.length === 0) return;
    
    // 1장일 경우 바로 다운로드
    if (imageFiles.length === 1) {
        const imgFile = imageFiles[0];
        if (!imgFile.compressed) return;
        
        const url = URL.createObjectURL(imgFile.compressed);
        const a = document.createElement('a');
        a.href = url;
        
        const nameWithoutExt = imgFile.file.name.substring(0, imgFile.file.name.lastIndexOf('.'));
        const ext = getExtension(imgFile.compressed.type);
        a.download = `${nameWithoutExt}_compressed${ext}`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }
    
    // 여러 파일일 경우 모달 열기
    openRenameModal();
});

// 실제 다운로드 수행
async function performDownload(config) {
    if (imageFiles.length === 0) return;
    
    // JSZip 로드 확인
    if (typeof JSZip === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => downloadAsZip(config);
        document.head.appendChild(script);
        return;
    }
    
    downloadAsZip(config);
}

async function downloadAsZip(config) {
    const zip = new JSZip();
    
    imageFiles.forEach((imgFile, index) => {
        if (imgFile.compressed) {
            let fileName;
            
            if (config.type === 'none') {
                // 원본 파일명 유지
                const nameWithoutExt = imgFile.file.name.substring(0, imgFile.file.name.lastIndexOf('.'));
                const ext = getExtension(imgFile.compressed.type);
                fileName = `${nameWithoutExt}_compressed${ext}`;
            } else {
                // 새로운 파일명 생성
                const originalExt = getExtension(imgFile.compressed.type);
                fileName = generateFileName(index, imgFile.file.name.replace(/\.[^.]+$/, originalExt), config.type, config.prefix, config.format);
            }
            
            zip.file(fileName, imgFile.compressed);
        }
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_images_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 포맷 버튼 이벤트 (이벤트 위임)
document.addEventListener('click', (e) => {
    if (e.target.closest('.format-btn')) {
        const btn = e.target.closest('.format-btn');
        
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        selectedFormat = btn.dataset.format;
        updateFormatHint(selectedFormat);
        
        if (imageFiles.length === 1) {
            recompressSingle();
        } else if (imageFiles.length > 1) {
            recompressAll();
        }
    }
});

// 포맷 힌트 업데이트
function updateFormatHint(format) {
    const formatHint = document.getElementById('formatHint');
    const hints = {
        'original': 'Keep original format',
        'image/jpeg': 'Best for photos, smaller size',
        'image/png': 'Supports transparency, lossless',
        'image/webp': 'Modern format, best compression'
    };
    formatHint.textContent = hints[format] || 'Keep original format';
}