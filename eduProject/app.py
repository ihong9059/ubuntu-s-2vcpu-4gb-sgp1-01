# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify, session
import json
import os
import subprocess
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'metacognition-test-secret-key-2024'

# 데이터 저장 폴더
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

@app.route('/')
def index():
    """메인 페이지"""
    # 세션 초기화
    session.clear()
    session['test_results'] = {}
    return render_template('index.html')

@app.route('/test1')
def test1():
    """영역 1: 자기인식 정확도 테스트"""
    return render_template('test1_self_awareness.html')

@app.route('/test2')
def test2():
    """영역 2: 학습전략 인식 설문"""
    return render_template('test2_learning_strategy.html')

@app.route('/test3')
def test3():
    """영역 3: 계획 및 목표설정"""
    return render_template('test3_planning.html')

@app.route('/test4')
def test4():
    """영역 4: 자기점검 능력 (시나리오)"""
    return render_template('test4_self_monitoring.html')

@app.route('/test5')
def test5():
    """영역 5: 자기조절 능력"""
    return render_template('test5_self_regulation.html')

@app.route('/save_result', methods=['POST'])
def save_result():
    """각 테스트 결과 저장"""
    data = request.json
    test_name = data.get('test_name')
    result = data.get('result')

    if 'test_results' not in session:
        session['test_results'] = {}

    session['test_results'][test_name] = result
    session.modified = True

    return jsonify({'status': 'success'})

@app.route('/result')
def result():
    """종합 결과 페이지"""
    results = session.get('test_results', {})
    return render_template('result.html', results=results)

@app.route('/analysis')
def analysis():
    """레이더 차트 분석 페이지"""
    return render_template('analysis.html')

@app.route('/generate_prompt', methods=['POST'])
def generate_prompt():
    """AI 분석용 프롬프트 생성"""
    data = request.json
    student_info = data.get('student_info', {})
    test_results = data.get('test_results', {})

    prompt = generate_ai_prompt(student_info, test_results)

    return jsonify({'prompt': prompt})

