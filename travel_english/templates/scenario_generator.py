#!/usr/bin/env python3
"""
Travel English 시나리오 생성기
템플릿을 조합하여 최종 시나리오를 생성합니다.

지원 도시: amsterdam, paris, tokyo, newyork
지원 예산: budget(최저가), economy(절감형), normal(일반)
지원 목적: tourism, backpacking, business, study, working_holiday, honeymoon, family, adventure

조합 규칙:
- 공통(50) + 도시(20) + 목적(20) + 예산(15) + 환승(0~12) = 105~117개 scene
"""

import json
import os
from datetime import datetime

TEMPLATES_DIR = os.path.dirname(os.path.abspath(__file__))

# 도시별 좌표 (지도 표시용)
CITY_COORDS = {
    'amsterdam': {'lat': 52.3676, 'lng': 4.9041},
    'paris': {'lat': 48.8566, 'lng': 2.3522},
    'tokyo': {'lat': 35.6762, 'lng': 139.6503},
    'newyork': {'lat': 40.7128, 'lng': -74.0060},
    'london': {'lat': 51.5074, 'lng': -0.1278},
    'rome': {'lat': 41.9028, 'lng': 12.4964},
    'barcelona': {'lat': 41.3851, 'lng': 2.1734},
    'bangkok': {'lat': 13.7563, 'lng': 100.5018},
    'singapore': {'lat': 1.3521, 'lng': 103.8198},
    'sydney': {'lat': -33.8688, 'lng': 151.2093},
    'dubai': {'lat': 25.2048, 'lng': 55.2708},
    'losangeles': {'lat': 34.0522, 'lng': -118.2437},
    # 새 도시 추가
    'berlin': {'lat': 52.5200, 'lng': 13.4050},
    'prague': {'lat': 50.0755, 'lng': 14.4378},
    'vienna': {'lat': 48.2082, 'lng': 16.3738},
    'osaka': {'lat': 34.6937, 'lng': 135.5023},
    'hongkong': {'lat': 22.3193, 'lng': 114.1694},
    'taipei': {'lat': 25.0330, 'lng': 121.5654},
    'miami': {'lat': 25.7617, 'lng': -80.1918},
    'chicago': {'lat': 41.8781, 'lng': -87.6298},
    'vancouver': {'lat': 49.2827, 'lng': -123.1207},
    'toronto': {'lat': 43.6532, 'lng': -79.3832}
}

# 경유지 좌표
STOPOVER_COORDS = {
    'beijing': {'city': '베이징', 'lat': 39.9042, 'lng': 116.4074},
    'moscow': {'city': '모스크바', 'lat': 55.7558, 'lng': 37.6173},
    'istanbul': {'city': '이스탄불', 'lat': 41.0082, 'lng': 28.9784},
    'dubai_stopover': {'city': '두바이', 'lat': 25.2048, 'lng': 55.2708},
    'frankfurt': {'city': '프랑크푸르트', 'lat': 50.1109, 'lng': 8.6821},
    'singapore_stopover': {'city': '싱가포르', 'lat': 1.3521, 'lng': 103.8198},
    'hongkong': {'city': '홍콩', 'lat': 22.3193, 'lng': 114.1694},
    'taipei': {'city': '타이페이', 'lat': 25.0330, 'lng': 121.5654},
    'tokyo_stopover': {'city': '도쿄', 'lat': 35.6762, 'lng': 139.6503},
    'doha': {'city': '도하', 'lat': 25.2854, 'lng': 51.5310},
}

