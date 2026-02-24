from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 콘솔 로그 캡처
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))

    page.goto('http://localhost:8080')
    page.wait_for_load_state('networkidle')

    # 스크린샷
    page.screenshot(path='C:/todo/today/영어/world_tour_vocab/test_screenshot1.png', full_page=True)

    # 초보자 레벨 선택
    page.click('[data-level="beginner"]')
    time.sleep(0.5)

    # 지도에서 첫 번째 도시 클릭 (서울)
    page.wait_for_selector('#setup-map')
    time.sleep(1)

    # 지도 클릭으로 도시 선택 - 서울 좌표 근처 클릭
    map_element = page.locator('#setup-map')
    map_element.click(position={"x": 400, "y": 200})
    time.sleep(0.5)

    page.screenshot(path='C:/todo/today/영어/world_tour_vocab/test_screenshot2.png', full_page=True)

    # 시작 버튼 클릭 가능 여부 확인
    start_btn = page.locator('#start-btn')
    is_disabled = start_btn.get_attribute('disabled')
    print(f"Start button disabled: {is_disabled}")

    # vocabularyData 확인을 위한 JavaScript 실행
    vocab_count = page.evaluate('''() => {
        return {
            beginner: vocabularyData.beginner ? vocabularyData.beginner.length : 0,
            intermediate: vocabularyData.intermediate ? vocabularyData.intermediate.length : 0,
            advanced: vocabularyData.advanced ? vocabularyData.advanced.length : 0,
            expert: vocabularyData.expert ? vocabularyData.expert.length : 0
        }
    }''')

    print(f"\\n=== 단어 개수 확인 ===")
    print(f"초보자 (beginner): {vocab_count['beginner']}개")
    print(f"중급자 (intermediate): {vocab_count['intermediate']}개")
    print(f"고급자 (advanced): {vocab_count['advanced']}개")
    print(f"전문가 (expert): {vocab_count['expert']}개")
    print(f"총계: {vocab_count['beginner'] + vocab_count['intermediate'] + vocab_count['advanced'] + vocab_count['expert']}개")

    # 콘솔 에러 확인
    print(f"\\n=== 콘솔 로그 ===")
    for log in console_logs:
        print(log)

    browser.close()