def generate_ai_prompt(student_info, test_results):
    """AI 분석 프롬프트 생성 함수"""

    prompt = f"""# 메타인지 테스트 결과 분석 요청

## 학생 정보
- 이름: {student_info.get('name', '미입력')}
- 학년: 고등학교 {student_info.get('grade', '2')}학년
- 희망 진로/계열: {student_info.get('career', '미정')}
- 목표 대학 수준: {student_info.get('goal', '미정')}

## 테스트 결과

### 영역 1: 자기인식 정확도
- 점수: {test_results.get('test1', {}).get('score', 0)}점
- 유형: {test_results.get('test1', {}).get('type', '미측정')}
- 세부 데이터:
  - 과대평가 문항 수: {test_results.get('test1', {}).get('overestimate', 0)}개
  - 과소평가 문항 수: {test_results.get('test1', {}).get('underestimate', 0)}개
  - 정확 예측 문항 수: {test_results.get('test1', {}).get('accurate', 0)}개

### 영역 2: 학습전략 인식
- 총점: {test_results.get('test2', {}).get('total', 0)}점 / 100점
- 하위 영역별 점수:
  - 계획 전략: {test_results.get('test2', {}).get('planning', 0)}점 / 25점
  - 점검 전략: {test_results.get('test2', {}).get('monitoring', 0)}점 / 25점
  - 조절 전략: {test_results.get('test2', {}).get('regulating', 0)}점 / 25점
  - 인지 전략: {test_results.get('test2', {}).get('cognitive', 0)}점 / 25점

### 영역 3: 계획 및 목표설정
- 총점: {test_results.get('test3', {}).get('score', 0)}점 / 100점
- 세부 평가:
  - 목표의 구체성: {test_results.get('test3', {}).get('specificity', 0)}점 / 20점
  - 목표의 현실성: {test_results.get('test3', {}).get('realism', 0)}점 / 20점
  - 계획의 구체성: {test_results.get('test3', {}).get('plan_detail', 0)}점 / 20점
  - 균형성: {test_results.get('test3', {}).get('balance', 0)}점 / 20점
  - 실행 가능성: {test_results.get('test3', {}).get('feasibility', 0)}점 / 20점
- 작성한 계획 내용: {test_results.get('test3', {}).get('plan_text', '미작성')}

### 영역 4: 자기점검 능력
- 총점: {test_results.get('test4', {}).get('score', 0)}점 / 36점
- 세부 영역:
  - 이해 점검: {test_results.get('test4', {}).get('understanding', 0)}점 / 9점
  - 전략 사용: {test_results.get('test4', {}).get('strategy', 0)}점 / 9점
  - 오류 감지: {test_results.get('test4', {}).get('error_detection', 0)}점 / 9점
  - 자기 조절: {test_results.get('test4', {}).get('self_control', 0)}점 / 9점

### 영역 5: 자기조절 능력
- 총점: {test_results.get('test5', {}).get('score', 0)}점 / 20점
- 응답 패턴: {test_results.get('test5', {}).get('pattern', '미분석')}
- 주요 대처 유형: {test_results.get('test5', {}).get('coping_type', '미분석')}

## 분석 요청사항

위 메타인지 테스트 결과를 바탕으로 다음 내용을 분석하고 제공해 주세요:

### 1. 종합 진단
- 학생의 전반적인 메타인지 수준 평가 (상/중/하)
- 메타인지 유형 분류 (전략형/노력형/직관형/혼란형)
- 5개 영역 중 강점 영역과 약점 영역 분석

### 2. 영역별 상세 분석
각 영역에 대해:
- 점수의 의미 해석
- 학습에 미치는 영향
- 구체적인 행동 패턴 분석

### 3. 학습 코칭 제안
- 즉시 개선 가능한 학습 습관 3가지
- 장기적으로 개발해야 할 메타인지 능력
- 과목별 학습 전략 제안 (특히 취약 영역 보완)

### 4. 진학 컨설팅 연계
- 현재 메타인지 수준에서 현실적인 목표 대학 수준
- 목표 달성을 위해 필요한 메타인지 개선 사항
- 학년별(고2→고3) 학습 로드맵 제안

### 5. 학부모 안내사항
- 가정에서 지원할 수 있는 방법
- 주의해야 할 점 (과잉 개입, 비교 등)
- 학생과의 대화 포인트

### 6. 후속 관리 계획
- 1개월/3개월/6개월 후 확인해야 할 지표
- 재검사 권장 시기
- 추가로 필요한 검사나 상담

응답 형식:
- 학생과 학부모가 이해하기 쉬운 언어로 작성
- 구체적인 예시와 실천 방법 포함
- 긍정적인 강점을 먼저 언급한 후 개선점 제시
- 각 섹션은 명확하게 구분하여 작성
"""

    return prompt

@app.route('/save_complete', methods=['POST'])
def save_complete():
    """최종 결과 저장"""
    data = request.json

    # 파일명 생성
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    student_name = data.get('student_info', {}).get('name', 'unknown')
    filename = f"{DATA_DIR}/result_{student_name}_{timestamp}.json"

    # JSON 파일로 저장
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify({'status': 'success', 'filename': filename})

@app.route('/analyze_with_ai', methods=['POST'])
def analyze_with_ai():
    """AI 분석 수행"""
    data = request.json
    student_info = data.get('student_info', {})
    test_results = data.get('test_results', {})

    prompt = generate_ai_prompt(student_info, test_results)

    try:
        print("[AI 분석] 프로세스 시작...")

        result = subprocess.run(
            ['claude', '-p', '--output-format', 'text'],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=300
        )

        print(f"[AI 분석] 프로세스 종료됨 (exit code: {result.returncode})")

        if result.returncode == 0:
            return jsonify({
                'status': 'success',
                'analysis': result.stdout.strip()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'분석 오류: {result.stderr}'
            }), 500

    except subprocess.TimeoutExpired:
        return jsonify({
            'status': 'error',
            'message': '분석 시간이 초과되었습니다.'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'오류: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