def load_json(filename):
    """JSON 파일 로드"""
    filepath = os.path.join(TEMPLATES_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_transfer_config(city_id, budget_type):
    """
    도시와 예산에 따른 환승 경로 결정

    유럽 도시: 베이징+모스크바 / 이스탄불 / 직항
    미국 도시: 프랑크푸르트 / 도쿄 / 직항
    호주 도시: 싱가포르 / 홍콩 / 직항
    중동 도시: 홍콩 / 직항
    아시아 도시: 직항 (가까움)
    """
    transfers = load_json('transfer_templates.json')

    # 유럽행 (암스테르담, 파리, 런던, 로마, 바르셀로나, 베를린, 프라하, 비엔나)
    if city_id in ['amsterdam', 'paris', 'london', 'rome', 'barcelona', 'berlin', 'prague', 'vienna']:
        if budget_type == 'budget':
            # 최저가: 베이징 → 모스크바 경유 (2회 환승)
            return {
                'scenes': transfers['transfers']['beijing']['scenes'] + transfers['transfers']['moscow']['scenes'],
                'route': ['beijing', 'moscow']
            }
        elif budget_type == 'economy':
            # 절감형: 이스탄불 경유 (1회 환승)
            return {
                'scenes': transfers['transfers']['istanbul']['scenes'],
                'route': ['istanbul']
            }
        else:
            # 일반: 직항
            return {'scenes': [], 'route': []}

    # 미국행 (뉴욕, LA, 마이애미, 시카고)
    elif city_id in ['newyork', 'losangeles', 'miami', 'chicago']:
        if budget_type == 'budget':
            # 최저가: 프랑크푸르트 경유
            return {
                'scenes': transfers['transfers']['frankfurt']['scenes'],
                'route': ['frankfurt']
            }
        elif budget_type == 'economy':
            # 절감형: 두바이 경유
            return {
                'scenes': transfers['transfers']['dubai']['scenes'],
                'route': ['dubai_stopover']
            }
        else:
            # 일반: 직항
            return {'scenes': [], 'route': []}

    # 호주행 (시드니)
    elif city_id == 'sydney':
        if budget_type == 'budget':
            # 최저가: 홍콩 경유
            return {
                'scenes': transfers['transfers']['hongkong']['scenes'] if 'hongkong' in transfers['transfers'] else [],
                'route': ['hongkong']
            }
        elif budget_type == 'economy':
            # 절감형: 싱가포르 경유
            return {
                'scenes': transfers['transfers']['singapore']['scenes'] if 'singapore' in transfers['transfers'] else [],
                'route': ['singapore_stopover']
            }
        else:
            # 일반: 직항
            return {'scenes': [], 'route': []}

    # 중동행 (두바이)
    elif city_id == 'dubai':
        if budget_type == 'budget':
            # 최저가: 홍콩 경유
            return {
                'scenes': transfers['transfers']['hongkong']['scenes'] if 'hongkong' in transfers['transfers'] else [],
                'route': ['hongkong']
            }
        elif budget_type == 'economy':
            # 절감형: 타이페이 경유
            return {
                'scenes': transfers['transfers']['taipei']['scenes'] if 'taipei' in transfers['transfers'] else [],
                'route': ['taipei']
            }
        else:
            # 일반: 직항
            return {'scenes': [], 'route': []}

    # 동남아시아 (방콕, 싱가포르) - 가까우므로 경유 거의 없음
    elif city_id in ['bangkok', 'singapore']:
        if budget_type == 'budget':
            # 최저가: 홍콩 경유 (저가항공 환승)
            return {
                'scenes': transfers['transfers']['hongkong']['scenes'] if 'hongkong' in transfers['transfers'] else [],
                'route': ['hongkong']
            }
        else:
            # 일반/절감형: 직항
            return {'scenes': [], 'route': []}

    # 일본행 (도쿄, 오사카) - 가까우므로 경유 없음
    elif city_id in ['tokyo', 'osaka']:
        return {'scenes': [], 'route': []}

    # 홍콩/타이페이 - 가까우므로 직항 or 저가는 경유
    elif city_id in ['hongkong', 'taipei']:
        if budget_type == 'budget':
            # 최저가: 경유 노선이지만 가까우므로 직항 LCC
            return {'scenes': [], 'route': []}
        else:
            return {'scenes': [], 'route': []}

    # 캐나다행 (밴쿠버, 토론토)
    elif city_id in ['vancouver', 'toronto']:
        if budget_type == 'budget':
            # 최저가: 프랑크푸르트 경유
            return {
                'scenes': transfers['transfers']['frankfurt']['scenes'],
                'route': ['frankfurt']
            }
        elif budget_type == 'economy':
            # 절감형: 도쿄 경유
            return {
                'scenes': transfers['transfers']['tokyo']['scenes'] if 'tokyo' in transfers['transfers'] else [],
                'route': ['tokyo_stopover']
            }
        else:
            return {'scenes': [], 'route': []}

    else:
        return {'scenes': [], 'route': []}

def generate_scenario(city_id, budget_type, purpose_type):
    """
    시나리오 생성

    Args:
        city_id: 도시 ID (예: 'amsterdam', 'paris', 'tokyo', 'newyork')
        budget_type: 예산 타입 ('budget', 'economy', 'normal')
        purpose_type: 목적 타입 ('tourism', 'backpacking', 'business', 'study',
                                 'working_holiday', 'honeymoon', 'family', 'adventure')

    Returns:
        완성된 시나리오 JSON
    """

    # 1. 템플릿 로드
    common = load_json('common_template.json')
    budgets = load_json('budget_templates.json')

    # 목적별 템플릿 로드 (1/2)
    purposes1 = load_json('purpose_templates_1.json')
    purposes2 = load_json('purpose_templates_2.json')

    # 목적 템플릿 병합
    all_purposes = {**purposes1['templates'], **purposes2['templates']}

    city = load_json(f'city_{city_id}.json')

    # 2. 각 템플릿에서 씬 추출
    common_scenes = common['scenes']  # 50개
    budget_scenes = budgets['templates'][budget_type]['scenes']  # 15개
    purpose_scenes = all_purposes[purpose_type]['scenes']  # 20개
    city_scenes = city['scenes']  # 20개

    # 예산과 도시에 따른 환승 설정
    transfer_config = get_transfer_config(city_id, budget_type)
    transfer_scenes = transfer_config['scenes']

    # 3. 씬 조합 및 Day 배정
    all_scenes = []
    scene_idx = 0

    # Day 1: 공항 출발 + 기내 (공통 1-18) - 첫 번째 비행
    for scene in common_scenes[:18]:
        scene_copy = scene.copy()
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # 환승 씬 삽입 (기내 씬 이후, 입국 전)
    for scene in transfer_scenes:
        scene_copy = scene.copy()
        scene_copy['day'] = 1
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # Day 1 후반: 입국/도착 + 호텔 체크인 (공통 19-31)
    for scene in common_scenes[18:31]:
        scene_copy = scene.copy()
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # Day 2-8: 도시별 관광 + 예산별 + 목적별 혼합
    # 도시별 씬을 Day 2-8에 분산
    for i, scene in enumerate(city_scenes):
        scene_copy = scene.copy()
        scene_copy['day'] = 2 + (i % 7)  # Day 2-8
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # 목적별 씬을 Day 2-9에 분산
    for i, scene in enumerate(purpose_scenes):
        scene_copy = scene.copy()
        scene_copy['day'] = 2 + (i % 8)  # Day 2-9
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # 예산별 씬을 전체에 분산 (숙박, 식사, 교통 관련)
    for i, scene in enumerate(budget_scenes):
        scene_copy = scene.copy()
        scene_copy['day'] = 2 + (i % 8)  # Day 2-9
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # Day 9-10: 호텔 + 귀국 (공통 32-50)
    for scene in common_scenes[31:]:
        scene_copy = scene.copy()
        if scene['id'].startswith('C04') or scene['id'].startswith('C05'):
            scene_copy['day'] = 10
        else:
            scene_copy['day'] = 9
        scene_copy['sceneIndex'] = scene_idx
        all_scenes.append(scene_copy)
        scene_idx += 1

    # 4. Day별로 정렬
    all_scenes.sort(key=lambda x: (x.get('day', 1), x.get('sceneIndex', 0)))

    # 5. 최종 sceneIndex 재할당
    for i, scene in enumerate(all_scenes):
        scene['sceneIndex'] = i

    # 6. 시나리오 메타데이터 생성
    budget_names = {'budget': '최저가', 'economy': '절감형', 'normal': '일반'}
    purpose_names = {
        'tourism': '관광', 'backpacking': '배낭여행', 'business': '출장',
        'study': '어학연수', 'working_holiday': '워홀', 'honeymoon': '신혼여행',
        'family': '가족여행', 'adventure': '모험'
    }

    dest_coord = CITY_COORDS.get(city_id, CITY_COORDS['amsterdam'])

    # 경로 생성
    route = [{"city": "서울", "lat": 37.5665, "lng": 126.9780}]
    for stopover_id in transfer_config['route']:
        stopover = STOPOVER_COORDS[stopover_id]
        route.append({
            "city": stopover['city'],
            "lat": stopover['lat'],
            "lng": stopover['lng']
        })
    route.append({
        "city": city['cityName'],
        "lat": dest_coord['lat'],
        "lng": dest_coord['lng']
    })

    scenario = {
        "info": {
            "departure": "서울/인천",
            "destination": city['cityName'],
            "country": city['country'],
            "purpose": purpose_names[purpose_type],
            "budget": budget_names[budget_type],
            "duration": "10일",
            "sceneCount": len(all_scenes),
            "generatedAt": datetime.now().isoformat(),
            "templateVersion": "2.0"
        },
        "composition": {
            "common": len(common_scenes),
            "city": len(city_scenes),
            "purpose": len(purpose_scenes),
            "budget": len(budget_scenes),
            "transfer": len(transfer_scenes)
        },
        "route": route,
        "scenes": all_scenes
    }

    return scenario


def save_scenario(scenario, output_path):
    """시나리오를 JSON 파일로 저장"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(scenario, f, ensure_ascii=False, indent=2)
    print(f"시나리오 저장: {output_path}")
    print(f"  목적지: {scenario['info']['destination']} ({scenario['info']['country']})")
    print(f"  예산: {scenario['info']['budget']}, 목적: {scenario['info']['purpose']}")
    print(f"  총 {scenario['info']['sceneCount']}개 scene (환승: {scenario['composition']['transfer']}개)")


def generate_all_combinations(city_id):
    """특정 도시의 모든 예산/목적 조합 생성"""
    budgets = ['budget', 'economy', 'normal']
    purposes = ['tourism', 'backpacking', 'business', 'study',
                'working_holiday', 'honeymoon', 'family', 'adventure']

    output_dir = os.path.join(TEMPLATES_DIR, '..', 'scenarios', 'generated')
    os.makedirs(output_dir, exist_ok=True)

    count = 0
    for budget in budgets:
        for purpose in purposes:
            scenario = generate_scenario(city_id, budget, purpose)
            filename = f"{city_id}_{budget}_{purpose}.json"
            output_path = os.path.join(output_dir, filename)
            save_scenario(scenario, output_path)
            count += 1

    print(f"\n총 {count}개 시나리오 생성 완료!")


def generate_all_cities():
    """모든 도시의 모든 조합 생성"""
    cities = ['amsterdam', 'paris', 'tokyo', 'newyork',
              'london', 'rome', 'barcelona', 'bangkok',
              'singapore', 'sydney', 'dubai', 'losangeles',
              # 새 도시
              'berlin', 'prague', 'vienna', 'osaka',
              'hongkong', 'taipei', 'miami', 'chicago',
              'vancouver', 'toronto']
    total = 0

    for city_id in cities:
        print(f"\n=== {city_id.upper()} 시나리오 생성 ===")
        generate_all_combinations(city_id)
        total += 24  # 3 budgets × 8 purposes

    print(f"\n{'='*50}")
    print(f"전체 {total}개 시나리오 생성 완료!")


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("사용법:")
        print("  python scenario_generator.py <city_id> [budget] [purpose]")
        print("  python scenario_generator.py amsterdam normal tourism")
        print("  python scenario_generator.py amsterdam --all  # 한 도시 모든 조합")
        print("  python scenario_generator.py --all-cities     # 모든 도시 모든 조합")
        print()
        print("지원 도시: amsterdam, paris, tokyo, newyork, london, rome, barcelona,")
        print("          bangkok, singapore, sydney, dubai, losangeles,")
        print("          berlin, prague, vienna, osaka, hongkong, taipei,")
        print("          miami, chicago, vancouver, toronto")
        print("지원 예산: budget, economy, normal")
        print("지원 목적: tourism, backpacking, business, study,")
        print("          working_holiday, honeymoon, family, adventure")
        sys.exit(1)

    if sys.argv[1] == '--all-cities':
        generate_all_cities()
    elif len(sys.argv) == 3 and sys.argv[2] == '--all':
        city_id = sys.argv[1]
        generate_all_combinations(city_id)
    elif len(sys.argv) >= 4:
        city_id = sys.argv[1]
        budget = sys.argv[2]
        purpose = sys.argv[3]
        scenario = generate_scenario(city_id, budget, purpose)

        output_dir = os.path.join(TEMPLATES_DIR, '..', 'scenarios', 'generated')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{city_id}_{budget}_{purpose}.json")
        save_scenario(scenario, output_path)
    else:
        city_id = sys.argv[1]
        # 기본값: 해당 도시 일반 관광
        scenario = generate_scenario(city_id, 'normal', 'tourism')
        output_dir = os.path.join(TEMPLATES_DIR, '..', 'scenarios', 'generated')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{city_id}_normal_tourism.json")
        save_scenario(scenario, output_path)
