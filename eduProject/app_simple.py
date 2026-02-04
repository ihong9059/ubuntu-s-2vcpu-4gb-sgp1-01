# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify
import json
import os
import subprocess
from datetime import datetime

app = Flask(__name__, template_folder='templates_simple', static_folder='static_simple', static_url_path='/static')
app.secret_key = 'learning-style-test-2024'

# 데이터 저장 폴더
DATA_DIR = 'data_simple'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save_result', methods=['POST'])
def save_result():
    """결과 저장"""
    data = request.json
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    name = data.get('name', 'anonymous')
    filename = f"{DATA_DIR}/result_{name}_{timestamp}.json"

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify({'status': 'success'})

@app.route('/generate_prompt', methods=['POST'])
def generate_prompt():
    """AI 분석용 프롬프트 생성"""
    data = request.json

    prompt = f"""# 학습 스타일 테스트 결과 분석

## 학생 정보
- 이름: {data.get('name', '미입력')}
- 학년: {data.get('grade', '미입력')}

## 테스트 결과 (각 100점 만점)

| 영역 | 점수 | 수준 |
|------|------|------|
| 계획력 | {data.get('planning', 0)}점 | {get_level(data.get('planning', 0))} |
| 집중력 | {data.get('focus', 0)}점 | {get_level(data.get('focus', 0))} |
| 실행력 | {data.get('execution', 0)}점 | {get_level(data.get('execution', 0))} |
| 끈기 | {data.get('persistence', 0)}점 | {get_level(data.get('persistence', 0))} |
| 자기조절 | {data.get('selfcontrol', 0)}점 | {get_level(data.get('selfcontrol', 0))} |

**종합 점수**: {data.get('total', 0)}점
**학습 유형**: {data.get('type', '미분류')}

## 분석 요청

위 결과를 바탕으로 다음을 분석해주세요:

1. **학습 스타일 해석**: 이 학생의 학습 특성은?
2. **강점 활용법**: 높은 점수 영역을 어떻게 활용할 수 있을까?
3. **개선 방안**: 낮은 점수 영역을 어떻게 보완할 수 있을까?
4. **맞춤 학습법**: 이 학생에게 추천하는 구체적인 학습 방법 3가지
5. **동기부여 팁**: 학습 의욕을 높이는 방법

친근하고 이해하기 쉬운 말투로 작성해주세요.
"""
    return jsonify({'prompt': prompt})

def get_level(score):
    if score >= 80: return '상'
    if score >= 60: return '중'
    return '하'

def generate_prompt_text(data):
    """프롬프트 텍스트 생성"""
    return f"""# 학습 스타일 테스트 결과 분석

## 학생 정보
- 이름: {data.get('name', '미입력')}
- 학년: {data.get('grade', '미입력')}

## 테스트 결과 (각 100점 만점)

| 영역 | 점수 | 수준 |
|------|------|------|
| 계획력 | {data.get('planning', 0)}점 | {get_level(data.get('planning', 0))} |
| 집중력 | {data.get('focus', 0)}점 | {get_level(data.get('focus', 0))} |
| 실행력 | {data.get('execution', 0)}점 | {get_level(data.get('execution', 0))} |
| 끈기 | {data.get('persistence', 0)}점 | {get_level(data.get('persistence', 0))} |
| 자기조절 | {data.get('selfcontrol', 0)}점 | {get_level(data.get('selfcontrol', 0))} |

**종합 점수**: {data.get('total', 0)}점
**학습 유형**: {data.get('type', '미분류')}

## 분석 요청

위 결과를 바탕으로 다음을 분석해주세요:

1. **학습 스타일 해석**: 이 학생의 학습 특성은?
2. **강점 활용법**: 높은 점수 영역을 어떻게 활용할 수 있을까?
3. **개선 방안**: 낮은 점수 영역을 어떻게 보완할 수 있을까?
4. **맞춤 학습법**: 이 학생에게 추천하는 구체적인 학습 방법 3가지
5. **동기부여 팁**: 학습 의욕을 높이는 방법

친근하고 이해하기 쉬운 말투로 작성해주세요.
"""

@app.route('/analyze_with_ai', methods=['POST'])
def analyze_with_ai():
    """AI 분석 수행"""
    data = request.json
    prompt = generate_prompt_text(data)

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
            print("[AI 분석] 분석 완료, 결과 반환")
            return jsonify({
                'status': 'success',
                'analysis': result.stdout.strip()
            })
        else:
            print(f"[AI 분석] 오류 발생: {result.stderr}")
            return jsonify({
                'status': 'error',
                'message': f'분석 오류: {result.stderr}'
            }), 500

    except subprocess.TimeoutExpired:
        print("[AI 분석] 타임아웃 - 프로세스 강제 종료됨")
        return jsonify({
            'status': 'error',
            'message': '분석 시간이 초과되었습니다.'
        }), 500
    except Exception as e:
        print(f"[AI 분석] 예외 발생: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'오류: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("  학습 스타일 테스트 (간단버전)")
    print("  http://localhost:8000")
    print("=" * 50)
    app.run(debug=False, host='0.0.0.0', port=8000)
