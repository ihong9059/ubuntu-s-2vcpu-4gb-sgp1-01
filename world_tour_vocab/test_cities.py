from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 콘솔 로그 캡처
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))

    page.goto('http://localhost:8080')
    page.wait_for_load_state('networkidle')

    # 도시 데이터 확인
    city_count = page.evaluate('''() => {
        return {
            total: worldCities ? worldCities.length : 0,
            cities1: typeof cities1 !== 'undefined' ? cities1.length : 0,
            cities2: typeof cities2 !== 'undefined' ? cities2.length : 0,
            cities3: typeof cities3 !== 'undefined' ? cities3.length : 0,
            cities4: typeof cities4 !== 'undefined' ? cities4.length : 0,
            levelCities: typeof levelCities !== 'undefined' ? levelCities : null
        }
    }''')

    print(f"\n=== 도시 데이터 확인 ===")
    print(f"cities1.js: {city_count['cities1']}개")
    print(f"cities2.js: {city_count['cities2']}개")
    print(f"cities3.js: {city_count['cities3']}개")
    print(f"cities4.js: {city_count['cities4']}개")
    print(f"worldCities 총계: {city_count['total']}개")
    print(f"\n난이도별 도시 수: {city_count['levelCities']}")

    # 콘솔 에러 확인
    errors = [log for log in console_logs if 'error' in log.lower()]
    if errors:
        print(f"\n=== 콘솔 에러 ===")
        for err in errors:
            print(err)
    else:
        print("\n콘솔 에러 없음")

    browser.close()
