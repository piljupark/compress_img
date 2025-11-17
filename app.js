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

// Premium 관련 요소
const upgradeBtn = document.getElementById('upgradeBtn');
const premiumModal = document.getElementById('premiumModal');
const modalClose = document.getElementById('modalClose');
const limitModal = document.getElementById('limitModal');
const limitModalClose = document.getElementById('limitModalClose');
const upgradeBtnLarge = document.getElementById('upgradeBtnLarge');
const licenseInput = document.getElementById('licenseInput');
const activateBtn = document.getElementById('activateBtn');
const premiumStatus = document.getElementById('premiumStatus');

// 전역 변수
let selectedFormat = 'original';
let imageFiles = []; // 배치 처리용 이미지 배열

// Premium 관련 상태
let isPremium = false;
const FREE_BATCH_LIMIT = 20;
const PREMIUM_BATCH_LIMIT = 50;

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
    const validFiles = [];
    for (let file of files) {
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file.`);
            continue;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name} is larger than 10MB.`);
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

// ZIP 다운로드 (JSZip 라이브러리 필요)
downloadAllBtn.addEventListener('click', async () => {
    if (imageFiles.length === 0) return;
    
    // 간단한 방법: 하나씩 다운로드
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
    
    // 여러 파일: ZIP으로 묶기 (JSZip 사용)
    if (typeof JSZip === 'undefined') {
        // JSZip 동적 로드 (alert 없이)
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => downloadAsZip();
        document.head.appendChild(script);
        return;
    }
    
    downloadAsZip();
});

async function downloadAsZip() {
    const zip = new JSZip();
    
    imageFiles.forEach((imgFile, index) => {
        if (imgFile.compressed) {
            const nameWithoutExt = imgFile.file.name.substring(0, imgFile.file.name.lastIndexOf('.'));
            const ext = getExtension(imgFile.compressed.type);
            zip.file(`${nameWithoutExt}_compressed${ext}`, imgFile.compressed);
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

// ==================== Premium 기능 ====================

function initPremium() {
    isPremium = localStorage.getItem('premium') === 'true';
    updatePremiumUI();
}

function updatePremiumUI() {
    if (isPremium) {
        premiumStatus.innerHTML = '<p class="premium-badge">⭐ PREMIUM</p>';
    }
}

function showPremiumModal() {
    premiumModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePremiumModal() {
    premiumModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showLimitModal() {
    limitModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLimitModal() {
    limitModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function validateLicenseKey(key) {
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    
    if (pattern.test(key)) {
        return true;
    }
    
    if (key === 'DEMO-PREM-IUM-KEY1') {
        return true;
    }
    
    return false;
}

function activateLicense() {
    const key = licenseInput.value.trim().toUpperCase();
    
    if (!key) {
        alert('Please enter a license key');
        return;
    }
    
    if (validateLicenseKey(key)) {
        isPremium = true;
        localStorage.setItem('premium', 'true');
        localStorage.setItem('licenseKey', key);
        
        updatePremiumUI();
        closePremiumModal();
        
        alert('🎉 Premium activated successfully!');
    } else {
        alert('❌ Invalid license key. Please check and try again.');
    }
}

// Premium 이벤트 리스너
upgradeBtn.addEventListener('click', showPremiumModal);
modalClose.addEventListener('click', closePremiumModal);
limitModalClose.addEventListener('click', closeLimitModal);
upgradeBtnLarge.addEventListener('click', () => {
    closeLimitModal();
    showPremiumModal();
});
activateBtn.addEventListener('click', activateLicense);

premiumModal.addEventListener('click', (e) => {
    if (e.target === premiumModal) {
        closePremiumModal();
    }
});

limitModal.addEventListener('click', (e) => {
    if (e.target === limitModal) {
        closeLimitModal();
    }
});

// 페이지 로드 시 초기화
initPremium();