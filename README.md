# 🖼️ 이미지 압축기

브라우저에서 안전하게 이미지 용량을 줄이는 무료 온라인 도구입니다.

## ✨ 주요 기능

- 🚀 실시간 이미지 압축
- 📊 압축 전/후 비교
- 🎚️ 품질 조절 가능
- 📱 모바일 반응형
- 🔒 브라우저에서 처리 (서버 업로드 없음)
- 💾 드래그 앤 드롭 지원

## 🛠️ 기술 스택

- HTML5
- CSS3 (Pure CSS, No Framework)
- Vanilla JavaScript
- Canvas API

## 📦 배포 방법

### Netlify로 배포하기

1. GitHub에 레포지토리 생성 및 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/image-compressor.git
git push -u origin main
```

2. [Netlify](https://www.netlify.com/)에 로그인

3. "New site from Git" 클릭

4. GitHub 레포지토리 선택

5. 배포 설정:
   - Build command: (비워두기)
   - Publish directory: (비워두기 또는 `/`)

6. "Deploy site" 클릭

### 로컬에서 실행하기

그냥 `index.html` 파일을 브라우저에서 열면 됩니다.

또는 간단한 서버 실행:
```bash
# Python 3
python -m http.server 8000

# Node.js (npx 사용)
npx serve
```

## 🎯 향후 개선 계획

- [ ] 배치 처리 (여러 이미지 동시 압축)
- [ ] 이미지 포맷 변환 (PNG ↔ JPG ↔ WEBP)
- [ ] 리사이징 기능
- [ ] 워터마크 추가
- [ ] 압축 히스토리
- [ ] 다크 모드

## 📈 수익화 전략

1. Google AdSense 광고
2. 프리미엄 기능 (배치 처리)
3. Buy Me a Coffee 기부 버튼
4. API 제공 (향후)

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR은 언제든 환영합니다!

---

Made with ❤️ for web developers and designers