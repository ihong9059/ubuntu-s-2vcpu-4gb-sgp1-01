# -*- coding: utf-8 -*-
"""
배드민턴 동호회 인원 배치
총 50명: 남자 35명, 여자 15명
급수: A, B, C, D, E
"""

# 남자 35명 급수 배분 (실력 분포: 정규분포 형태)
# A: 4명, B: 7명, C: 12명, D: 8명, E: 4명
MALE_PLAYERS = {
    'A': ['남A1', '남A2', '남A3', '남A4'],
    'B': ['남B1', '남B2', '남B3', '남B4', '남B5', '남B6', '남B7'],
    'C': ['남C1', '남C2', '남C3', '남C4', '남C5', '남C6', '남C7', '남C8', '남C9', '남C10', '남C11', '남C12'],
    'D': ['남D1', '남D2', '남D3', '남D4', '남D5', '남D6', '남D7', '남D8'],
    'E': ['남E1', '남E2', '남E3', '남E4'],
}

# 여자 15명 급수 배분
# A: 2명, B: 3명, C: 5명, D: 3명, E: 2명
FEMALE_PLAYERS = {
    'A': ['여A1', '여A2'],
    'B': ['여B1', '여B2', '여B3'],
    'C': ['여C1', '여C2', '여C3', '여C4', '여C5'],
    'D': ['여D1', '여D2', '여D3'],
    'E': ['여E1', '여E2'],
}

# 청백 팀 배분 (급수별 균등 배분, 25:25 맞춤)
def assign_teams():
    """청팀/백팀 배분 - 25명씩 균등"""
    blue_team = {'male': [], 'female': []}
    white_team = {'male': [], 'female': []}

    # 홀수 급수는 청/백 번갈아 배정
    blue_gets_extra = True

    # 남자 배분 (목표: 청17, 백18 또는 청18, 백17)
    for grade, players in MALE_PLAYERS.items():
        half = len(players) // 2
        if len(players) % 2 == 1:
            if blue_gets_extra:
                blue_team['male'].extend([(p, grade) for p in players[:half + 1]])
                white_team['male'].extend([(p, grade) for p in players[half + 1:]])
            else:
                blue_team['male'].extend([(p, grade) for p in players[:half]])
                white_team['male'].extend([(p, grade) for p in players[half:]])
            blue_gets_extra = not blue_gets_extra
        else:
            blue_team['male'].extend([(p, grade) for p in players[:half]])
            white_team['male'].extend([(p, grade) for p in players[half:]])

    # 여자 배분 (목표: 청8, 백7 또는 청7, 백8)
    for grade, players in FEMALE_PLAYERS.items():
        half = len(players) // 2
        if len(players) % 2 == 1:
            if blue_gets_extra:
                blue_team['female'].extend([(p, grade) for p in players[:half + 1]])
                white_team['female'].extend([(p, grade) for p in players[half + 1:]])
            else:
                blue_team['female'].extend([(p, grade) for p in players[:half]])
                white_team['female'].extend([(p, grade) for p in players[half:]])
            blue_gets_extra = not blue_gets_extra
        else:
            blue_team['female'].extend([(p, grade) for p in players[:half]])
            white_team['female'].extend([(p, grade) for p in players[half:]])

    return blue_team, white_team


# 전체 선수 목록 (청백 포함)
def get_all_players_with_team():
    """모든 선수 정보 (팀 배정 포함)"""
    blue, white = assign_teams()

    players = []

    # 청팀
    for name, grade in blue['male']:
        players.append({'id': name, 'gender': 'M', 'grade': grade, 'team': '청'})
    for name, grade in blue['female']:
        players.append({'id': name, 'gender': 'F', 'grade': grade, 'team': '청'})

    # 백팀
    for name, grade in white['male']:
        players.append({'id': name, 'gender': 'M', 'grade': grade, 'team': '백'})
    for name, grade in white['female']:
        players.append({'id': name, 'gender': 'F', 'grade': grade, 'team': '백'})

    return players


def get_all_players():
    """모든 선수 정보 반환"""
    players = []

    for grade, names in MALE_PLAYERS.items():
        for name in names:
            players.append({
                'id': name,
                'name': name,
                'gender': 'M',
                'grade': grade,
                'team': None  # 청/백 배정 전
            })

    for grade, names in FEMALE_PLAYERS.items():
        for name in names:
            players.append({
                'id': name,
                'name': name,
                'gender': 'F',
                'grade': grade,
                'team': None
            })

    return players


def print_summary():
    """인원 요약 출력"""
    print("=" * 60)
    print("배드민턴 동호회 인원 배치")
    print("=" * 60)

    print("\n[남자 35명]")
    for grade, players in MALE_PLAYERS.items():
        print(f"  {grade}급 ({len(players)}명): {', '.join(players)}")

    print("\n[여자 15명]")
    for grade, players in FEMALE_PLAYERS.items():
        print(f"  {grade}급 ({len(players)}명): {', '.join(players)}")

    print("\n[청백 팀 배분]")
    blue, white = assign_teams()
    print(f"  청팀 - 남자: {len(blue['male'])}명, 여자: {len(blue['female'])}명")
    print(f"  백팀 - 남자: {len(white['male'])}명, 여자: {len(white['female'])}명")

    print("\n[경기 조건]")
    print("  - 1인당 4~5게임")
    print("  - 같은 급수: 남복 1게임 + 혼복 1게임")
    print("  - 상급자+하급자 페어: 남복 1게임 + 혼복 1게임")
    print("  - 여성: 여복 1게임 + 혼복 1게임")
    print("  - 코트 6개, 코트당 10~12게임")
    print("  - 상대/파트너 중복 금지")
    print("  - 연속 경기 피하기")


if __name__ == '__main__':
    print_summary()
