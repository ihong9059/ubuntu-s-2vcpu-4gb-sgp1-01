"""
Travel English - Cloud 서버 (do-server용)
Claude CLI를 호출하여 시나리오를 생성합니다.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import subprocess
import sys
from datetime import datetime

PORT = 10001
SCENARIOS_DIR = "scenarios"

class TravelEnglishHandler(SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path == '/generate':
            self.handle_generate()
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == '/scenarios':
            self.handle_list_scenarios()
        elif self.path.startswith('/scenario/'):
            self.handle_get_scenario()
        elif self.path == '/progress':
            self.handle_progress()
        else:
            super().do_GET()

    def handle_progress(self):
        """생성 진행 상황 확인"""
        progress_file = os.path.join(SCENARIOS_DIR, "progress.json")
        if os.path.exists(progress_file):
            with open(progress_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {'status': 'idle', 'message': '대기 중'}

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

    def handle_generate(self):
        """Claude CLI로 시나리오 생성"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        level = data.get('level', 'beginner')
        departure = data.get('departure', '서울')
        destination = data.get('destination', '파리')
        budget = data.get('budget', 2000)
        duration = data.get('duration', 14)
        purpose = data.get('purpose', 'tourism')

        # 여행 목적별 설명
        purpose_info = {
            'tourism': {
                'name': '관광/휴양',
                'desc': '유명 관광지 방문, 맛집 탐방, 휴식, 사진 촬영',
                'scenes': '관광지 티켓 구매, 가이드 투어, 레스토랑 예약, 스파/마사지, 기념품 쇼핑, 사진 부탁하기'
            },
            'backpacking': {
                'name': '배낭여행',
                'desc': '저예산 여행, 현지인 교류, 숨겨진 명소, 자유로운 일정',
                'scenes': '호스텔 도미토리, 히치하이킹, 길거리 음식, 무료 투어, 현지인과 대화, 야간버스, 돈 부족시 아르바이트'
            },
            'business': {
                'name': '출장/비즈니스',
                'desc': '비즈니스 미팅, 컨퍼런스, 공식 만찬, 비즈니스 에티켓',
                'scenes': '비즈니스 호텔 체크인, 택시로 회사 방문, 미팅룸 예약, 비즈니스 점심, 프레젠테이션, 명함 교환, 공항 라운지'
            },
            'study': {
                'name': '어학연수/유학',
                'desc': '학교 등록, 홈스테이, 학생 생활, 문화 체험',
                'scenes': '학교 등록, 홈스테이 가족과 대화, 수업 질문, 도서관 이용, 학생 카페테리아, 동아리 가입, 은행 계좌 개설'
            },
            'working_holiday': {
                'name': '워킹홀리데이',
                'desc': '아르바이트, 장기 체류, 현지 생활, 여행과 일 병행',
                'scenes': '아르바이트 면접, 이력서 제출, 월세 계약, 마트 장보기, 직장 동료와 대화, 월급 협상, 비자 연장'
            },
            'honeymoon': {
                'name': '신혼여행',
                'desc': '로맨틱한 경험, 고급 리조트, 특별한 디너, 커플 액티비티',
                'scenes': '리조트 체크인, 스위트룸 요청, 로맨틱 디너 예약, 커플 스파, 선셋 크루즈, 깜짝 이벤트 준비, 기념일 케이크'
            },
            'family': {
                'name': '가족여행',
                'desc': '아이 동반, 안전한 코스, 가족 활동, 편의시설',
                'scenes': '유아용 좌석 요청, 키즈 메뉴 주문, 테마파크 티켓, 유모차 대여, 아이 아플 때 약국, 가족 사진 촬영, 호텔 엑스트라 베드'
            },
            'adventure': {
                'name': '모험여행',
                'desc': '액티비티, 트레킹, 익스트림 스포츠, 자연 탐험',
                'scenes': '스카이다이빙 예약, 스쿠버 다이빙 라이센스, 트레킹 가이드 고용, 장비 렌탈, 안전 브리핑, 응급상황 대처, 캠핑장 예약'
            }
        }

        purpose_data = purpose_info.get(purpose, purpose_info['tourism'])

        print(f"\n{'='*50}")
        print(f"[시나리오 생성 요청]")
        print(f"  출발지: {departure}")
        print(f"  도착지: {destination}")
        print(f"  예산: ${budget}")
        print(f"  기간: {duration}일")
        print(f"  목적: {purpose_data['name']}")
        print(f"  레벨: {level}")
        print(f"{'='*50}")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"scenario_{timestamp}.json"
        filepath = os.path.join(SCENARIOS_DIR, filename)

        # 총 장면 수
        total_scenes = 30

        # 예산 수준 판단
        budget_per_day = int(budget) / int(duration)
        if budget_per_day < 80:
            budget_level = "극저예산"
            budget_desc = "저가항공 여러번 경유, 호스텔/야간버스, 편의점/길거리음식, 히치하이킹, 아르바이트 필수"
        elif budget_per_day < 150:
            budget_level = "저예산"
            budget_desc = "저가항공 1-2회 경유, 게스트하우스, 현지 로컬식당, 대중교통"
        elif budget_per_day < 250:
            budget_level = "보통"
            budget_desc = "일반항공, 비즈니스호텔, 일반 레스토랑, 가끔 택시"
        else:
            budget_level = "여유"
            budget_desc = "직항/비즈니스클래스, 고급호텔, 파인다이닝, 택시/렌터카"

        # Claude 프롬프트 (간소화)
        prompt = f'''여행 영어 회화 시나리오 JSON 생성. {total_scenes}개 scene 필수.

여행: {departure}→{destination}, {duration}일, ${budget}, {purpose_data['name']}, {level}

JSON만 출력 (코드블록 없이):
{{"info":{{"departure":"{departure}","destination":"{destination}","budget":{budget},"duration":{duration},"level":"{level}"}},"route":[{{"city":"도시","country":"국가","lat":0,"lng":0}}],"scenes":[{{"day":1,"location":"장소","city":"도시","situation":"상황설명","dialogues":[{{"speaker":"staff","english":"Hello","korean":"안녕"}}],"playerResponse":{{"prompt":"응답하세요","choices":[{{"text":"Hi","correct":true,"feedback":"좋아요"}},{{"text":"No","correct":false,"feedback":"아니에요"}}]}}}}]}}

조건:
- 정확히 {total_scenes}개 scene
- 공항체크인,기내,입국심사,호텔,식당,관광지,쇼핑 등 다양한 상황
- 4개 선택지, 정답 1-2개
- route에 경유도시 포함 (위경도 정확히)'''

        # 진행 상황 파일
        progress_file = os.path.join(SCENARIOS_DIR, "progress.json")

        def update_progress(status, message, percent=0):
            with open(progress_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'status': status,
                    'message': message,
                    'percent': percent,
                    'destination': destination,
                    'purpose': purpose_data['name'],
                    'total_scenes': total_scenes
                }, f, ensure_ascii=False)

        try:
            update_progress('generating', f'🚀 Claude가 {destination} 여행 시나리오를 생성 중...', 10)
            print("  Claude CLI 호출 중...")
            sys.stdout.flush()

            update_progress('generating', f'✍️ {total_scenes}개 장면 작성 중... (약 1-2분 소요)', 20)

            # Claude CLI 실행 (10분 타임아웃)
            result = subprocess.run(
                ['claude', '-p', prompt, '--output-format', 'text'],
                capture_output=True,
                text=True,
                timeout=600
            )

            print(f"  종료 코드: {result.returncode}")

            if result.returncode == 0:
                update_progress('processing', '📝 시나리오 데이터 처리 중...', 70)

                output = result.stdout.strip()
                print(f"  출력 길이: {len(output)} 문자")

                # JSON 추출
                if '```json' in output:
                    output = output.split('```json')[1].split('```')[0].strip()
                elif '```' in output:
                    parts = output.split('```')
                    if len(parts) >= 2:
                        output = parts[1].strip()

                # JSON 시작/끝 찾기
                start_idx = output.find('{')
                end_idx = output.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    output = output[start_idx:end_idx+1]

                update_progress('processing', '🔍 JSON 파싱 중...', 80)

                # JSON 파싱
                scenario_data = json.loads(output)
                scenes_count = len(scenario_data.get('scenes', []))
                route_count = len(scenario_data.get('route', []))
                print(f"  경로: {route_count}개 도시")
                print(f"  장면: {scenes_count}개")

                update_progress('saving', f'💾 저장 중... ({scenes_count}개 장면)', 90)

                # 저장
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(scenario_data, f, ensure_ascii=False, indent=2)

                print(f"  저장: {filepath}")
                print(f"{'='*50}\n")

                update_progress('complete', f'✅ 완료! {scenes_count}개 장면 생성됨', 100)

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'filename': filename
                }).encode())
            else:
                print(f"  Claude 오류: {result.stderr}")
                sys.stdout.flush()
                update_progress('error', '❌ Claude 실행 오류', 0)
                raise Exception(result.stderr or "Claude CLI 오류")

        except subprocess.TimeoutExpired as e:
            print("  시간 초과! (10분)")
            print(f"  상세: {e}")
            sys.stdout.flush()
            update_progress('error', '⏰ 시간 초과 (10분)', 0)
            self.send_error_json('시나리오 생성 시간 초과 (10분)')

        except json.JSONDecodeError as e:
            print(f"  JSON 파싱 오류: {e}")
            update_progress('error', '❌ JSON 파싱 오류', 0)
            self.send_error_json(f'JSON 파싱 오류')

        except Exception as e:
            print(f"  오류: {e}")
            update_progress('error', f'❌ 오류: {str(e)[:50]}', 0)
            self.send_error_json(str(e))

    def send_error_json(self, message):
        self.send_response(500)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            'success': False,
            'error': message
        }).encode())

    def handle_list_scenarios(self):
        """시나리오 목록"""
        scenarios = []
        if os.path.exists(SCENARIOS_DIR):
            scenarios = sorted(
                [f for f in os.listdir(SCENARIOS_DIR) if f.startswith('scenario_') and f.endswith('.json')],
                reverse=True
            )

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'scenarios': scenarios}).encode())

    def handle_get_scenario(self):
        """시나리오 로드"""
        filename = self.path.split('/scenario/')[1]
        filepath = os.path.join(SCENARIOS_DIR, filename)

        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(SCENARIOS_DIR, exist_ok=True)

    server = HTTPServer(('0.0.0.0', PORT), TravelEnglishHandler)
    print(f"""
╔══════════════════════════════════════════════════════════╗
║       Travel English - Cloud Server (do-server)          ║
╠══════════════════════════════════════════════════════════╣
║  서버 주소: http://178.128.90.37:{PORT}                    ║
║  Claude CLI를 사용하여 시나리오를 생성합니다              ║
║  종료: Ctrl+C                                            ║
╚══════════════════════════════════════════════════════════╝
""")
    sys.stdout.flush()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버 종료")
        server.shutdown()


if __name__ == '__main__':
    main()
