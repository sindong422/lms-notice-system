// Playwright 간소화 테스트 스크립트
const { chromium } = require('playwright');

async function runTests() {
  console.log('🚀 Playwright 간소화 테스트 시작...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3002';
  const results = [];

  try {
    // ========================================
    // 1단계 기능 테스트
    // ========================================
    console.log('━'.repeat(60));
    console.log('✅ 1단계 (핵심) - 배너/모달 닫기 유지 기간 + 우선순위');
    console.log('━'.repeat(60));

    await page.goto(`${baseUrl}/admin/notice/new`);
    await page.waitForLoadState('networkidle');

    // 우선순위 드롭다운
    const priority1 = await page.locator('option:has-text("🔴 최상")').count();
    const priority5 = await page.locator('option:has-text("🔵 최하")').count();
    console.log(`\n📊 우선순위 설정:`);
    console.log(`   ${priority1 > 0 ? '✅' : '❌'} 우선순위 1 (최상) 옵션 확인`);
    console.log(`   ${priority5 > 0 ? '✅' : '❌'} 우선순위 5 (최하) 옵션 확인`);

    // 배너 옵션 펼치기
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) checkbox.click();
    });
    await page.waitForTimeout(500);

    // 배너 닫기 유지 기간 확인
    const dismiss1h = await page.locator('option:has-text("1시간 동안")').count();
    const dismissPerm = await page.locator('option:has-text("다시 보지 않기")').count();
    console.log(`\n⏱️  배너/모달 닫기 유지 기간:`);
    console.log(`   ${dismiss1h > 0 ? '✅' : '❌'} "1시간 동안 보지 않기" 옵션 확인`);
    console.log(`   ${dismissPerm > 0 ? '✅' : '❌'} "다시 보지 않기" 옵션 확인`);

    results.push({ stage: '1단계', pass: priority1 > 0 && dismiss1h > 0 });

    // ========================================
    // 2단계 기능 테스트
    // ========================================
    console.log('\n' + '━'.repeat(60));
    console.log('✅ 2단계 (중요) - 자동 만료 + 예약 발행 + 상태 관리');
    console.log('━'.repeat(60));

    // 예약 발행
    const publishAt = await page.locator('text=예약 발행').count();
    console.log(`\n📅 예약 발행:`);
    console.log(`   ${publishAt > 0 ? '✅' : '❌'} 예약 발행 옵션 확인`);

    // 자동 만료
    const expireAt = await page.locator('text=자동 만료').count();
    console.log(`\n⏰ 자동 만료:`);
    console.log(`   ${expireAt > 0 ? '✅' : '❌'} 자동 만료 옵션 확인`);

    // 상태 관리 (어드민 목록에서 확인)
    await page.goto(`${baseUrl}/admin/notice`);
    await page.waitForLoadState('networkidle');

    const statusColumn = await page.locator('th:has-text("상태")').count();
    const statusLabels = await page.locator('span:has-text("발행됨"), span:has-text("임시저장")').count();
    console.log(`\n📊 상태 관리:`);
    console.log(`   ${statusColumn > 0 ? '✅' : '❌'} 상태 컬럼 표시`);
    console.log(`   ${statusLabels > 0 ? '✅' : '❌'} 상태 레이블 (${statusLabels}개 발견)`);

    results.push({ stage: '2단계', pass: publishAt > 0 && expireAt > 0 && statusColumn > 0 });

    // ========================================
    // 3단계 기능 테스트
    // ========================================
    console.log('\n' + '━'.repeat(60));
    console.log('✅ 3단계 (개선) - 미리보기 모달 + 배너 캐러셀');
    console.log('━'.repeat(60));

    // 미리보기 버튼
    await page.goto(`${baseUrl}/admin/notice/new`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="제목"]', '테스트 공지');
    await page.fill('textarea', '<p>테스트</p>');

    const previewBtn = await page.locator('button:has-text("미리보기")').count();
    console.log(`\n👁️  미리보기 모달:`);
    console.log(`   ${previewBtn > 0 ? '✅' : '❌'} 미리보기 버튼 확인`);

    // 미리보기 클릭
    if (previewBtn > 0) {
      await page.click('button:has-text("미리보기")');
      await page.waitForTimeout(1000);

      const previewModal = await page.locator('h2:has-text("공지 미리보기")').count();
      const tabBanner = await page.locator('button:has-text("배너 미리보기")').count();
      const tabModal = await page.locator('button:has-text("모달 미리보기")').count();
      const tabDetail = await page.locator('button:has-text("상세 페이지")').count();

      console.log(`   ${previewModal > 0 ? '✅' : '❌'} 미리보기 모달 열림`);
      console.log(`   ${tabBanner > 0 ? '✅' : '❌'} 배너 미리보기 탭`);
      console.log(`   ${tabModal > 0 ? '✅' : '❌'} 모달 미리보기 탭`);
      console.log(`   ${tabDetail > 0 ? '✅' : '❌'} 상세 페이지 탭`);

      // 모달 닫기
      const closeBtn = page.locator('button').first();
      await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // 배너 캐러셀 (메인 페이지)
    await page.goto(`${baseUrl}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const bannerExists = await page.locator('text=/자세히 보기/').count() > 0;
    const indicators = await page.locator('button[aria-label*="배너"]').count();
    const prevBtn = await page.locator('button[aria-label="이전 배너"]').count();
    const nextBtn = await page.locator('button[aria-label="다음 배너"]').count();

    console.log(`\n🎠 배너 캐러셀:`);
    console.log(`   ${bannerExists ? '✅' : '❌'} 배너 표시됨`);
    console.log(`   ${indicators > 0 ? '✅' : 'ℹ️'} 도트 인디케이터 (${indicators}개)`);
    console.log(`   ${prevBtn > 0 || nextBtn > 0 ? '✅' : 'ℹ️'} 이전/다음 버튼 (단일 배너면 미표시)`);

    results.push({ stage: '3단계', pass: previewBtn > 0 && bannerExists });

    // ========================================
    // 기타 확인 사항
    // ========================================
    console.log('\n' + '━'.repeat(60));
    console.log('🔍 추가 확인 사항');
    console.log('━'.repeat(60));

    // 사용자 목록 페이지 필터링
    await page.goto(`${baseUrl}/notice`);
    await page.waitForLoadState('networkidle');

    const categoryTabs = await page.locator('button:has-text("전체"), button:has-text("긴급공지")').count();
    const searchBar = await page.locator('input[placeholder*="검색"]').count();

    console.log(`\n🔎 사용자 목록 페이지:`);
    console.log(`   ${categoryTabs >= 2 ? '✅' : '❌'} 카테고리 탭 (${categoryTabs}개)`);
    console.log(`   ${searchBar > 0 ? '✅' : '❌'} 검색바 표시`);

    // 어드민 목록 페이지
    await page.goto(`${baseUrl}/admin/notice`);
    await page.waitForLoadState('networkidle');

    const priorityCol = await page.locator('th:has-text("우선순위")').count();
    const newBtn = await page.locator('button:has-text("새 공지 작성")').count();

    console.log(`\n⚙️  어드민 목록 페이지:`);
    console.log(`   ${priorityCol > 0 ? '✅' : '❌'} 우선순위 컬럼`);
    console.log(`   ${newBtn > 0 ? '✅' : '❌'} 새 공지 작성 버튼`);

    // ========================================
    // 최종 결과
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 테스트 결과');
    console.log('='.repeat(60));

    let allPass = true;
    results.forEach((result, idx) => {
      const icon = result.pass ? '✅' : '❌';
      console.log(`${icon} ${result.stage}: ${result.pass ? 'PASS' : 'FAIL'}`);
      if (!result.pass) allPass = false;
    });

    console.log('='.repeat(60));
    if (allPass) {
      console.log('🎉 모든 핵심 기능이 정상 작동합니다!');
    } else {
      console.log('⚠️  일부 기능에 문제가 있습니다.');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ 테스트 완료!\n');
  }
}

runTests().catch(console.error);
