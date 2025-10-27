// Playwright 스크린샷 테스트
const { chromium } = require('playwright');
const path = require('path');

async function runScreenshotTests() {
  console.log('📸 스크린샷 기반 테스트 시작...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3002';
  const screenshotDir = './test-screenshots';

  try {
    // 1. 공지사항 목록 페이지
    console.log('📋 1. 공지사항 목록 페이지 캡처...');
    await page.goto(`${baseUrl}/notice`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/01-notice-list.png`, fullPage: true });
    console.log('   ✅ 저장: 01-notice-list.png');

    // 2. 배너 표시 (메인 페이지)
    console.log('\n🎯 2. 배너 캐러셀 캡처...');
    await page.goto(`${baseUrl}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/02-banner-carousel.png`, fullPage: true });
    console.log('   ✅ 저장: 02-banner-carousel.png');

    // 3. 어드민 목록 (우선순위, 상태 컬럼 확인)
    console.log('\n⚙️  3. 어드민 목록 페이지 캡처...');
    await page.goto(`${baseUrl}/admin/notice`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/03-admin-list.png`, fullPage: true });
    console.log('   ✅ 저장: 03-admin-list.png');

    // 4. 공지 작성 페이지 - 상단 부분
    console.log('\n✍️  4. 공지 작성 페이지 (상단) 캡처...');
    await page.goto(`${baseUrl}/admin/notice/new`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/04-notice-new-top.png`, fullPage: false });
    console.log('   ✅ 저장: 04-notice-new-top.png');

    // 5. 우선순위 드롭다운 열기
    console.log('\n📊 5. 우선순위 드롭다운 캡처...');
    await page.evaluate(() => {
      const select = document.querySelector('select');
      if (select) {
        select.focus();
        select.size = 5;
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/05-priority-dropdown.png`, fullPage: false });
    console.log('   ✅ 저장: 05-priority-dropdown.png');

    // 6. 예약 발행 섹션으로 스크롤
    console.log('\n📅 6. 발행 설정 섹션 캡처...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const publishSection = document.querySelector('h2:has-text("발행 설정")');
      if (publishSection) publishSection.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/06-publish-settings.png`, fullPage: false });
    console.log('   ✅ 저장: 06-publish-settings.png');

    // 7. 노출 옵션 섹션
    console.log('\n🎛️  7. 노출 옵션 섹션 캡처...');
    await page.evaluate(() => {
      const section = document.querySelector('h2:has-text("노출 옵션")');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/07-display-options.png`, fullPage: false });
    console.log('   ✅ 저장: 07-display-options.png');

    // 8. 배너 옵션 체크하고 옵션들 보기
    console.log('\n⏱️  8. 배너 닫기 유지 기간 옵션 캡처...');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 배너 표시 체크박스 찾아서 클릭
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const bannerLabel = labels.find(l => l.textContent.includes('헤더 배너 표시'));
      if (bannerLabel) {
        const checkbox = bannerLabel.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
          checkbox.click();
        }
      }
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const section = document.querySelector('label:has-text("배너 닫기 유지 기간")');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/08-dismiss-duration.png`, fullPage: false });
    console.log('   ✅ 저장: 08-dismiss-duration.png');

    // 9. 배너 닫기 유지 기간 드롭다운 열기
    console.log('\n📋 9. 닫기 유지 기간 드롭다운 캡처...');
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const dismissLabel = labels.find(l => l.textContent.includes('배너 닫기 유지 기간'));
      if (dismissLabel) {
        const select = dismissLabel.closest('div').querySelector('select');
        if (select) {
          select.focus();
          select.size = 8;
        }
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/09-dismiss-options.png`, fullPage: false });
    console.log('   ✅ 저장: 09-dismiss-options.png');

    // 10. 전체 페이지 (fullPage)
    console.log('\n📄 10. 공지 작성 페이지 전체 캡처...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotDir}/10-notice-new-full.png`, fullPage: true });
    console.log('   ✅ 저장: 10-notice-new-full.png');

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 스크린샷 캡처 완료!');
    console.log(`📁 저장 위치: ${path.resolve(screenshotDir)}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ 테스트 완료!\n');
  }
}

runScreenshotTests().catch(console.error);
